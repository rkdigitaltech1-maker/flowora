-- ============================================================================
-- Migration: Create payment_orders table
-- Description: Tracks all Razorpay payment orders for subscription upgrades.
-- Run this in Supabase SQL Editor or via `supabase db push`
-- ============================================================================

-- Payment Orders table: stores every order created via Razorpay
CREATE TABLE IF NOT EXISTS payment_orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        TEXT NOT NULL UNIQUE,           -- Razorpay order_id (e.g., order_XXXXX)
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount          INTEGER NOT NULL,               -- Amount in smallest unit (paise/cents)
  currency        TEXT NOT NULL CHECK (currency IN ('INR', 'USD')),
  plan_id         TEXT NOT NULL,                  -- e.g., 'pro', 'pro_annual'
  billing_interval TEXT NOT NULL CHECK (billing_interval IN ('monthly', 'yearly')),
  promo_code      TEXT,                           -- Applied promo code (nullable)
  discount_percent INTEGER DEFAULT 0,             -- Discount percentage applied
  status          TEXT NOT NULL DEFAULT 'created' -- created | paid | failed | signature_failed | refunded
                  CHECK (status IN ('created', 'paid', 'failed', 'signature_failed', 'refunded')),
  payment_id      TEXT,                           -- Razorpay payment_id (set after payment)
  signature       TEXT,                           -- Razorpay signature (for audit)
  receipt         TEXT,                           -- Receipt ID for tracking
  verified_at     TIMESTAMPTZ,                   -- When signature was verified
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX idx_payment_orders_user_id ON payment_orders(user_id);
CREATE INDEX idx_payment_orders_order_id ON payment_orders(order_id);
CREATE INDEX idx_payment_orders_status ON payment_orders(status);
CREATE INDEX idx_payment_orders_created_at ON payment_orders(created_at DESC);

-- Row Level Security (RLS)
ALTER TABLE payment_orders ENABLE ROW LEVEL SECURITY;

-- Users can only read their own payment orders
CREATE POLICY "Users can view own payment orders"
  ON payment_orders
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role (edge functions) can insert/update payment orders
CREATE POLICY "Service role can manage payment orders"
  ON payment_orders
  FOR ALL
  USING (auth.role() = 'service_role');

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_payment_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_payment_orders_updated_at
  BEFORE UPDATE ON payment_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_orders_updated_at();

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE payment_orders IS 'Tracks all Razorpay payment orders for Pro subscription upgrades';
COMMENT ON COLUMN payment_orders.order_id IS 'Razorpay order ID returned from /v1/orders API';
COMMENT ON COLUMN payment_orders.amount IS 'Amount in smallest currency unit (paise for INR, cents for USD)';
COMMENT ON COLUMN payment_orders.status IS 'Order lifecycle: created → paid/failed/signature_failed → refunded';
COMMENT ON COLUMN payment_orders.payment_id IS 'Razorpay payment ID, populated after successful payment';
COMMENT ON COLUMN payment_orders.verified_at IS 'Timestamp when server verified the Razorpay HMAC signature';
