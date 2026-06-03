import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

/**
 * POST /api/stripe/webhook
 *
 * Handles Stripe webhook events for subscription management.
 * Verifies payment and activates Pro subscription in Supabase.
 *
 * Events handled:
 *   - checkout.session.completed: Activate subscription
 *   - customer.subscription.deleted: Cancel subscription
 *
 * Required env vars:
 *   - STRIPE_SECRET_KEY
 *   - STRIPE_WEBHOOK_SECRET
 *   - SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY
 */

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!stripeSecretKey || !webhookSecret) {
      console.error("Stripe webhook not configured");
      return res.status(500).json({ error: "Webhook not configured" });
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Supabase not configured");
      return res.status(500).json({ error: "Backend not configured" });
    }

    const stripe = new Stripe(stripeSecretKey);
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify webhook signature
    const sig = req.headers["stripe-signature"] as string;
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        webhookSecret
      );
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).json({ error: "Webhook signature verification failed" });
    }

    console.log(`Processing Stripe webhook event: ${event.type}`);

    // Handle checkout.session.completed
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id;

      if (!userId) {
        console.warn("No user ID in checkout session");
        return res.status(400).json({ error: "Invalid session" });
      }

      try {
        // Update user subscription status in Supabase
        const { error: updateError } = await supabase
          .from("workspaces")
          .update({
            is_pro: true,
            subscription_status: "active",
            subscription_plan: "pro",
            subscription_provider: "stripe",
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            pro_activated_at: new Date().toISOString(),
          })
          .eq("owner_id", userId);

        if (updateError) {
          console.error("Error updating workspace subscription:", updateError);
          return res.status(500).json({ error: "Failed to activate subscription" });
        }

        console.log(`Subscription activated for user: ${userId}`);
      } catch (err: any) {
        console.error("Error activating subscription:", err);
        return res.status(500).json({ error: "Failed to activate subscription" });
      }
    }

    // Handle customer.subscription.deleted
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      const stripeCustomerId = subscription.customer as string;

      if (!stripeCustomerId) {
        console.warn("No customer ID in subscription");
        return res.status(400).json({ error: "Invalid subscription" });
      }

      try {
        // Find user by stripe_customer_id and deactivate subscription
        const { data: workspaces, error: fetchError } = await supabase
          .from("workspaces")
          .select("owner_id")
          .eq("stripe_customer_id", stripeCustomerId);

        if (fetchError) {
          console.error("Error finding workspace:", fetchError);
          return res.status(500).json({ error: "Failed to find workspace" });
        }

        if (workspaces && workspaces.length > 0) {
          const { error: updateError } = await supabase
            .from("workspaces")
            .update({
              is_pro: false,
              subscription_status: "cancelled",
            })
            .eq("stripe_customer_id", stripeCustomerId);

          if (updateError) {
            console.error("Error deactivating subscription:", updateError);
            return res.status(500).json({ error: "Failed to deactivate subscription" });
          }

          console.log(`Subscription cancelled for customer: ${stripeCustomerId}`);
        }
      } catch (err: any) {
        console.error("Error handling subscription deletion:", err);
        return res.status(500).json({ error: "Failed to process cancellation" });
      }
    }

    return res.status(200).json({ received: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
