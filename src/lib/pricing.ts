/**
 * Flowora Pricing Plans & Currency Configuration
 * Two plans: Free & Pro, with INR/USD support and monthly/annual billing.
 *
 * Pricing (from your live pricing page):
 * - Pro USD: $4.99/mo annual ($59.88/yr), save 17% vs monthly
 * - Pro INR: ₹399/mo annual (₹4,788/yr), save 20% vs monthly
 */

export type Currency = "INR" | "USD";
export type BillingInterval = "monthly" | "annual";
export type PlanTier = "free" | "pro";

export interface PlanFeature {
  text: string;
  included: boolean;
  highlight?: boolean;
}

export interface PlanPricing {
  monthly: number;
  annual: number; // per-month price when billed annually
}

export interface Plan {
  id: PlanTier;
  name: string;
  subtitle: string;
  description: string;
  pricing: Record<Currency, PlanPricing>;
  features: PlanFeature[];
  popular?: boolean;
  cta: string;
  limits: {
    instagramAccounts: number;
    dmsPerMonth: number;
    activeCampaigns: number;
    leadsCollected: number;
    workflows: number;
    products: number;
  };
  automations: {
    commentAutoDM: boolean;
    storyMentionAutoDM: boolean;
    emailPhoneCollection: boolean;
    csvExport: boolean;
    reTrigger: boolean;
    askForFollow: boolean;
    leadGen: boolean;
    webhookAutoRetry: boolean;
  };
  analyticsHistory: string;
  support: string;
  moneyBackDays: number | null;
}

export const CURRENCY_CONFIG: Record<Currency, { symbol: string; code: string; locale: string }> = {
  INR: { symbol: "₹", code: "INR", locale: "en-IN" },
  USD: { symbol: "$", code: "USD", locale: "en-US" },
};

export function formatPrice(amount: number, currency: Currency): string {
  const config = CURRENCY_CONFIG[currency];
  if (amount === 0) return "Free";
  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: config.code,
    minimumFractionDigits: currency === "USD" ? 2 : 0,
    maximumFractionDigits: currency === "USD" ? 2 : 0,
  }).format(amount);
}

export function formatAnnualTotal(plan: Plan, currency: Currency): string {
  const annualPerMonth = plan.pricing[currency].annual;
  const total = annualPerMonth * 12;
  const config = CURRENCY_CONFIG[currency];
  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: config.code,
    minimumFractionDigits: currency === "USD" ? 2 : 0,
    maximumFractionDigits: currency === "USD" ? 2 : 0,
  }).format(total);
}

export function getAnnualSavings(plan: Plan, currency: Currency): number {
  const monthlyTotal = plan.pricing[currency].monthly * 12;
  const annualTotal = plan.pricing[currency].annual * 12;
  return monthlyTotal - annualTotal;
}

