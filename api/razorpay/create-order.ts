import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

/**
 * POST /api/razorpay/create-order
 *
 * Creates a Razorpay order server-side with validated pricing.
 * Prevents frontend amount tampering by computing price on the server.
 *
 * Required env vars (set in Vercel Dashboard → Settings → Environment Variables):
 *   - RAZORPAY_KEY_ID
 *   - RAZORPAY_KEY_SECRET
 *   - VITE_SUPABASE_URL (or SUPABASE_URL)
 *   - SUPABASE_SERVICE_ROLE_KEY
 */

// Server-side plan pricing (in smallest currency unit: paise/cents)
const PLAN_PRICES: Record<string, Record<string, { monthly: number; annual: number }>> = {
  pro: {
    INR: { monthly: 49900, annual: 478800 }, // ₹499/mo or ₹4,788/yr (₹399/mo × 12)
    USD: { monthly: 599, annual: 5988 },     // $5.99/mo or $59.88/yr ($4.99/mo × 12)
  },
};

// Valid promo codes (server-side validation)
const VALID_PROMOS: Record<string, number> = {
  CREATOR50: 50,
  LAUNCH20: 20,
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
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
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
    const { currency, plan_id, billing_interval, promo_code, discount_percent } = req.body;

    if (!currency || !plan_id || !billing_interval) {
      return res.status(400).json({ error: "Missing required fields: currency, plan_id, billing_interval" });
    }

    if (!["INR", "USD"].includes(currency)) {
      return res.status(400).json({ error: "Invalid currency. Must be INR or USD." });
    }

    if (!["monthly", "yearly"].includes(billing_interval)) {
      return res.status(400).json({ error: "Invalid billing interval. Must be monthly or yearly." });
    }

    // Calculate price server-side (prevents frontend tampering)
    const planPrices = PLAN_PRICES[plan_id]?.[currency];
    if (!planPrices) {
      return res.status(400).json({ error: "Invalid plan or currency combination." });
    }

    let baseAmount = billing_interval === "yearly" ? planPrices.annual : planPrices.monthly;

    // Validate and apply promo code server-side
    if (promo_code && discount_percent > 0) {
      const validDiscount = VALID_PROMOS[promo_code.toUpperCase()];
      if (validDiscount && validDiscount === discount_percent) {
        baseAmount = Math.round(baseAmount * (1 - validDiscount / 100));
      }
      // If promo code is invalid, silently ignore (don't apply discount)
    }

    // Add tax (18% GST for INR, 8% for USD)
    const taxRate = currency === "INR" ? 0.18 : 0.08;
    const amountWithTax = Math.round(baseAmount * (1 + taxRate));

    // Create Razorpay order
    const receipt = `flowora_${user.id.slice(0, 8)}_${Date.now()}`;

    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString("base64")}`,
      },
      body: JSON.stringify({
        amount: amountWithTax,
        currency: currency,
        receipt: receipt,
        notes: {
          user_id: user.id,
          user_email: user.email || "",
          plan_id: plan_id,
          billing_interval: billing_interval,
          promo_code: promo_code || "",
        },
      }),
    });

    if (!razorpayResponse.ok) {
      const errorBody = await razorpayResponse.text();
      console.error("Razorpay order creation failed:", razorpayResponse.status, errorBody);
      return res.status(500).json({ error: "Failed to create payment order. Please try again." });
    }

    const order = await razorpayResponse.json();

    // Store order in database for tracking
    const { error: insertError } = await supabase.from("payment_orders").insert({
      order_id: order.id,
      user_id: user.id,
      amount: amountWithTax,
      currency: currency,
      plan_id: plan_id,
      billing_interval: billing_interval,
      promo_code: promo_code || null,
      discount_percent: discount_percent || 0,
      status: "created",
      receipt: receipt,
      created_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error("Failed to store order in DB:", insertError);
      // Don't fail the request — the order is still valid in Razorpay
    }

    return res.status(200).json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: receipt,
    });
  } catch (error: any) {
    console.error("Error in create-order:", error);
    return res.status(500).json({ error: "Internal server error. Please try again." });
  }
}
