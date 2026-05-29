import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

/**
 * POST /api/razorpay/verify-payment
 *
 * Verifies a Razorpay Subscription payment after checkout.
 * For subscriptions, the signature is:
 *   HMAC_SHA256(razorpay_payment_id + "|" + razorpay_subscription_id, secret)
 *
 * After verification:
 *   1. Activates the subscription in the database
 *   2. Updates the user's workspace plan
 *   3. Logs the event
 *
 * Required env vars:
 *   - RAZORPAY_KEY_ID
 *   - RAZORPAY_KEY_SECRET
 *   - SUPABASE_URL (or VITE_SUPABASE_URL)
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
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
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
    const {
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
      billing_interval,
    } = req.body;

    if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Missing payment verification details." });
    }

    // ===== CRITICAL: Verify the payment signature =====
    // For subscriptions: HMAC_SHA256(payment_id + "|" + subscription_id, secret)
    const expectedSignature = crypto
      .createHmac("sha256", razorpayKeySecret)
      .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.error("SUBSCRIPTION SIGNATURE VERIFICATION FAILED!", {
        subscriptionId: razorpay_subscription_id,
        paymentId: razorpay_payment_id,
        userId: user.id,
      });

      // Log failed verification
      await supabase.from("subscription_events").insert({
        user_id: user.id,
        event_type: "signature_failed",
        razorpay_subscription_id,
        razorpay_payment_id,
        metadata: { error: "Signature mismatch" },
        created_at: new Date().toISOString(),
      });

      return res.status(400).json({
        success: false,
        message: "Payment signature verification failed. If money was deducted, it will be refunded automatically. Please contact support.",
      });
    }

    // ===== Signature is VALID — payment is authentic! =====

    // Fetch subscription details from Razorpay to get plan info
    const rzpAuth = `Basic ${Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString("base64")}`;
    let subscriptionData: any = null;

    try {
      const subResponse = await fetch(`https://api.razorpay.com/v1/subscriptions/${razorpay_subscription_id}`, {
        headers: { Authorization: rzpAuth },
      });
      if (subResponse.ok) {
        subscriptionData = await subResponse.json();
      }
    } catch (e) {
      console.error("Failed to fetch subscription details from Razorpay:", e);
    }

    // Determine plan based on billing_interval or subscription data
    const subscriptionPlan = billing_interval === "yearly" ? "pro_annual" : "pro";
    const periodStart = new Date();
    const periodEnd = new Date();
    if (billing_interval === "yearly") {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    // Use Razorpay subscription dates if available
    if (subscriptionData?.current_start) {
      periodStart.setTime(subscriptionData.current_start * 1000);
    }
    if (subscriptionData?.current_end) {
      periodEnd.setTime(subscriptionData.current_end * 1000);
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
        razorpay_subscription_id: razorpay_subscription_id,
        razorpay_plan_id: subscriptionData?.plan_id || null,
        razorpay_customer_id: subscriptionData?.customer_id || null,
        updated_at: new Date().toISOString(),
      } as any)
      .eq("owner_id", user.id);

    // Try with owner_user_id if owner_id didn't match
    if (updateError) {
      const { error: updateError2 } = await supabase
        .from("creator_workspaces")
        .update({
          plan: subscriptionPlan,
          subscription_status: "active",
          subscription_start: periodStart.toISOString(),
          subscription_end: periodEnd.toISOString(),
          razorpay_payment_id: razorpay_payment_id,
          razorpay_subscription_id: razorpay_subscription_id,
          razorpay_plan_id: subscriptionData?.plan_id || null,
          razorpay_customer_id: subscriptionData?.customer_id || null,
          updated_at: new Date().toISOString(),
        } as any)
        .eq("owner_user_id", user.id);

      if (updateError2) {
        console.error("Failed to update workspace after successful payment:", updateError2);
        return res.status(500).json({
          success: false,
          message: `Payment received but upgrade failed. Please contact support with Payment ID: ${razorpay_payment_id}`,
        });
      }
    }

    // Log the successful activation event
    await supabase.from("subscription_events").insert({
      user_id: user.id,
      event_type: "activated",
      razorpay_subscription_id,
      razorpay_payment_id,
      amount: subscriptionData?.amount || null,
      currency: subscriptionData?.currency || "INR",
      metadata: {
        plan: subscriptionPlan,
        billing_interval,
        subscription_status: subscriptionData?.status,
        current_start: subscriptionData?.current_start,
        current_end: subscriptionData?.current_end,
      },
      created_at: new Date().toISOString(),
    });

    return res.status(200).json({
      success: true,
      message: "Payment verified! Your Flowora Pro subscription is now active.",
      plan: subscriptionPlan,
      payment_id: razorpay_payment_id,
      subscription_id: razorpay_subscription_id,
      subscription_end: periodEnd.toISOString(),
    });
  } catch (error: any) {
    console.error("Error in verify-payment:", error);
    return res.status(500).json({ success: false, message: "Internal server error. Please contact support." });
  }
}