export function getAnnualSavingsPercent(plan: Plan, currency: Currency): number {
  const monthly = plan.pricing[currency].monthly;
  const annual = plan.pricing[currency].annual;
  if (monthly === 0) return 0;
  return Math.round(((monthly - annual) / monthly) * 100);
}

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    subtitle: "FREE",
    description: "Perfect for creators just getting started.",
    pricing: {
      USD: { monthly: 0, annual: 0 },
      INR: { monthly: 0, annual: 0 },
    },
    features: [
      { text: "1 connected Instagram account", included: true },
      { text: "Up to 1,000 DMs / month", included: true },
      { text: "Up to 10 active campaigns", included: true },
      { text: "Comment Auto-DM automation", included: true },
      { text: "Lead capture & contact CRM", included: true },
      { text: "7-day analytics dashboard", included: true },
      { text: "Real-time activity feed", included: true },
      { text: "Community support", included: true },
    ],
    cta: "Start for free",
    popular: false,
    limits: {
      instagramAccounts: 1,
      dmsPerMonth: 1000,
      activeCampaigns: 10,
      leadsCollected: 999999,
      workflows: 2,
      products: 5,
    },
    automations: {
      commentAutoDM: true,
      storyMentionAutoDM: false,
      emailPhoneCollection: false,
      csvExport: false,
      reTrigger: false,
      askForFollow: false,
      leadGen: false,
      webhookAutoRetry: false,
    },
    analyticsHistory: "7 days",
    support: "Email",
    moneyBackDays: null,
  },
  {
    id: "pro",
    name: "Full automation suite",
    subtitle: "PRO",
    description: "Everything you need to automate and grow.",
    popular: true,
    pricing: {
      USD: { monthly: 5.99, annual: 4.99 },
      INR: { monthly: 499, annual: 399 },
    },
    features: [
      { text: "10 connected Instagram accounts", included: true, highlight: true },
      { text: "Unlimited DMs per month", included: true, highlight: true },
      { text: "Unlimited campaigns", included: true, highlight: true },
      { text: "Unlimited lead collection", included: true, highlight: true },
      { text: "All automations: Comment, Story DM, Ask-for-Follow & Lead Gen", included: true },
      { text: "Re-trigger old commenters & followers", included: true },
      { text: "Email & phone collection in DM", included: true },
      { text: "Story Mention Auto-DM", included: true },
      { text: "Advanced analytics (7d / 30d / 90d)", included: true },
      { text: "Per-campaign performance reports", included: true },
      { text: "CSV export of leads & contacts", included: true },
      { text: "Webhook auto-retry & reliability", included: true },
      { text: "Priority email + chat support", included: true },
      { text: "7-day money-back guarantee", included: true },
    ],
    cta: "Get Started",
    limits: {
      instagramAccounts: 10,
      dmsPerMonth: 999999,
      activeCampaigns: 999999,
      leadsCollected: 999999,
      workflows: 999999,
      products: 999999,
    },
    automations: {
      commentAutoDM: true,
      storyMentionAutoDM: true,
      emailPhoneCollection: true,
      csvExport: true,
      reTrigger: true,
      askForFollow: true,
      leadGen: true,
      webhookAutoRetry: true,
    },
    analyticsHistory: "7 / 30 / 90 days",
    support: "Priority",
    moneyBackDays: 7,
  },
];

export function getPlanById(id: PlanTier): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}

// Compare plans table data — matches your comparison screenshot structure
// Uses dynamic values based on currency for the pricing row
export interface CompareFeature {
  name: string;
  free: string;
  pro: string;
}

export function getCompareFeatures(currency: Currency): CompareFeature[] {
  const proPriceLabel = currency === "INR" ? "₹399 /mo" : "$4.99 /mo";
  const freePriceLabel = currency === "INR" ? "₹0 /mo" : "$0 /mo";

  return [
    { name: "Pricing", free: freePriceLabel, pro: proPriceLabel },
    { name: "Automations", free: "Unlimited", pro: "Unlimited" },
    { name: "DM Send Limit / mo", free: "1,000", pro: "Unlimited" },
    { name: "Leads collected", free: "Unlimited", pro: "Unlimited" },
    { name: "Instagram accounts", free: "1", pro: "10" },
    { name: "Active campaigns", free: "10", pro: "Unlimited" },
    { name: "Workflows", free: "2", pro: "Unlimited" },
    { name: "Products / Storefront", free: "5", pro: "Unlimited" },
    { name: "Comment Auto-DM", free: "✓", pro: "✓" },
    { name: "Story Mention Auto-DM", free: "✗", pro: "✓" },
    { name: "Email collection in DM", free: "✗", pro: "✓" },
    { name: "CSV export", free: "✗", pro: "✓" },
    { name: "Analytics history", free: "7 days", pro: "7 / 30 / 90 days" },
    { name: "Re-trigger", free: "✗", pro: "✓" },
    { name: "Ask For Follow", free: "✗", pro: "✓" },
    { name: "Lead Gen", free: "✗", pro: "✓" },
    { name: "Webhook auto-retry", free: "✗", pro: "✓" },
    { name: "Support", free: "Email", pro: "Priority" },
  ];
}

// Simulated invoice data for billing page
export interface Invoice {
  id: string;
  date: string;
  amount: number;
  currency: Currency;
  status: "paid" | "pending" | "failed";
  plan: string;
  interval: BillingInterval;
  downloadUrl?: string;
}

export function generateDemoInvoices(currency: Currency): Invoice[] {
  const now = new Date();
  const amount = currency === "USD" ? 59.88 : 4788;

  return Array.from({ length: 5 }, (_, i) => {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    return {
      id: `INV-${2026}${String(date.getMonth() + 1).padStart(2, "0")}-${1000 + i}`,
      date: date.toISOString(),
      amount,
      currency,
      status: "paid" as const,
      plan: "Pro",
      interval: "annual" as BillingInterval,
      downloadUrl: `#invoice-${i}`,
    };
  });
}
