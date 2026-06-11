/**
 * Stripe Payment Integration (Client-Side)
 *
 * Flow:
 *   1. User clicks "Pay" → create Stripe checkout session
 *   2. Redirect to Stripe Checkout
 *   3. User completes payment
 *   4. Webhook verifies payment and activates Pro
 *   5. Redirect to success page
 */

import { supabase } from "./supabase";

async function getAccessToken(): Promise<string> {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData?.session?.access_token;
  if (!accessToken) {
    throw new Error("You must be logged in to make a payment. Please sign in and try again.");
  }
  return accessToken;
}

/**
 * Process subscription payment via Stripe.
 * Redirects to Stripe Checkout hosted page.
 */
export async function processStripePayment(params: {
  billingInterval: "monthly" | "yearly";
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
}): Promise<{ success: boolean; sessionId: string }> {
  const accessToken = await getAccessToken();

  console.log("[Stripe] Creating checkout session...", { billingInterval: params.billingInterval });

  // Create checkout session on server
  const createResponse = await fetch("/api/stripe/create-checkout-session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      billing_interval: params.billingInterval,
      customer_name: params.customerName,
      customer_email: params.customerEmail || undefined,
      customer_phone: params.customerPhone || undefined,
    }),
  });

  const createData = await createResponse.json();
  console.log("[Stripe] Server response:", createResponse.status, createData);

  if (!createResponse.ok) {
    throw new Error(createData.error || "Failed to create checkout session. Please try again.");
  }

  const checkoutUrl = createData.url;
  if (!checkoutUrl) {
    throw new Error("Failed to create Stripe checkout session. Please try again.");
  }

  window.location.href = checkoutUrl;

  return {
    success: true,
    sessionId: createData.session_id,
  };
}

/**
 * Check if a Stripe session is successful
 */
export async function verifyStripeSession(sessionId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/stripe/verify-session?session_id=${sessionId}`);
    const data = await response.json();
    return data.success === true;
  } catch (err) {
    console.error("[Stripe] Error verifying session:", err);
    return false;
  }
}
