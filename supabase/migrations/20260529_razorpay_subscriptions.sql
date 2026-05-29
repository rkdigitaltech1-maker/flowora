-- ============================================================================
-- Migration: Razorpay Subscriptions Integration
-- Description: Adds razorpay_plans table and updates creator_workspaces for
--              Razorpay Subscriptions API (recurring billing).
-- Run this in Supabase SQL Editor
-- ============================================================================

-- ─── Razorpay Plans Table ─────────────────────────────────────────────────────
-- Stores the plan IDs from your Razorpay Dashboard (Plans tab)
CREATE TABLE IF NOT EXISTS razorpay_plans (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  razorpay_plan_id  TEXT NOT NULL UNIQUE,           -- e.g., plan_SvAD1ggJGNLSfH
  name              TEXT NOT NULL,                   -- e.g., 'Pro Monthly', 'Pro Yearly'
  internal_plan_id  TEXT NOT NULL,                   -- e.g., 'pro', 'pro_annual'
  amount            INTEGER NOT NULL,                -- Amount in paise (58900 = ₹589)
  currency          TEXT NOT NULL DEFAULT 'INR',     -- INR or USD
  billing_interval  TEXT NOT NULL,                   -- 'monthly' or 'yearly'
  billing_period    INTEGER NOT NULL DEFAULT 1,      -- e.g., 1 month or 1 year
  description       TEXT,
  is_active         BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert your actual Razorpay plans
INSERT INTO razorpay_plans (razorpay_plan_id, name, internal_plan_id, amount, currency, billing_interval, billing_period, description)
VALUES
  ('plan_SvAD1ggJGNLSfH', 'Pro Monthly', 'pro', 58900, 'INR', 'monthly', 1, 'Flowora Pro - Monthly billing at ₹589/mo'),
  ('plan_SvAE7qhjB6LnlE', 'Pro Yearly', 'pro_annual', 565000, 'INR', 'yearly', 1, 'Flowora Pro - Annual billing at ₹5,650/yr')
ON CONFLICT (razorpay_plan_id) DO NOTHING;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_razorpay_plans_internal ON razorpay_plans(internal_plan_id);
CREATE INDEX IF NOT EXISTS idx_razorpay_plans_active ON razorpay_plans(is_active);

-- RLS
ALTER TABLE razorpay_plans ENABLE ROW LEVEL SECURITY;

-- Everyone can read plans (needed for checkout)
CREATE POLICY "Anyone can view active plans"
  ON razorpay_plans FOR SELECT
  USING (is_active = true);

-- Only service role can manage plans
CREATE POLICY "Service role manages plans"
  ON razorpay_plans FOR ALL
  USING (auth.role() = 'service_role');

-- ─── Add Razorpay Subscription columns to creator_workspaces ──────────────────
DO $$
BEGIN
  -- Razorpay subscription ID (e.g., sub_SvAGRHYFqRs2Y9)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'creator_workspaces' AND column_name = 'razorpay_subscription_id'
  ) THEN
    ALTER TABLE creator_workspaces ADD COLUMN razorpay_subscription_id TEXT;
  END IF;

  -- Razorpay customer ID
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'creator_workspaces' AND column_name = 'razorpay_customer_id'
  ) THEN
    ALTER TABLE creator_workspaces ADD COLUMN razorpay_customer_id TEXT;
  END IF;

  -- Razorpay plan ID reference
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'creator_workspaces' AND column_name = 'razorpay_plan_id'
  ) THEN
    ALTER TABLE creator_workspaces ADD COLUMN razorpay_plan_id TEXT;
  END IF;
END $$;

-- Indexes for subscription lookups
CREATE INDEX IF NOT EXISTS idx_creator_workspaces_razorpay_sub
  ON creator_workspaces(razorpay_subscription_id);

-- ─── Subscription Events Log ──────────────────────────────────────────────────
-- Tracks every subscription lifecycle event (for audit and debugging)
CREATE TABLE IF NOT EXISTS subscription_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id    UUID,
  event_type      TEXT NOT NULL,       -- created | authenticated | activated | charged | completed | cancelled | halted | paused | resumed | pending
  razorpay_subscription_id TEXT,
  razorpay_payment_id      TEXT,
  amount          INTEGER,             -- Amount in paise
  currency        TEXT DEFAULT 'INR',
  metadata        JSONB,               -- Full webhook/API payload for debugging
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscription_events_user ON subscription_events(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_sub ON subscription_events(razorpay_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_type ON subscription_events(event_type);

ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription events"
  ON subscription_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role manages subscription events"
  ON subscription_events FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================================
COMMENT ON TABLE razorpay_plans IS 'Stores Razorpay plan IDs mapped to internal plan tiers';
COMMENT ON TABLE subscription_events IS 'Audit log of all subscription lifecycle events from Razorpay';
COMMENT ON COLUMN creator_workspaces.razorpay_subscription_id IS 'Active Razorpay subscription ID for this workspace';
COMMENT ON COLUMN creator_workspaces.razorpay_customer_id IS 'Razorpay customer ID linked to this workspace owner';
COMMENT ON COLUMN creator_workspaces.razorpay_plan_id IS 'Current Razorpay plan ID for the active subscription';
