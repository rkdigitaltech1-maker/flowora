/**
 * Razorpay Payment Integration (Client-Side)
 *
 * Flow:
 *   1. User clicks "Pay" → calls /api/razorpay/create-order (server validates price)
 *   2. Razorpay checkout modal opens → user pays via UPI/card/netbanking
 *   3. On success → calls /api/razorpay/verify-payment (server verifies HMAC signature)
 *   4. Server updates DB → user gets Pro access
 *
 * The upgrade ONLY happens after server-side signature verification.
 */

import { supabase } from "./supabase";

// Razorpay public key (safe for frontend)
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID as string;

export interface RazorpayOrderParams {
  amount: number; // Amount in smallest currency unit (paise for INR, cents for USD)
  currency: "INR" | "USD";
  planId: string;
  billingInterval: "monthly" | "yearly";
  promoCode?: string;
  discountPercent?: number;
}

export interface RazorpayPaymentResult {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayCheckoutOptions {
  orderId: string;
  amount: number;
  currency: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  description?: string;
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
 * Create a Razorpay order via our Vercel serverless API.
 * The server creates the order with validated pricing (prevents amount tampering).
 */
export async function createRazorpayOrder(params: RazorpayOrderParams): Promise<{
  id: string;
  amount: number;
  currency: string;
}> {
  const accessToken = await getAccessToken();

  const response = await fetch("/api/razorpay/create-order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      currency: params.currency,
      plan_id: params.planId,
      billing_interval: params.billingInterval,
      promo_code: params.promoCode || null,
      discount_percent: params.discountPercent || 0,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to create payment order. Please try again.");
  }

  if (!data.order_id) {
    throw new Error("Invalid order response from server.");
  }

  return {
    id: data.order_id,
    amount: data.amount,
    currency: data.currency,
  };
}

/**
 * Open Razorpay Checkout modal.
 * Returns a promise that resolves with payment details on success,
 * or rejects if the user cancels or payment fails.
 */
export function openRazorpayCheckout(options: RazorpayCheckoutOptions): Promise<RazorpayPaymentResult> {
  return new Promise((resolve, reject) => {
    if (!RAZORPAY_KEY_ID) {
      reject(new Error("Razorpay is not configured. Please set VITE_RAZORPAY_KEY_ID in environment variables."));
      return;
    }

    if (!(window as any).Razorpay) {
      reject(new Error("Razorpay SDK not loaded. Please refresh the page and try again."));
      return;
    }

    const rzpOptions = {
      key: RAZORPAY_KEY_ID,
      amount: options.amount,
      currency: options.currency,
      name: "Flowora",
      description: options.description || "Flowora Pro Subscription",
      image: "/logo.png",
      order_id: options.orderId,
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
      handler: (response: RazorpayPaymentResult) => {
        if (response.razorpay_payment_id && response.razorpay_order_id && response.razorpay_signature) {
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
 * Verify payment on the server and activate the subscription.
 * The server verifies the Razorpay signature (HMAC SHA256) and updates the database.
 */
export async function verifyPaymentAndUpgrade(
  paymentResult: RazorpayPaymentResult,
  planId: string,
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
      razorpay_order_id: paymentResult.razorpay_order_id,
      razorpay_signature: paymentResult.razorpay_signature,
      plan_id: planId,
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
 * Full payment flow — orchestrates order creation, Razorpay checkout, and verification.
 *
 * This is the main function called by the checkout page.
 */
export async function processPayment(params: {
  orderParams: RazorpayOrderParams;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
}): Promise<{ success: boolean; paymentId: string }> {
  // Step 1: Create order on server (server validates the price)
  const order = await createRazorpayOrder(params.orderParams);

  // Step 2: Open Razorpay checkout modal and wait for user to pay
  const paymentResult = await openRazorpayCheckout({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    customerName: params.customerName,
    customerPhone: params.customerPhone,
    customerEmail: params.customerEmail,
    description: `Flowora Pro - ${params.orderParams.billingInterval === "yearly" ? "Annual" : "Monthly"} Plan`,
  });

  // Step 3: Verify payment signature server-side and activate subscription
  const planId = params.orderParams.billingInterval === "yearly" ? "pro_annual" : "pro";
  await verifyPaymentAndUpgrade(paymentResult, planId, params.orderParams.billingInterval);

  return {
    success: true,
    paymentId: paymentResult.razorpay_payment_id,
  };
}
