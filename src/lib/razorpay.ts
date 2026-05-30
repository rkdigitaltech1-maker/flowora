/**
 * Razorpay Payment Integration (Client-Side)
 *
 * Supports both:
 *   - Subscriptions (auto-recurring) — if server returns subscription_id
 *   - One-time Orders (fallback) — if server returns order_id
 *
 * Flow:
 *   1. User clicks "Pay" → server tries to create subscription, falls back to order
 *   2. Frontend opens checkout with subscription_id or order_id
 *   3. User pays via UPI/Card/Netbanking
 *   4. On success → server verifies HMAC signature & activates Pro
 *   5. Razorpay handles auto-renewal (for subscriptions)
 */

import { supabase } from "./supabase";

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID as string;

interface PaymentResult {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_subscription_id?: string;
  razorpay_signature: string;
}

async function getAccessToken(): Promise<string> {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData?.session?.access_token;
  if (!accessToken) {
    throw new Error("You must be logged in to make a payment. Please sign in and try again.");
  }
  return accessToken;
}

/**
 * Full payment flow for Flowora Pro.
 * Handles both subscription and one-time order modes automatically.
 */
export async function processSubscriptionPayment(params: {
  billingInterval: "monthly" | "yearly";
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
}): Promise<{ success: boolean; paymentId: string }> {
  const accessToken = await getAccessToken();

  // Step 1: Create subscription/order on server
  console.log("[Razorpay] Creating payment...", { billingInterval: params.billingInterval });

  const createResponse = await fetch("/api/razorpay/create-order", {
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
  console.log("[Razorpay] Server response:", createResponse.status, createData);

  if (!createResponse.ok) {
    throw new Error(createData.error || "Failed to create payment. Please try again.");
  }

  // Step 2: Open Razorpay checkout (subscription or order mode)
  const isSubscription = createData.type === "subscription" && createData.subscription_id;

  console.log("[Razorpay] Opening checkout:", {
    type: isSubscription ? "subscription" : "order",
    id: isSubscription ? createData.subscription_id : createData.order_id,
    amount: createData.amount,
  });

  const paymentResult = await openCheckout({
    subscriptionId: isSubscription ? createData.subscription_id : undefined,
    orderId: !isSubscription ? createData.order_id : undefined,
    amount: createData.amount,
    currency: createData.currency || "INR",
    customerName: params.customerName,
    customerPhone: params.customerPhone,
    customerEmail: params.customerEmail,
    billingInterval: params.billingInterval,
  });

  // Step 3: Verify payment on server
  const verifyResponse = await fetch("/api/razorpay/verify-payment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      razorpay_payment_id: paymentResult.razorpay_payment_id,
      razorpay_order_id: paymentResult.razorpay_order_id || null,
      razorpay_subscription_id: paymentResult.razorpay_subscription_id || null,
      razorpay_signature: paymentResult.razorpay_signature,
      billing_interval: params.billingInterval,
      type: isSubscription ? "subscription" : "order",
    }),
  });

  const verifyData = await verifyResponse.json();

  if (!verifyResponse.ok || !verifyData.success) {
    throw new Error(verifyData.message || "Payment verification failed. Please contact support.");
  }

  return {
    success: true,
    paymentId: paymentResult.razorpay_payment_id,
  };
}

/**
 * Opens Razorpay Checkout modal.
 * Supports both subscription_id and order_id modes.
 */
function openCheckout(options: {
  subscriptionId?: string;
  orderId?: string;
  amount: number;
  currency: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  billingInterval: string;
}): Promise<PaymentResult> {
  return new Promise((resolve, reject) => {
    if (!RAZORPAY_KEY_ID) {
      reject(new Error("Razorpay is not configured. Please contact support."));
      return;
    }

    if (!(window as any).Razorpay) {
      reject(new Error("Razorpay SDK not loaded. Please refresh the page."));
      return;
    }

    const rzpConfig: any = {
      key: RAZORPAY_KEY_ID,
      name: "Flowora",
      description: `Flowora Pro - ${options.billingInterval === "yearly" ? "Annual" : "Monthly"}`,
      prefill: {
        name: options.customerName,
        contact: options.customerPhone,
        ...(options.customerEmail && { email: options.customerEmail }),
      },
      theme: { color: "#6d48ff" },
      handler: (response: any) => {
        console.log("[Razorpay] Payment SUCCESS:", response);
        if (response.razorpay_payment_id && response.razorpay_signature) {
          resolve({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id || undefined,
            razorpay_subscription_id: response.razorpay_subscription_id || undefined,
            razorpay_signature: response.razorpay_signature,
          });
        } else {
          reject(new Error("Incomplete payment response. Please contact support."));
        }
      },
      modal: {
        ondismiss: () => reject(new Error("Payment cancelled by user.")),
      },
    };

    // Use subscription_id for recurring, order_id for one-time
    if (options.subscriptionId) {
      rzpConfig.subscription_id = options.subscriptionId;
    } else if (options.orderId) {
      rzpConfig.order_id = options.orderId;
      rzpConfig.amount = options.amount;
      rzpConfig.currency = options.currency;
    }

    console.log("[Razorpay] Checkout config:", {
      key: RAZORPAY_KEY_ID?.substring(0, 15) + "...",
      subscription_id: rzpConfig.subscription_id || "N/A",
      order_id: rzpConfig.order_id || "N/A",
      amount: rzpConfig.amount,
    });

    const rzp = new (window as any).Razorpay(rzpConfig);

    rzp.on("payment.failed", (response: any) => {
      console.error("[Razorpay] Payment FAILED:", response?.error);
      const desc = response?.error?.description || "Payment failed.";
      const code = response?.error?.code || "";
      reject(new Error(`${desc}${code ? ` (${code})` : ""}`));
    });

    rzp.open();
  });
}
