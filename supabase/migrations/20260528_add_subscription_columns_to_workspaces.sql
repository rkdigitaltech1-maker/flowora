-- ============================================================================
-- Migration: Add subscription columns to creator_workspaces
-- Description: Adds columns needed by the verify-razorpay-payment edge function
--              to track active subscriptions after successful payment.
-- Run this in Supabase SQL Editor or via `supabase db push`
-- ============================================================================

-- Add subscription-related columns (safe: uses IF NOT EXISTS pattern)
DO $$
BEGIN
  -- Subscription status: active, trialing, canceled, past_due, expired
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'creator_workspaces' AND column_name = 'subscription_status'
  ) THEN
    ALTER TABLE creator_workspaces
      ADD COLUMN subscription_status TEXT DEFAULT 'inactive'
      CHECK (subscription_status IN ('inactive', 'active', 'trialing', 'canceled', 'past_due', 'expired'));
  END IF;

  -- Subscription period start
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'creator_workspaces' AND column_name = 'subscription_start'
  ) THEN
    ALTER TABLE creator_workspaces ADD COLUMN subscription_start TIMESTAMPTZ;
  END IF;

  -- Subscription period end
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'creator_workspaces' AND column_name = 'subscription_end'
  ) THEN
    ALTER TABLE creator_workspaces ADD COLUMN subscription_end TIMESTAMPTZ;
  END IF;

  -- Last Razorpay payment ID (for quick reference / support lookups)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'creator_workspaces' AND column_name = 'razorpay_payment_id'
  ) THEN
    ALTER TABLE creator_workspaces ADD COLUMN razorpay_payment_id TEXT;
  END IF;

  -- Last Razorpay order ID
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'creator_workspaces' AND column_name = 'razorpay_order_id'
  ) THEN
    ALTER TABLE creator_workspaces ADD COLUMN razorpay_order_id TEXT;
  END IF;

  -- Ensure 'plan' column exists (it likely does, but just in case)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'creator_workspaces' AND column_name = 'plan'
  ) THEN
    ALTER TABLE creator_workspaces ADD COLUMN plan TEXT DEFAULT 'free';
  END IF;

  -- Ensure 'updated_at' column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'creator_workspaces' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE creator_workspaces ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
  END IF;
END $$;

-- Index on owner_id for fast lookups in edge functions
CREATE INDEX IF NOT EXISTS idx_creator_workspaces_owner_id
  ON creator_workspaces(owner_id);

-- Index on subscription status for admin queries
CREATE INDEX IF NOT EXISTS idx_creator_workspaces_subscription_status
  ON creator_workspaces(subscription_status);

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON COLUMN creator_workspaces.subscription_status IS 'Current subscription state: inactive, active, trialing, canceled, past_due, expired';
COMMENT ON COLUMN creator_workspaces.subscription_start IS 'Start of current billing period';
COMMENT ON COLUMN creator_workspaces.subscription_end IS 'End of current billing period (auto-renewal or expiry date)';
COMMENT ON COLUMN creator_workspaces.razorpay_payment_id IS 'Most recent successful Razorpay payment ID for support reference';
COMMENT ON COLUMN creator_workspaces.razorpay_order_id IS 'Most recent Razorpay order ID for support reference';
