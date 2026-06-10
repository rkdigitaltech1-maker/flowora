import React, { useState } from "react";
import { processStripePayment } from "../../lib/stripe";
import { processRazorpayPayment } from "../../lib/razorpay";

type Props = {
  defaultInterval?: "monthly" | "yearly";
};

export default function Checkout({ defaultInterval = "monthly" }: Props) {
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">(defaultInterval);
  const [currency, setCurrency] = useState<"USD" | "INR">("USD");
  const [gateway, setGateway] = useState<"stripe" | "razorpay">("stripe");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePay() {
    setError(null);
    setLoading(true);
    try {
      if (gateway === "stripe") {
        // Stripe Checkout is generally used for non-IN payments (international)
        await processStripePayment({ billingInterval, customerName: "", customerEmail: undefined });
      } else {
        const result = await processRazorpayPayment({ billingInterval, customerName: "", customerEmail: undefined });
        if (!result || !result.success) {
          throw new Error(result?.message || "Razorpay flow did not complete");
        }
      }
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: 20 }}>
      <h3>Kilo Balance / Pro Upgrade</h3>

      <div style={{ marginBottom: 12 }}>
        <label style={{ marginRight: 8 }}>Billing:</label>
        <select value={billingInterval} onChange={(e) => setBillingInterval(e.target.value as any)}>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ marginRight: 8 }}>Currency:</label>
        <select value={currency} onChange={(e) => setCurrency(e.target.value as any)}>
          <option value="USD">USD</option>
          <option value="INR">INR</option>
        </select>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ marginRight: 8 }}>Gateway:</label>
        <select value={gateway} onChange={(e) => setGateway(e.target.value as any)}>
          <option value="stripe">Stripe</option>
          <option value="razorpay">Razorpay</option>
        </select>
      </div>

      <div style={{ marginTop: 18 }}>
        <button onClick={handlePay} disabled={loading}>
          {loading ? "Processing…" : "Pay"}
        </button>
      </div>

      {error && (
        <div style={{ marginTop: 12, color: "crimson" }}>
          {error}
        </div>
      )}
    </div>
  );
}
