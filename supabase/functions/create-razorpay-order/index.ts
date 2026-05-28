/**
 * Supabase Edge Function: create-razorpay-order
 *
 * Creates a Razorpay order using the server-side secret key.
 * This ensures the order amount cannot be tampered with on the client.
 *
 * Required env vars (set in Supabase Dashboard → Edge Functions → Secrets):
 *   - RAZORPAY_KEY_ID
 *   - RAZORPAY_KEY_SECRET
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID")!;
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
    // Verify the user is authenticated
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse request body
    const { amount, currency, plan_id, billing_interval, promo_code, discount_percent } = await req.json();

    if (!amount || !currency || !plan_id || !billing_interval) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate amount server-side based on plan
    // Pro plan pricing (in smallest unit: paise for INR, cents for USD)
    const PLAN_PRICES: Record<string, Record<string, { monthly: number; annual: number }>> = {
      pro: {
        INR: { monthly: 49900, annual: 478800 }, // ₹499/mo or ₹4788/yr (₹399/mo)
        USD: { monthly: 599, annual: 5988 },      // $5.99/mo or $59.88/yr ($4.99/mo)
      },
    };

    const planPrices = PLAN_PRICES.pro?.[currency];
    if (!planPrices) {
      return new Response(JSON.stringify({ error: "Invalid plan or currency" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Calculate expected amount (server-side validation to prevent tampering)
    let expectedAmount = billing_interval === "yearly" ? planPrices.annual : planPrices.monthly;

    // Apply discount if promo code is valid
    if (promo_code && discount_percent > 0) {
      // Validate promo code server-side
      const validPromos: Record<string, number> = {
        CREATOR50: 50,
        LAUNCH20: 20,
      };
      const validDiscount = validPromos[promo_code.toUpperCase()];
      if (validDiscount && validDiscount === discount_percent) {
        expectedAmount = Math.round(expectedAmount * (1 - validDiscount / 100));
      }
    }

    // Add tax (18% GST for INR, 8% for USD)
    const taxRate = currency === "INR" ? 0.18 : 0.08;
    const amountWithTax = Math.round(expectedAmount * (1 + taxRate));

    // Create Razorpay order via their API
    const receipt = `flowora_${user.id.slice(0, 8)}_${Date.now()}`;

    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)}`,
      },
      body: JSON.stringify({
        amount: amountWithTax,
        currency: currency,
        receipt: receipt,
        notes: {
          user_id: user.id,
          plan_id: plan_id,
          billing_interval: billing_interval,
          promo_code: promo_code || "",
        },
      }),
    });

    if (!razorpayResponse.ok) {
      const errorBody = await razorpayResponse.text();
      console.error("Razorpay order creation failed:", errorBody);
      return new Response(JSON.stringify({ error: "Failed to create payment order" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const order = await razorpayResponse.json();

    // Store order in database for tracking
    await supabase.from("payment_orders").insert({
      order_id: order.id,
      user_id: user.id,
      amount: amountWithTax,
      currency: currency,
      plan_id: plan_id,
      billing_interval: billing_interval,
      promo_code: promo_code || null,
      status: "created",
      receipt: receipt,
      created_at: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: receipt,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Error in create-razorpay-order:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
