-- ============================================================
-- AFFILIATE MODULE - Database Schema
-- Flowora 25% Recurring Commission Program (11 months)
-- ============================================================

-- 1. AFFILIATES TABLE - Core affiliate profiles
CREATE TABLE IF NOT EXISTS affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Personal Info
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  
  -- Affiliate Identity
  affiliate_code TEXT NOT NULL UNIQUE, -- e.g., "priya2026" - used in referral links
  referral_link TEXT GENERATED ALWAYS AS ('https://flowora.com/ref/' || affiliate_code) STORED,
  
  -- Status & Approval
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'active', 'suspended', 'rejected')),
  approved_at TIMESTAMPTZ,
  approved_by TEXT, -- admin who approved
  rejection_reason TEXT,
  
  -- Payment Info
  payment_method TEXT CHECK (payment_method IN ('upi', 'paypal', 'bank_transfer')),
  payment_details JSONB DEFAULT '{}', -- { upi_id, paypal_email, bank_name, account_number, ifsc_code, swift_code }
  
  -- Agreement
  agreement_accepted BOOLEAN DEFAULT FALSE,
  agreement_accepted_at TIMESTAMPTZ,
  agreement_version TEXT DEFAULT '1.0',
  agreement_ip TEXT,
  
  -- Promotion Channels
  promotion_channels TEXT[] DEFAULT '{}', -- ['social_media', 'email', 'blog', 'youtube', 'website']
  website_url TEXT,
  social_handles JSONB DEFAULT '{}', -- { instagram, youtube, twitter, linkedin }
  
  -- Commission Settings
  commission_rate NUMERIC(5,2) NOT NULL DEFAULT 25.00, -- 25% default
  commission_duration_months INTEGER NOT NULL DEFAULT 11, -- 11 months recurring
  
  -- Stats (denormalized for performance)
  total_referrals INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  total_earnings NUMERIC(12,2) DEFAULT 0.00,
  total_paid NUMERIC(12,2) DEFAULT 0.00,
  pending_balance NUMERIC(12,2) DEFAULT 0.00,
  
  -- Metadata
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. REFERRALS TABLE - Track every referral click/signup
CREATE TABLE IF NOT EXISTS affiliate_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  
  -- Referred User Info
  referred_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  referred_email TEXT,
  referred_name TEXT,
  
  -- Tracking
  referral_code TEXT NOT NULL, -- the affiliate_code used
  source TEXT, -- utm_source
  medium TEXT, -- utm_medium (social, email, blog, etc.)
  campaign TEXT, -- utm_campaign
  landing_page TEXT, -- which page they landed on
  ip_address TEXT,
  user_agent TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'clicked' CHECK (status IN ('clicked', 'signed_up', 'converted', 'expired', 'refunded')),
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  signed_up_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ, -- when they became a paying customer
  
  -- Cookie/Session Tracking
  tracking_cookie TEXT,
  cookie_expires_at TIMESTAMPTZ,
  attribution_window_days INTEGER DEFAULT 30, -- 30-day cookie window
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. COMMISSIONS TABLE - Individual commission records
CREATE TABLE IF NOT EXISTS affiliate_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  referral_id UUID NOT NULL REFERENCES affiliate_referrals(id) ON DELETE CASCADE,
  
  -- Transaction Info
  order_id TEXT, -- reference to the payment/subscription
  subscription_id TEXT,
  
  -- Commission Details
  sale_amount NUMERIC(12,2) NOT NULL, -- original sale amount
  commission_rate NUMERIC(5,2) NOT NULL, -- rate at time of earning (25%)
  commission_amount NUMERIC(12,2) NOT NULL, -- calculated commission
  currency TEXT NOT NULL DEFAULT 'INR',
  
  -- Recurring Tracking
  month_number INTEGER NOT NULL DEFAULT 1, -- which month (1-11)
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_start_date DATE,
  recurring_end_date DATE, -- start + 11 months
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'cancelled', 'refunded')),
  approved_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  payout_id UUID, -- references affiliate_payouts
  
  -- Metadata
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. PAYOUTS TABLE - Payment disbursements to affiliates
CREATE TABLE IF NOT EXISTS affiliate_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  
  -- Payout Details
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  payment_method TEXT NOT NULL, -- upi, paypal, bank_transfer
  payment_details JSONB DEFAULT '{}', -- snapshot of payment info at time of payout
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  
  -- Processing Info
  transaction_id TEXT, -- external payment reference
  processed_at TIMESTAMPTZ,
  processed_by TEXT, -- admin who processed
  failure_reason TEXT,
  
  -- Period
  period_start DATE,
  period_end DATE,
  
  -- Invoice
  invoice_number TEXT,
  invoice_url TEXT,
  
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. AFFILIATE CLICKS TABLE - Raw click tracking (high volume)
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  
  -- Click Info
  ip_address TEXT,
  user_agent TEXT,
  referer TEXT,
  landing_page TEXT,
  
  -- UTM Parameters
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  
  -- Device Info
  device_type TEXT, -- mobile, desktop, tablet
  browser TEXT,
  country TEXT,
  city TEXT,
  
  -- Deduplication
  is_unique BOOLEAN DEFAULT TRUE,
  session_id TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. AFFILIATE SETTINGS TABLE - Global program configuration
