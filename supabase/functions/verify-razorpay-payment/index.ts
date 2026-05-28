/**
 * Supabase Edge Function: verify-razorpay-payment
 *
 * Verifies the Razorpay payment signature server-side using HMAC SHA256.
 * If valid, activates the user's Pro subscription in the database.
 *
 * Required env vars (set in Supabase Dashboard → Edge Functions → Secrets):
 *   - RAZORPAY_KEY_SECRET
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts";

const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify user authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ success: false, message: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ success: false, message: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse request body
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, plan_id, billing_interval } = await req.json();

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return new Response(JSON.stringify({ success: false, message: "Missing payment details" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify the payment signature using HMAC SHA256
    // Razorpay signature = HMAC_SHA256(order_id + "|" + payment_id, secret)
    const expectedSignature = createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.error("Signature verification failed!", {
        expected: expectedSignature,
        received: razorpay_signature,
        orderId: razorpay_order_id,
      });

      // Mark order as failed
      await supabase
        .from("payment_orders")
        .update({ status: "signature_failed", payment_id: razorpay_payment_id })
        .eq("order_id", razorpay_order_id);

      return new Response(
        JSON.stringify({ success: false, message: "Payment signature verification failed. Contact support." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Signature is valid — payment is authentic!
    // Update the payment order status
    await supabase
      .from("payment_orders")
      .update({
        status: "paid",
        payment_id: razorpay_payment_id,
        verified_at: new Date().toISOString(),
      })
      .eq("order_id", razorpay_order_id);

    // Activate the user's Pro subscription
    const subscriptionPlan = billing_interval === "yearly" ? "pro_annual" : "pro";
    const periodStart = new Date();
    const periodEnd = new Date();
    if (billing_interval === "yearly") {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    // Update the user's workspace plan
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
      console.error("Failed to update workspace:", updateError);
      // Payment was successful but upgrade failed — needs manual resolution
      return new Response(
        JSON.stringify({
          success: false,
          message: "Payment received but upgrade failed. Please contact support with payment ID: " + razorpay_payment_id,
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Payment verified and subscription activated!",
        plan: subscriptionPlan,
        payment_id: razorpay_payment_id,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error in verify-razorpay-payment:", err);
    return new Response(JSON.stringify({ success: false, message: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
