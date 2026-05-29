import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

/**
 * POST /api/razorpay/create-order
 *
 * Creates a Razorpay Subscription using the Subscriptions API.
 * Uses pre-created plan IDs from Razorpay Dashboard.
 *
 * Flow:
 *   1. Validates user session
 *   2. Maps billing_interval to Razorpay plan_id
 *   3. Creates a subscription via Razorpay Subscriptions API
 *   4. Returns subscription_id for the frontend to open checkout
 *
 * Required env vars:
 *   - RAZORPAY_KEY_ID
 *   - RAZORPAY_KEY_SECRET
 *   - SUPABASE_URL (or VITE_SUPABASE_URL)
 *   - SUPABASE_SERVICE_ROLE_KEY
 */

// Map billing intervals to your Razorpay plan IDs
const RAZORPAY_PLAN_IDS: Record<string, string> = {
  monthly: "plan_SvAD1ggJGNLSfH",   // Pro Monthly ₹589/mo
  yearly: "plan_SvAE7qhjB6LnlE",    // Pro Yearly ₹5,650/yr
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "authorization, content-type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Validate environment
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error("Razorpay credentials not configured");
      return res.status(500).json({ error: "Payment gateway not configured. Please contact support." });
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Supabase credentials not configured");
      return res.status(500).json({ error: "Backend not configured. Please contact support." });
    }

    // Verify the user is authenticated
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

    // Parse and validate request body
    const { billing_interval, customer_name, customer_email, customer_phone } = req.body;

    if (!billing_interval) {
      return res.status(400).json({ error: "Missing required field: billing_interval" });
    }

    if (!["monthly", "yearly"].includes(billing_interval)) {
      return res.status(400).json({ error: "Invalid billing interval. Must be monthly or yearly." });
    }

    // Get the Razorpay plan ID
    const razorpayPlanId = RAZORPAY_PLAN_IDS[billing_interval];
    if (!razorpayPlanId) {
      return res.status(400).json({ error: "No plan configured for this billing interval." });
    }

    // Auth header for Razorpay API
    const rzpAuth = `Basic ${Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString("base64")}`;

    // Create a Razorpay subscription
    const subscriptionPayload: any = {
      plan_id: razorpayPlanId,
      total_count: billing_interval === "yearly" ? 10 : 120, // Max billing cycles
      quantity: 1,
      notes: {
        user_id: user.id,
        user_email: user.email || customer_email || "",
        billing_interval: billing_interval,
        platform: "flowora",
      },
    };

    // Add customer details if provided
    if (customer_email || user.email) {
      subscriptionPayload.customer_notify = 1;
    }

    const rzpResponse = await fetch("https://api.razorpay.com/v1/subscriptions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: rzpAuth,
      },
      body: JSON.stringify(subscriptionPayload),
    });

    if (!rzpResponse.ok) {
      const errorBody = await rzpResponse.text();
      console.error("Razorpay subscription creation failed:", rzpResponse.status, errorBody);
      return res.status(500).json({
        error: "Failed to create subscription. Please try again.",
        details: process.env.NODE_ENV === "development" ? errorBody : undefined,
      });
    }

    const subscription = await rzpResponse.json();

    // Log the subscription creation event
    await supabase.from("subscription_events").insert({
      user_id: user.id,
      event_type: "created",
      razorpay_subscription_id: subscription.id,
      metadata: {
        plan_id: razorpayPlanId,
        billing_interval,
        short_url: subscription.short_url,
        status: subscription.status,
      },
      created_at: new Date().toISOString(),
    }).then(({ error }) => {
      if (error) console.error("Failed to log subscription event:", error);
    });

    // Return the subscription details for the frontend
    return res.status(200).json({
      subscription_id: subscription.id,
      razorpay_plan_id: razorpayPlanId,
      short_url: subscription.short_url, // Backup: hosted payment page link
      status: subscription.status,
      billing_interval,
    });
  } catch (error: any) {
    console.error("Error in create-order:", error);
    return res.status(500).json({ error: "Internal server error. Please try again." });
  }
}
