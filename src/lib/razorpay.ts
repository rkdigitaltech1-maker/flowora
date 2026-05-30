/**
 * Razorpay Payment Integration (Client-Side)
 *
 * Uses Razorpay Orders API (one-time payments).
 * Amount is determined server-side based on billing interval.
 *
 * Flow:
 *   1. User clicks "Pay" → server creates Razorpay Order
 *   2. Frontend opens checkout with order_id
 *   3. User pays via UPI/Card/Netbanking
 *   4. On success → server verifies HMAC signature
 *   5. Server activates Pro in database
 */

import { supabase } from "./supabase";

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID as string;

interface PaymentResult {
  razorpay_payment_id: string;
  razorpay_order_id: string;
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
 * Full payment flow for Flowora Pro subscription.
 */
export async function processSubscriptionPayment(params: {
  billingInterval: "monthly" | "yearly";
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
}): Promise<{ success: boolean; paymentId: string }> {
  const accessToken = await getAccessToken();

  // Step 1: Create order on server
  console.log("[Razorpay] Creating order...", { billingInterval: params.billingInterval });

  const orderResponse = await fetch("/api/razorpay/create-order", {
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

  const orderData = await orderResponse.json();
  console.log("[Razorpay] Order response:", orderResponse.status, orderData);

  if (!orderResponse.ok) {
    throw new Error(orderData.error || "Failed to create payment order. Please try again.");
  }

  if (!orderData.order_id) {
    throw new Error("Invalid response from server. Please try again.");
  }

  console.log("[Razorpay] Order created successfully:", {
    order_id: orderData.order_id,
    amount: orderData.amount,
    currency: orderData.currency,
    key_id_present: !!RAZORPAY_KEY_ID,
    key_id_prefix: RAZORPAY_KEY_ID?.substring(0, 12),
  });

  // Step 2: Open Razorpay checkout modal
  const paymentResult = await openRazorpayCheckout({
    orderId: orderData.order_id,
    amount: orderData.amount,
    currency: orderData.currency || "INR",
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
      razorpay_order_id: paymentResult.razorpay_order_id,
      razorpay_signature: paymentResult.razorpay_signature,
      billing_interval: params.billingInterval,
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
 * Opens Razorpay Checkout modal with order_id.
 */
function openRazorpayCheckout(options: {
  orderId: string;
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

    console.log("[Razorpay] Opening checkout with:", {
      key: RAZORPAY_KEY_ID?.substring(0, 15) + "...",
      order_id: options.orderId,
      amount: options.amount,
      currency: options.currency,
    });

    const rzpConfig = {
      key: RAZORPAY_KEY_ID,
      amount: options.amount,
      currency: options.currency,
      name: "Flowora",
      description: `Flowora Pro - ${options.billingInterval === "yearly" ? "Annual" : "Monthly"}`,
      order_id: options.orderId,
      prefill: {
        name: options.customerName,
        contact: options.customerPhone,
        ...(options.customerEmail && { email: options.customerEmail }),
      },
      theme: {
        color: "#6d48ff",
      },
      handler: (response: PaymentResult) => {
        console.log("[Razorpay] Payment SUCCESS:", response);
        if (response.razorpay_payment_id && response.razorpay_order_id && response.razorpay_signature) {
          resolve(response);
        } else {
          reject(new Error("Incomplete payment response. Please contact support."));
        }
      },
      modal: {
        ondismiss: () => {
          console.log("[Razorpay] Modal dismissed by user");
          reject(new Error("Payment cancelled by user."));
        },
      },
    };

    const rzp = new (window as any).Razorpay(rzpConfig);

    rzp.on("payment.failed", (response: any) => {
      console.error("[Razorpay] Payment FAILED:", JSON.stringify(response?.error || response, null, 2));
      const desc = response?.error?.description || "Payment failed.";
      const code = response?.error?.code || "UNKNOWN";
      const reason = response?.error?.reason || "";
      reject(new Error(`${desc} (Code: ${code}, Reason: ${reason})`));
    });

    rzp.open();
  });
}