CREATE TABLE IF NOT EXISTS affiliate_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Program Settings
  program_name TEXT DEFAULT 'Flowora Affiliate Program',
  program_active BOOLEAN DEFAULT TRUE,
  
  -- Commission Configuration
  default_commission_rate NUMERIC(5,2) DEFAULT 25.00,
  commission_duration_months INTEGER DEFAULT 11,
  minimum_payout_amount NUMERIC(12,2) DEFAULT 500.00, -- minimum ₹500 to request payout
  payout_frequency TEXT DEFAULT 'monthly', -- monthly, bi-weekly, on-demand
  cookie_duration_days INTEGER DEFAULT 30,
  
  -- Auto-Approval
  auto_approve_affiliates BOOLEAN DEFAULT FALSE,
  require_agreement BOOLEAN DEFAULT TRUE,
  
  -- Program Terms
  agreement_text TEXT,
  agreement_version TEXT DEFAULT '1.0',
  
  -- Branding
  program_description TEXT,
  promotional_materials JSONB DEFAULT '[]', -- array of { title, type, url, description }
  
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by TEXT
);

-- 7. AFFILIATE NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS affiliate_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  
  type TEXT NOT NULL, -- 'commission_earned', 'payout_sent', 'referral_signup', 'status_change', 'announcement'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_affiliates_user_id ON affiliates(user_id);
CREATE INDEX idx_affiliates_status ON affiliates(status);
CREATE INDEX idx_affiliates_code ON affiliates(affiliate_code);
CREATE INDEX idx_affiliates_email ON affiliates(email);

CREATE INDEX idx_referrals_affiliate_id ON affiliate_referrals(affiliate_id);
CREATE INDEX idx_referrals_status ON affiliate_referrals(status);
CREATE INDEX idx_referrals_referred_user ON affiliate_referrals(referred_user_id);
CREATE INDEX idx_referrals_code ON affiliate_referrals(referral_code);

CREATE INDEX idx_commissions_affiliate_id ON affiliate_commissions(affiliate_id);
CREATE INDEX idx_commissions_status ON affiliate_commissions(status);
CREATE INDEX idx_commissions_referral_id ON affiliate_commissions(referral_id);
CREATE INDEX idx_commissions_payout_id ON affiliate_commissions(payout_id);

CREATE INDEX idx_payouts_affiliate_id ON affiliate_payouts(affiliate_id);
CREATE INDEX idx_payouts_status ON affiliate_payouts(status);

CREATE INDEX idx_clicks_affiliate_id ON affiliate_clicks(affiliate_id);
CREATE INDEX idx_clicks_code ON affiliate_clicks(referral_code);
CREATE INDEX idx_clicks_created ON affiliate_clicks(created_at);

CREATE INDEX idx_notifications_affiliate ON affiliate_notifications(affiliate_id);
CREATE INDEX idx_notifications_unread ON affiliate_notifications(affiliate_id, is_read) WHERE is_read = FALSE;

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-update updated_at on affiliates
CREATE OR REPLACE FUNCTION update_affiliate_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_affiliates_updated
  BEFORE UPDATE ON affiliates
  FOR EACH ROW
  EXECUTE FUNCTION update_affiliate_timestamp();

-- Auto-update affiliate stats when commission is created
CREATE OR REPLACE FUNCTION update_affiliate_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE affiliates SET
      total_earnings = total_earnings + NEW.commission_amount,
      pending_balance = pending_balance + NEW.commission_amount
    WHERE id = NEW.affiliate_id;
  END IF;
  
  IF TG_OP = 'UPDATE' AND NEW.status = 'paid' AND OLD.status != 'paid' THEN
    UPDATE affiliates SET
      total_paid = total_paid + NEW.commission_amount,
      pending_balance = pending_balance - NEW.commission_amount
    WHERE id = NEW.affiliate_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_commission_stats
  AFTER INSERT OR UPDATE ON affiliate_commissions
  FOR EACH ROW
  EXECUTE FUNCTION update_affiliate_stats();

-- Auto-update referral count
CREATE OR REPLACE FUNCTION update_referral_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE affiliates SET total_referrals = total_referrals + 1
    WHERE id = NEW.affiliate_id;
  END IF;
  
  IF TG_OP = 'UPDATE' AND NEW.status = 'converted' AND OLD.status != 'converted' THEN
    UPDATE affiliates SET total_conversions = total_conversions + 1
    WHERE id = NEW.affiliate_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_referral_count
  AFTER INSERT OR UPDATE ON affiliate_referrals
  FOR EACH ROW
  EXECUTE FUNCTION update_referral_count();

-- ============================================================
-- SEED DATA - Default affiliate settings
-- ============================================================

INSERT INTO affiliate_settings (
  program_name,
  program_active,
  default_commission_rate,
  commission_duration_months,
  minimum_payout_amount,
  cookie_duration_days,
  program_description,
  agreement_version
) VALUES (
  'Flowora Affiliate Program',
  TRUE,
  25.00,
  11,
  500.00,
  30,
  'Earn 25% recurring commission on every customer you refer for their first 11 months of subscription.',
  '1.0'
) ON CONFLICT DO NOTHING;
