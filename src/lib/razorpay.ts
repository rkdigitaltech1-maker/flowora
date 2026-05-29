/**
 * Razorpay Subscription Payment Integration (Client-Side)
 *
 * Flow:
 *   1. User clicks "Pay" → calls /api/razorpay/create-order (creates Razorpay subscription)
 *   2. Razorpay checkout modal opens with subscription_id
 *   3. User pays via UPI/card/netbanking
 *   4. On success → calls /api/razorpay/verify-payment (verifies HMAC signature)
 *   5. Server activates subscription in DB → user gets Pro access
 */

import { supabase } from "./supabase";

// Razorpay public key (safe for frontend)
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID as string;

export interface SubscriptionPaymentResult {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
}

/**
 * Get the current user's access token for API calls.
 */
async function getAccessToken(): Promise<string> {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData?.session?.access_token;
  if (!accessToken) {
    throw new Error("You must be logged in to make a payment. Please sign in and try again.");
  }
  return accessToken;
}

/**
 * Create a Razorpay Subscription via our server API.
 * The server creates the subscription using pre-configured plan IDs.
 */
export async function createSubscription(params: {
  billingInterval: "monthly" | "yearly";
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
}): Promise<{
  subscriptionId: string;
  razorpayPlanId: string;
  shortUrl: string;
}> {
  const accessToken = await getAccessToken();

  const response = await fetch("/api/razorpay/create-order", {
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

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to create subscription. Please try again.");
  }

  if (!data.subscription_id) {
    throw new Error("Invalid response from server. Please try again.");
  }

  return {
    subscriptionId: data.subscription_id,
    razorpayPlanId: data.razorpay_plan_id,
    shortUrl: data.short_url || "",
  };
}

/**
 * Open Razorpay Checkout modal for subscription payment.
 * Returns a promise that resolves with payment details on success.
 */
export function openRazorpaySubscriptionCheckout(options: {
  subscriptionId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  description?: string;
}): Promise<SubscriptionPaymentResult> {
  return new Promise((resolve, reject) => {
    if (!RAZORPAY_KEY_ID) {
      reject(new Error("Razorpay is not configured. Please set VITE_RAZORPAY_KEY_ID."));
      return;
    }

    if (!(window as any).Razorpay) {
      reject(new Error("Razorpay SDK not loaded. Please refresh the page and try again."));
      return;
    }

    const rzpOptions = {
      key: RAZORPAY_KEY_ID,
      subscription_id: options.subscriptionId,
      name: "Flowora",
      description: options.description || "Flowora Pro Subscription",
      image: "/logo.png",
      prefill: {
        name: options.customerName,
        contact: options.customerPhone,
        ...(options.customerEmail && { email: options.customerEmail }),
      },
      theme: {
        color: "#6d48ff",
        backdrop_color: "rgba(15, 10, 30, 0.75)",
      },
      modal: {
        ondismiss: () => {
          reject(new Error("Payment cancelled by user."));
        },
        confirm_close: true,
        escape: true,
      },
      handler: (response: SubscriptionPaymentResult) => {
        if (response.razorpay_payment_id && response.razorpay_subscription_id && response.razorpay_signature) {
          resolve(response);
        } else {
          reject(new Error("Payment response is incomplete. Please contact support."));
        }
      },
    };

    const rzp = new (window as any).Razorpay(rzpOptions);

    rzp.on("payment.failed", (response: any) => {
      const errorDesc = response?.error?.description || "Payment failed. Please try again.";
      const errorCode = response?.error?.code || "UNKNOWN";
      reject(new Error(`Payment failed (${errorCode}): ${errorDesc}`));
    });

    rzp.open();
  });
}

/**
 * Verify subscription payment on the server and activate Pro.
 */
export async function verifySubscriptionPayment(
  paymentResult: SubscriptionPaymentResult,
  billingInterval: "monthly" | "yearly"
): Promise<{ success: boolean; message: string }> {
  const accessToken = await getAccessToken();

  const response = await fetch("/api/razorpay/verify-payment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      razorpay_payment_id: paymentResult.razorpay_payment_id,
      razorpay_subscription_id: paymentResult.razorpay_subscription_id,
      razorpay_signature: paymentResult.razorpay_signature,
      billing_interval: billingInterval,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Payment verification failed. Please contact support.");
  }

  if (!data.success) {
    throw new Error(data.message || "Payment could not be verified. Please contact support.");
  }

  return { success: true, message: data.message || "Subscription activated!" };
}

/**
 * Full subscription payment flow — orchestrates creation, checkout, and verification.
 * This is the main function called by the checkout page.
 */
export async function processSubscriptionPayment(params: {
  billingInterval: "monthly" | "yearly";
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
}): Promise<{ success: boolean; paymentId: string; subscriptionId: string }> {
  // Step 1: Create subscription on server
  const { subscriptionId } = await createSubscription({
    billingInterval: params.billingInterval,
    customerName: params.customerName,
    customerEmail: params.customerEmail,
    customerPhone: params.customerPhone,
  });

  // Step 2: Open Razorpay checkout modal for the subscription
  const paymentResult = await openRazorpaySubscriptionCheckout({
    subscriptionId,
    customerName: params.customerName,
    customerPhone: params.customerPhone,
    customerEmail: params.customerEmail,
    description: `Flowora Pro - ${params.billingInterval === "yearly" ? "Annual" : "Monthly"} Plan`,
  });

  // Step 3: Verify payment signature server-side and activate subscription
  await verifySubscriptionPayment(paymentResult, params.billingInterval);

  return {
    success: true,
    paymentId: paymentResult.razorpay_payment_id,
    subscriptionId: paymentResult.razorpay_subscription_id,
  };
}
