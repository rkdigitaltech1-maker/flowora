import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

/**
 * POST /api/razorpay/create-order
 *
 * Creates a Razorpay Subscription for recurring billing.
 * Uses pre-created plan IDs from Razorpay Dashboard.
 * Falls back to one-time Order if subscription creation fails.
 *
 * Plans (from Razorpay Dashboard):
 *   - Pro Monthly: plan_SvAD1ggJGNLSfH (₹589/mo)
 *   - Pro Yearly: plan_SvAE7qhjB6LnlE (₹5,650/yr)
 *
 * Required env vars:
 *   - RAZORPAY_KEY_ID
 *   - RAZORPAY_KEY_SECRET
 *   - SUPABASE_URL (or VITE_SUPABASE_URL)
 *   - SUPABASE_SERVICE_ROLE_KEY
 */

// Razorpay Plan IDs (from your dashboard)
const RAZORPAY_PLAN_IDS: Record<string, string> = {
  monthly: "plan_SvAD1ggJGNLSfH", // Pro Monthly ₹589/mo
  yearly: "plan_SvAE7qhjB6LnlE",  // Pro Yearly ₹5,650/yr
};

// Fallback amounts for one-time orders (in paise)
const PLAN_AMOUNTS: Record<string, number> = {
  monthly: 58900,  // ₹589
  yearly: 565000,  // ₹5,650
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "authorization, content-type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!razorpayKeyId || !razorpayKeySecret) {
      return res.status(500).json({ error: "Payment gateway not configured. Please contact support." });
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

    const rzpAuth = `Basic ${Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString("base64")}`;
    const planId = RAZORPAY_PLAN_IDS[billing_interval];

    // Try creating a Razorpay Subscription (for auto-recurring)
    try {
      const subPayload: any = {
        plan_id: planId,
        total_count: billing_interval === "yearly" ? 10 : 120,
        quantity: 1,
        customer_notify: 1,
        notes: {
          user_id: user.id,
          user_email: user.email || customer_email || "",
          billing_interval,
          platform: "flowora",
        },
      };

      const subResponse = await fetch("https://api.razorpay.com/v1/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: rzpAuth },
        body: JSON.stringify(subPayload),
      });

      if (subResponse.ok) {
        const subscription = await subResponse.json();
        console.log("Subscription created:", subscription.id, subscription.status);

        return res.status(200).json({
          subscription_id: subscription.id,
          type: "subscription",
          amount: PLAN_AMOUNTS[billing_interval],
          currency: "INR",
          billing_interval,
          short_url: subscription.short_url,
        });
      }

      // If subscription creation fails, log and fall through to orders
      const subError = await subResponse.text();
      console.warn("Subscription creation failed, falling back to order:", subResponse.status, subError);
    } catch (subErr) {
      console.warn("Subscription API error, falling back to order:", subErr);
    }

    // Fallback: Create a one-time Razorpay Order
    const amount = PLAN_AMOUNTS[billing_interval];
    const receipt = `flowora_${user.id.slice(0, 8)}_${Date.now()}`;

    const orderResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: rzpAuth },
      body: JSON.stringify({
        amount,
        currency: "INR",
        receipt,
        notes: {
          user_id: user.id,
          user_email: user.email || customer_email || "",
          billing_interval,
          platform: "flowora",
        },
      }),
    });

    if (!orderResponse.ok) {
      const errorBody = await orderResponse.text();
      console.error("Razorpay order creation failed:", orderResponse.status, errorBody);
      return res.status(500).json({ error: "Failed to create payment order. Please try again." });
    }

    const order = await orderResponse.json();

    return res.status(200).json({
      order_id: order.id,
      type: "order",
      amount: order.amount,
      currency: order.currency,
      receipt,
      billing_interval,
    });
  } catch (error: any) {
    console.error("Error in create-order:", error);
    return res.status(500).json({ error: "Internal server error. Please try again." });
  }
}
