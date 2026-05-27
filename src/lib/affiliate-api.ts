/**
 * Affiliate Module - Backend API & Business Logic
 * Handles all affiliate operations: CRUD, commission calculation, tracking, payouts
 */

import { supabase } from "./supabase.ts";
import type { Database } from "./supabase-types.ts";

type Affiliate = Database["public"]["Tables"]["affiliates"]["Row"];
type AffiliateInsert = Database["public"]["Tables"]["affiliates"]["Insert"];
type AffiliateReferral = Database["public"]["Tables"]["affiliate_referrals"]["Row"];
type Commission = Database["public"]["Tables"]["affiliate_commissions"]["Row"];
type Payout = Database["public"]["Tables"]["affiliate_payouts"]["Row"];


// ═══════════════════════════════════════════════════════════
// AFFILIATE REGISTRATION & MANAGEMENT
// ═══════════════════════════════════════════════════════════

/**
 * Generate a unique affiliate code from a name
 */
export function generateAffiliateCode(name: string): string {
  const base = name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8);
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}${suffix}`;
}

/**
 * Register a new affiliate (application)
 */
export async function registerAffiliate(data: {
  fullName: string;
  email: string;
  phone?: string;
  websiteUrl?: string;
  channels: string[];
  socialHandles: Record<string, string>;
  paymentMethod: "upi" | "paypal" | "bank_transfer";
  paymentDetails: Record<string, string>;
  userId?: string;
}): Promise<{ success: boolean; affiliate?: Affiliate; error?: string }> {
  try {
    const affiliateCode = generateAffiliateCode(data.fullName);

    const { data: affiliate, error } = await supabase
      .from("affiliates")
      .insert({
        user_id: data.userId || null,
        full_name: data.fullName,
        email: data.email,
        phone: data.phone || null,
        affiliate_code: affiliateCode,
        status: "pending",
        payment_method: data.paymentMethod,
        payment_details: data.paymentDetails,
        promotion_channels: data.channels,
        website_url: data.websiteUrl || null,
        social_handles: data.socialHandles,
        commission_rate: 25.00,
        commission_duration_months: 11,
        agreement_accepted: true,
        agreement_accepted_at: new Date().toISOString(),
        agreement_version: "1.0",
      } as any)
      .select()
      .single();

    if (error) throw error;
    return { success: true, affiliate: affiliate as Affiliate };
  } catch (err: any) {
    return { success: false, error: err.message || "Registration failed" };
  }
}


/**
 * Get affiliate by user ID
 */
export async function getAffiliateByUserId(userId: string) {
  const { data, error } = await supabase
    .from("affiliates")
    .select("*")
    .eq("user_id", userId)
    .single();
  return { affiliate: data as Affiliate | null, error };
}

/**
 * Get affiliate by code
 */
export async function getAffiliateByCode(code: string) {
  const { data, error } = await supabase
    .from("affiliates")
    .select("*")
    .eq("affiliate_code", code)
    .single();
  return { affiliate: data as Affiliate | null, error };
}

/**
 * Admin: Get all affiliates with filters
 */
export async function getAllAffiliates(filters?: {
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  let query = supabase.from("affiliates").select("*", { count: "exact" });

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }
  if (filters?.search) {
    query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,affiliate_code.ilike.%${filters.search}%`);
  }
  if (filters?.limit) query = query.limit(filters.limit);
  if (filters?.offset) query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);

  query = query.order("created_at", { ascending: false });

  const { data, error, count } = await query;
  return { affiliates: (data || []) as Affiliate[], error, total: count || 0 };
}

/**
 * Admin: Approve an affiliate
 */
export async function approveAffiliate(affiliateId: string, approvedBy: string) {
  const { error } = await supabase
    .from("affiliates")
    .update({
      status: "active",
      approved_at: new Date().toISOString(),
      approved_by: approvedBy,
    } as any)
    .eq("id", affiliateId);
  return { success: !error, error };
}

/**
 * Admin: Reject an affiliate
 */
export async function rejectAffiliate(affiliateId: string, reason: string) {
  const { error } = await supabase
    .from("affiliates")
    .update({
      status: "rejected",
      rejection_reason: reason,
    } as any)
    .eq("id", affiliateId);
  return { success: !error, error };
}

/**
 * Admin: Suspend an affiliate
 */
export async function suspendAffiliate(affiliateId: string) {
  const { error } = await supabase
    .from("affiliates")
    .update({ status: "suspended" } as any)
    .eq("id", affiliateId);
  return { success: !error, error };
}


// ═══════════════════════════════════════════════════════════
// REFERRAL TRACKING
// ═══════════════════════════════════════════════════════════

/**
 * Track a referral click
 */
export async function trackReferralClick(data: {
  affiliateId: string;
  referralCode: string;
  ipAddress?: string;
  userAgent?: string;
  referer?: string;
  landingPage?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}) {
  const { error } = await supabase.from("affiliate_clicks").insert({
    affiliate_id: data.affiliateId,
    referral_code: data.referralCode,
    ip_address: data.ipAddress || null,
    user_agent: data.userAgent || null,
    referer: data.referer || null,
    landing_page: data.landingPage || null,
    utm_source: data.utmSource || null,
    utm_medium: data.utmMedium || null,
    utm_campaign: data.utmCampaign || null,
    is_unique: true,
  } as any);
  return { success: !error, error };
}

