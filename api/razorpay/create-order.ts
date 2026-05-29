import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

/**
 * POST /api/razorpay/create-order
 *
 * Creates a Razorpay Order (one-time payment) using the Orders API.
 * Amount is calculated server-side based on billing interval to prevent tampering.
 *
 * Plans:
 *   - Pro Monthly: ₹589/mo (₹499 + 18% GST)
 *   - Pro Yearly: ₹5,650/yr (₹4,788 + 18% GST)
 *
 * Required env vars:
 *   - RAZORPAY_KEY_ID
 *   - RAZORPAY_KEY_SECRET
 *   - SUPABASE_URL (or VITE_SUPABASE_URL)
 *   - SUPABASE_SERVICE_ROLE_KEY
 */

// Fixed plan amounts in paise (server-side, no frontend tampering)
const PLAN_AMOUNTS: Record<string, number> = {
  monthly: 58900,   // ₹589.00 (₹499 + 18% GST)
  yearly: 565000,   // ₹5,650.00 (₹4,788 + 18% GST)
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

    // Get amount from server-side pricing (prevents tampering)
    const amount = PLAN_AMOUNTS[billing_interval];
    if (!amount) {
      return res.status(400).json({ error: "Invalid billing interval." });
    }

    // Auth header for Razorpay API
    const rzpAuth = `Basic ${Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString("base64")}`;

    // Create a Razorpay Order (one-time payment)
    const receipt = `flowora_${user.id.slice(0, 8)}_${Date.now()}`;

    const rzpResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: rzpAuth,
      },
      body: JSON.stringify({
        amount: amount,
        currency: "INR",
        receipt: receipt,
        notes: {
          user_id: user.id,
          user_email: user.email || customer_email || "",
          billing_interval: billing_interval,
          customer_name: customer_name || "",
          platform: "flowora",
        },
      }),
    });

    if (!rzpResponse.ok) {
      const errorBody = await rzpResponse.text();
      console.error("Razorpay order creation failed:", rzpResponse.status, errorBody);
      return res.status(500).json({
        error: "Failed to create payment order. Please try again.",
      });
    }

    const order = await rzpResponse.json();

    // Return the order details for the frontend
    return res.status(200).json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: receipt,
      billing_interval,
    });
  } catch (error: any) {
    console.error("Error in create-order:", error);
    return res.status(500).json({ error: "Internal server error. Please try again." });
  }
}
