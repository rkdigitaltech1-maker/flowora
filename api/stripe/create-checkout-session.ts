import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

/**
 * POST /api/stripe/create-checkout-session
 *
 * Creates a Stripe Checkout Session for international (non-India) customers.
 * Uses Stripe's Checkout for one-time or subscription billing.
 *
 * Pricing:
 *   - Pro Monthly: $4.99/mo
 *   - Pro Yearly: $59.88/yr (billed annually)
 *
 * Required env vars:
 *   - STRIPE_SECRET_KEY
 *   - SUPABASE_URL (or VITE_SUPABASE_URL)
 *   - SUPABASE_SERVICE_ROLE_KEY
 */

// Stripe Prices (create these in Stripe Dashboard and add IDs here)
const STRIPE_PRICE_IDS: Record<string, string> = {
  monthly: "price_1Te9J8EF4B3py2SXOOwLT1j1", // Pro Monthly $4.99
  yearly: "price_1Te9hUEF4B3py2SXHWP51T5x",   // Pro Yearly $59.88
};

const STRIPE_PRODUCT_ID = "prod_UdQ95OUIpZ3U2K"; // Flowora Pro product ID

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "authorization, content-type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!stripeSecretKey) {
      return res.status(500).json({ error: "Stripe not configured. Please contact support." });
    }
    if (!supabaseUrl || !supabaseServiceKey) {
      return res.status(500).json({ error: "Backend not configured. Please contact support." });
    }

    // Auth check
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: "Invalid or expired session. Please log in again." });
    }

    const { billing_interval, customer_name, customer_email, customer_phone } = req.body;

    if (!billing_interval || !["monthly", "yearly"].includes(billing_interval)) {
      return res.status(400).json({ error: "Invalid billing interval. Must be monthly or yearly." });
    }

    const stripe = new Stripe(stripeSecretKey);

    const deploymentUrl = process.env.VERCEL_URL
      ? process.env.VERCEL_URL.startsWith("http")
        ? process.env.VERCEL_URL.replace(/\/$/, "")
        : `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`
      : "http://localhost:5173";

    // Determine the price ID based on billing interval
    const priceId = STRIPE_PRICE_IDS[billing_interval];
    if (!priceId) {
      return res.status(500).json({ error: "Price not configured. Please contact support." });
    }

    // Create or retrieve Stripe customer
    let customerId: string;
    const customerEmail = customer_email || user.email;

    try {
      const existingCustomers = await stripe.customers.list({
        email: customerEmail,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        customerId = existingCustomers.data[0].id;
      } else {
        const newCustomer = await stripe.customers.create({
          email: customerEmail,
          name: customer_name || user.user_metadata?.full_name || "Customer",
          phone: customer_phone || undefined,
          metadata: {
            user_id: user.id,
            billing_interval,
          },
        });
        customerId = newCustomer.id;
      }
    } catch (err) {
      console.error("Error creating/retrieving Stripe customer:", err);
      return res.status(500).json({ error: "Failed to process customer. Please try again." });
    }

    // Create Checkout Session
    try {
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: billing_interval === "yearly" ? "subscription" : "subscription",
        success_url: `${deploymentUrl}/dashboard/checkout?session_id={CHECKOUT_SESSION_ID}&status=success`,
        cancel_url: `${deploymentUrl}/dashboard/checkout?status=cancelled`,
        client_reference_id: user.id,
        metadata: {
          user_id: user.id,
          billing_interval,
          platform: "flowora",
        },
      });

      return res.status(200).json({
        session_id: session.id,
        url: session.url,
        client_secret: session.client_secret,
        stripe_publishable_key: process.env.STRIPE_PUBLISHABLE_KEY,
      });
    } catch (err: any) {
      console.error("Error creating Stripe session:", err);
      return res.status(500).json({ error: err.message || "Failed to create checkout session. Please try again." });
    }
  } catch (error: any) {
    console.error("Stripe API error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}