/**
 * Record a referral signup (when someone creates an account via affiliate link)
 */
export async function recordReferralSignup(data: {
  affiliateId: string;
  referralCode: string;
  referredUserId: string;
  referredEmail: string;
  referredName?: string;
  source?: string;
  medium?: string;
}) {
  const { data: referral, error } = await supabase
    .from("affiliate_referrals")
    .insert({
      affiliate_id: data.affiliateId,
      referral_code: data.referralCode,
      referred_user_id: data.referredUserId,
      referred_email: data.referredEmail,
      referred_name: data.referredName || null,
      source: data.source || null,
      medium: data.medium || null,
      status: "signed_up",
      clicked_at: new Date().toISOString(),
      signed_up_at: new Date().toISOString(),
      attribution_window_days: 30,
    } as any)
    .select()
    .single();
  return { referral, error };
}

/**
 * Convert a referral (when referred user makes a payment)
 */
export async function convertReferral(referralId: string) {
  const { error } = await supabase
    .from("affiliate_referrals")
    .update({
      status: "converted",
      converted_at: new Date().toISOString(),
    } as any)
    .eq("id", referralId);
  return { success: !error, error };
}

/**
 * Get referrals for an affiliate
 */
export async function getAffiliateReferrals(affiliateId: string) {
  const { data, error } = await supabase
    .from("affiliate_referrals")
    .select("*")
    .eq("affiliate_id", affiliateId)
    .order("created_at", { ascending: false });
  return { referrals: (data || []) as AffiliateReferral[], error };
}


// ═══════════════════════════════════════════════════════════
// COMMISSION CALCULATION & MANAGEMENT
// ═══════════════════════════════════════════════════════════

/**
 * Calculate and record a commission for a sale
 */
export async function recordCommission(data: {
  affiliateId: string;
  referralId: string;
  saleAmount: number;
  currency?: string;
  orderId?: string;
  subscriptionId?: string;
  monthNumber: number;
  isRecurring?: boolean;
}) {
  // Default 25% commission
  const commissionRate = 25.00;
  const commissionAmount = (data.saleAmount * commissionRate) / 100;

  const { data: commission, error } = await supabase
    .from("affiliate_commissions")
    .insert({
      affiliate_id: data.affiliateId,
      referral_id: data.referralId,
      order_id: data.orderId || null,
      subscription_id: data.subscriptionId || null,
      sale_amount: data.saleAmount,
      commission_rate: commissionRate,
      commission_amount: commissionAmount,
      currency: data.currency || "INR",
      month_number: data.monthNumber,
      is_recurring: data.isRecurring || false,
      status: "pending",
    } as any)
    .select()
    .single();

  return { commission, error, commissionAmount };
}

/**
 * Get commissions for an affiliate
 */
export async function getAffiliateCommissions(affiliateId: string, status?: string) {
  let query = supabase
    .from("affiliate_commissions")
    .select("*")
    .eq("affiliate_id", affiliateId)
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  return { commissions: (data || []) as Commission[], error };
}

/**
 * Approve pending commissions (batch)
 */
export async function approveCommissions(commissionIds: string[]) {
  const { error } = await supabase
    .from("affiliate_commissions")
    .update({
      status: "approved",
      approved_at: new Date().toISOString(),
    } as any)
    .in("id", commissionIds);
  return { success: !error, error };
}


// ═══════════════════════════════════════════════════════════
// PAYOUT MANAGEMENT
// ═══════════════════════════════════════════════════════════

/**
 * Request a payout (affiliate-initiated)
 */
export async function requestPayout(affiliateId: string) {
  // Get affiliate details
  const { data: affiliate } = await supabase
    .from("affiliates")
    .select("*")
    .eq("id", affiliateId)
    .single();

  if (!affiliate) return { success: false, error: "Affiliate not found" };
  
  const aff = affiliate as Affiliate;
  if (aff.pending_balance < 500) {
    return { success: false, error: "Minimum payout amount is ₹500" };
  }

  const { data: payout, error } = await supabase
    .from("affiliate_payouts")
    .insert({
      affiliate_id: affiliateId,
      amount: aff.pending_balance,
      currency: "INR",
      payment_method: aff.payment_method || "upi",
      payment_details: aff.payment_details,
      status: "pending",
      period_start: new Date(new Date().setDate(1)).toISOString().split("T")[0],
      period_end: new Date().toISOString().split("T")[0],
    } as any)
    .select()
    .single();

  return { success: !error, payout, error };
}

/**
 * Admin: Process a payout
 */
