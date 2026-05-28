import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

/**
 * POST /api/razorpay/verify-payment
 *
 * Verifies Razorpay payment signature (HMAC SHA256) and activates subscription.
 * This is the CRITICAL security check — only upgrades the user if the signature is valid.
 *
 * Required env vars:
 *   - RAZORPAY_KEY_SECRET
 *   - VITE_SUPABASE_URL (or SUPABASE_URL)
 *   - SUPABASE_SERVICE_ROLE_KEY
 */

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "authorization, content-type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    // Validate environment
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!razorpayKeySecret) {
      console.error("RAZORPAY_KEY_SECRET not configured");
      return res.status(500).json({ success: false, message: "Payment verification not configured." });
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Supabase credentials not configured");
      return res.status(500).json({ success: false, message: "Backend not configured." });
    }

    // Verify user authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ success: false, message: "Invalid session. Please log in again." });
    }

    // Parse request body
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, plan_id, billing_interval } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Missing payment verification details." });
    }

    // ===== CRITICAL: Verify the payment signature =====
    // Razorpay signature = HMAC_SHA256(order_id + "|" + payment_id, secret)
    const expectedSignature = crypto
      .createHmac("sha256", razorpayKeySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.error("SIGNATURE VERIFICATION FAILED!", {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        userId: user.id,
      });

      // Mark order as failed in DB
      await supabase
        .from("payment_orders")
        .update({ status: "signature_failed", payment_id: razorpay_payment_id })
        .eq("order_id", razorpay_order_id);

      return res.status(400).json({
        success: false,
        message: "Payment signature verification failed. If money was deducted, it will be refunded automatically. Please contact support.",
      });
    }

    // ===== Signature is VALID — payment is authentic! =====

    // Update payment order status
    await supabase
      .from("payment_orders")
      .update({
        status: "paid",
        payment_id: razorpay_payment_id,
        signature: razorpay_signature,
        verified_at: new Date().toISOString(),
      })
      .eq("order_id", razorpay_order_id);

    // Calculate subscription period
    const subscriptionPlan = billing_interval === "yearly" ? "pro_annual" : "pro";
    const periodStart = new Date();
    const periodEnd = new Date();
    if (billing_interval === "yearly") {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    // Activate the user's Pro subscription in the database
    const { error: updateError } = await supabase
      .from("creator_workspaces")
      .update({
        plan: subscriptionPlan,
        subscription_status: "active",
        subscription_start: periodStart.toISOString(),
        subscription_end: periodEnd.toISOString(),
        razorpay_payment_id: razorpay_payment_id,
        razorpay_order_id: razorpay_order_id,
        updated_at: new Date().toISOString(),
      })
      .eq("owner_id", user.id);

    if (updateError) {
      console.error("Failed to update workspace after successful payment:", updateError);
      return res.status(500).json({
        success: false,
        message: `Payment received but upgrade failed. Please contact support with Payment ID: ${razorpay_payment_id}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified! Your Flowora Pro subscription is now active.",
      plan: subscriptionPlan,
      payment_id: razorpay_payment_id,
      subscription_end: periodEnd.toISOString(),
    });
  } catch (error: any) {
    console.error("Error in verify-payment:", error);
    return res.status(500).json({ success: false, message: "Internal server error. Please contact support." });
  }
}
