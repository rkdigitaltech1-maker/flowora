/**
 * Razorpay Payment Integration
 *
 * This module handles:
 * 1. Creating Razorpay orders via Supabase Edge Function
 * 2. Opening the Razorpay checkout modal
 * 3. Verifying payment and upgrading the user
 *
 * Flow:
 *   User clicks "Pay" → createOrder (server) → open Razorpay modal → user pays
 *   → Razorpay callback with payment_id → verifyPayment (server) → upgrade user
 */

import { supabase } from "./supabase";

// Razorpay public key (safe for frontend)
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID as string;

export interface RazorpayOrderParams {
  amount: number; // Amount in smallest currency unit (paise for INR, cents for USD)
  currency: "INR" | "USD";
  planId: string; // e.g., "pro_monthly", "pro_annual"
  billingInterval: "monthly" | "yearly";
  promoCode?: string;
  discountPercent?: number;
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
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
 * Create a Razorpay order via Supabase Edge Function.
 * The server creates the order using the secret key and returns the order ID.
 */
export async function createRazorpayOrder(params: RazorpayOrderParams): Promise<RazorpayOrder> {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData?.session?.access_token;

  if (!accessToken) {
    throw new Error("You must be logged in to make a payment.");
  }

  const { data, error } = await supabase.functions.invoke("create-razorpay-order", {
    body: {
      amount: params.amount,
      currency: params.currency,
      plan_id: params.planId,
      billing_interval: params.billingInterval,
      promo_code: params.promoCode || null,
      discount_percent: params.discountPercent || 0,
    },
  });

  if (error) {
    throw new Error(error.message || "Failed to create payment order. Please try again.");
  }

  if (!data?.order_id) {
    throw new Error("Invalid order response from server.");
  }

  return {
    id: data.order_id,
    amount: data.amount,
    currency: data.currency,
    receipt: data.receipt || "",
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
      reject(new Error("Razorpay Key ID is not configured. Please set VITE_RAZORPAY_KEY_ID in your environment."));
      return;
    }

    if (!(window as any).Razorpay) {
      reject(new Error("Razorpay SDK not loaded. Please refresh the page and try again."));
      return;
    }

    const rzpOptions = {
      key: RAZORPAY_KEY_ID,
      amount: options.amount, // in paise/cents
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
        // Payment successful - Razorpay returns payment_id, order_id, signature
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
 * The server verifies the Razorpay signature using the secret key,
 * then updates the user's subscription in the database.
 */
export async function verifyPaymentAndUpgrade(
  paymentResult: RazorpayPaymentResult,
  planId: string,
  billingInterval: "monthly" | "yearly"
): Promise<{ success: boolean; message: string }> {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData?.session?.access_token;

  if (!accessToken) {
    throw new Error("Session expired. Please log in again.");
  }

  const { data, error } = await supabase.functions.invoke("verify-razorpay-payment", {
    body: {
      razorpay_payment_id: paymentResult.razorpay_payment_id,
      razorpay_order_id: paymentResult.razorpay_order_id,
      razorpay_signature: paymentResult.razorpay_signature,
      plan_id: planId,
      billing_interval: billingInterval,
    },
  });

  if (error) {
    throw new Error(error.message || "Payment verification failed. Please contact support.");
  }

  if (!data?.success) {
    throw new Error(data?.message || "Payment could not be verified. Please contact support.");
  }

  return { success: true, message: data.message || "Subscription activated!" };
}

/**
 * Full payment flow helper - orchestrates order creation, checkout, and verification.
 */
export async function processPayment(params: {
  orderParams: RazorpayOrderParams;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
}): Promise<{ success: boolean; paymentId: string }> {
  // Step 1: Create order on server
  const order = await createRazorpayOrder(params.orderParams);

  // Step 2: Open Razorpay checkout and wait for payment
  const paymentResult = await openRazorpayCheckout({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    customerName: params.customerName,
    customerPhone: params.customerPhone,
    customerEmail: params.customerEmail,
    description: `Flowora Pro - ${params.orderParams.billingInterval === "yearly" ? "Annual" : "Monthly"} Plan`,
  });

  // Step 3: Verify payment and activate subscription
  const planId = params.orderParams.billingInterval === "yearly" ? "pro_annual" : "pro";
  await verifyPaymentAndUpgrade(paymentResult, planId, params.orderParams.billingInterval);

  return {
    success: true,
    paymentId: paymentResult.razorpay_payment_id,
  };
}