export async function processPayout(payoutId: string, transactionId: string, processedBy: string) {
  const { error } = await supabase
    .from("affiliate_payouts")
    .update({
      status: "completed",
      transaction_id: transactionId,
      processed_at: new Date().toISOString(),
      processed_by: processedBy,
    } as any)
    .eq("id", payoutId);

  if (!error) {
    // Get payout to update affiliate balance
    const { data: payout } = await supabase
      .from("affiliate_payouts")
      .select("*")
      .eq("id", payoutId)
      .single();
    
    if (payout) {
      const p = payout as Payout;
      // Update affiliated commissions to "paid"
      await supabase
        .from("affiliate_commissions")
        .update({ status: "paid", paid_at: new Date().toISOString(), payout_id: payoutId } as any)
        .eq("affiliate_id", p.affiliate_id)
        .eq("status", "approved");
    }
  }

  return { success: !error, error };
}

/**
 * Get payouts for an affiliate
 */
export async function getAffiliatePayouts(affiliateId: string) {
  const { data, error } = await supabase
    .from("affiliate_payouts")
    .select("*")
    .eq("affiliate_id", affiliateId)
    .order("created_at", { ascending: false });
  return { payouts: (data || []) as Payout[], error };
}

/**
 * Admin: Get all pending payouts
 */
export async function getPendingPayouts() {
  const { data, error } = await supabase
    .from("affiliate_payouts")
    .select("*, affiliates!inner(full_name, email)")
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  return { payouts: data || [], error };
}


// ═══════════════════════════════════════════════════════════
// REFERRAL LINK TRACKING (used on public pages)
// ═══════════════════════════════════════════════════════════

/**
 * Process a referral link visit - call this when someone visits /ref/:code
 */
export async function processReferralVisit(code: string): Promise<{ valid: boolean; affiliateId?: string }> {
  const { affiliate } = await getAffiliateByCode(code);
  
  if (!affiliate || affiliate.status !== "active") {
    return { valid: false };
  }

  // Track the click
  await trackReferralClick({
    affiliateId: affiliate.id,
    referralCode: code,
    landingPage: window.location.href,
    utmSource: new URLSearchParams(window.location.search).get("utm_source") || undefined,
    utmMedium: new URLSearchParams(window.location.search).get("utm_medium") || undefined,
    utmCampaign: new URLSearchParams(window.location.search).get("utm_campaign") || undefined,
  });

  // Set referral cookie (30-day window)
  const expires = new Date();
  expires.setDate(expires.getDate() + 30);
  document.cookie = `flowora_ref=${code};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  
  // Also store in localStorage as backup
  localStorage.setItem("flowora_referral_code", code);
  localStorage.setItem("flowora_referral_timestamp", Date.now().toString());

  return { valid: true, affiliateId: affiliate.id };
}

/**
 * Get the referral code from cookie/localStorage
 */
export function getStoredReferralCode(): string | null {
  // Check cookie first
  const cookieMatch = document.cookie.match(/flowora_ref=([^;]+)/);
  if (cookieMatch) return cookieMatch[1];

  // Check localStorage with 30-day expiry
  const code = localStorage.getItem("flowora_referral_code");
  const timestamp = localStorage.getItem("flowora_referral_timestamp");
  if (code && timestamp) {
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    if (Date.now() - parseInt(timestamp) < thirtyDays) {
      return code;
    }
    // Expired - clean up
    localStorage.removeItem("flowora_referral_code");
    localStorage.removeItem("flowora_referral_timestamp");
  }
  return null;
}

/**
 * Clear referral tracking (after successful attribution)
 */
export function clearReferralTracking(): void {
  document.cookie = "flowora_ref=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
  localStorage.removeItem("flowora_referral_code");
  localStorage.removeItem("flowora_referral_timestamp");
}

// ═══════════════════════════════════════════════════════════
// ANALYTICS & STATS
// ═══════════════════════════════════════════════════════════

/**
 * Get affiliate dashboard stats
 */
export async function getAffiliateDashboardStats(affiliateId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString();

  // This month clicks
  const { count: clicksThisMonth } = await supabase
    .from("affiliate_clicks")
    .select("*", { count: "exact", head: true })
    .eq("affiliate_id", affiliateId)
    .gte("created_at", startOfMonth);

  // This month referrals
  const { count: referralsThisMonth } = await supabase
    .from("affiliate_referrals")
    .select("*", { count: "exact", head: true })
    .eq("affiliate_id", affiliateId)
    .gte("created_at", startOfMonth);

  // This month conversions
  const { count: conversionsThisMonth } = await supabase
    .from("affiliate_referrals")
    .select("*", { count: "exact", head: true })
    .eq("affiliate_id", affiliateId)
    .eq("status", "converted")
    .gte("converted_at", startOfMonth);

  return {
    clicksThisMonth: clicksThisMonth || 0,
    referralsThisMonth: referralsThisMonth || 0,
    conversionsThisMonth: conversionsThisMonth || 0,
  };
}

/**
 * Admin: Get program-wide stats
 */
export async function getAdminAffiliateStats() {
  const { count: totalAffiliates } = await supabase
    .from("affiliates")
    .select("*", { count: "exact", head: true });

  const { count: activeAffiliates } = await supabase
    .from("affiliates")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  const { count: pendingApplications } = await supabase
    .from("affiliates")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  return {
    totalAffiliates: totalAffiliates || 0,
    activeAffiliates: activeAffiliates || 0,
    pendingApplications: pendingApplications || 0,
  };
}
