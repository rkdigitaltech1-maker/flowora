/**
 * Flowora Pricing Plans & Currency Configuration
 * Supports INR and USD with monthly/annual billing intervals.
 */

export type Currency = "INR" | "USD";
export type BillingInterval = "monthly" | "annual";
export type PlanTier = "free" | "starter" | "pro" | "enterprise";

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
  description: string;
  pricing: Record<Currency, PlanPricing>;
  features: PlanFeature[];
  popular?: boolean;
  cta: string;
  limits: {
    dmsPerMonth: number;
    contacts: number;
    workflows: number;
    products: number;
    campaigns: number;
  };
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
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
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
    description: "Perfect for getting started with automation",
    pricing: {
      USD: { monthly: 0, annual: 0 },
      INR: { monthly: 0, annual: 0 },
    },
    features: [
      { text: "100 DMs per month", included: true },
      { text: "500 contacts", included: true },
      { text: "2 active workflows", included: true },
      { text: "3 products", included: true },
      { text: "1 campaign", included: true },
      { text: "Basic analytics", included: true },
      { text: "Community support", included: true },
      { text: "Custom branding", included: false },
      { text: "Priority support", included: false },
      { text: "API access", included: false },
    ],
    cta: "Get Started Free",
    limits: {
      dmsPerMonth: 100,
      contacts: 500,
      workflows: 2,
      products: 3,
      campaigns: 1,
    },
  },
  {
    id: "starter",
    name: "Starter",
    description: "For creators ready to scale their outreach",
    pricing: {
      USD: { monthly: 19, annual: 15 },
      INR: { monthly: 1499, annual: 1199 },
    },
    features: [
      { text: "1,000 DMs per month", included: true },
      { text: "2,500 contacts", included: true },
      { text: "5 active workflows", included: true },
      { text: "10 products", included: true },
      { text: "5 campaigns", included: true },
      { text: "Advanced analytics", included: true },
      { text: "Email support", included: true },
      { text: "Custom branding", included: true },
      { text: "Priority support", included: false },
      { text: "API access", included: false },
    ],
    cta: "Start 14-day Trial",
    limits: {
      dmsPerMonth: 1000,
      contacts: 2500,
      workflows: 5,
      products: 10,
      campaigns: 5,
    },
  },
  {
    id: "pro",
    name: "Pro",
    description: "For serious creators who want unlimited growth",
    popular: true,
    pricing: {
      USD: { monthly: 39, annual: 29 },
      INR: { monthly: 2999, annual: 2399 },
    },
    features: [
      { text: "Unlimited DMs", included: true, highlight: true },
      { text: "Unlimited contacts", included: true, highlight: true },
      { text: "Unlimited workflows", included: true, highlight: true },
      { text: "Unlimited products", included: true },
      { text: "Unlimited campaigns", included: true },
      { text: "Advanced analytics + exports", included: true },
      { text: "Priority chat support", included: true },
      { text: "Custom branding", included: true },
      { text: "API access", included: true },
      { text: "Webhook integrations", included: true },
    ],
    cta: "Start 14-day Trial",
    limits: {
      dmsPerMonth: 999999,
      contacts: 999999,
      workflows: 999999,
      products: 999999,
      campaigns: 999999,
    },
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For agencies and large creator teams",
    pricing: {
      USD: { monthly: 99, annual: 79 },
      INR: { monthly: 7999, annual: 6499 },
    },
    features: [
      { text: "Everything in Pro", included: true, highlight: true },
      { text: "Multi-workspace management", included: true },
      { text: "Team collaboration (5 seats)", included: true },
      { text: "Dedicated account manager", included: true },
      { text: "Custom onboarding", included: true },
      { text: "SLA guarantee (99.9%)", included: true },
      { text: "White-label options", included: true },
      { text: "Advanced security & audit logs", included: true },
      { text: "Custom integrations", included: true },
      { text: "Phone support", included: true },
    ],
    cta: "Contact Sales",
    limits: {
      dmsPerMonth: 999999,
      contacts: 999999,
      workflows: 999999,
      products: 999999,
      campaigns: 999999,
    },
  },
];

export function getPlanById(id: PlanTier): Plan | undefined {
  return PLANS.find((p) => p.id === id);
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
  const amounts = currency === "USD" ? [29, 29, 29, 39, 39] : [2399, 2399, 2399, 2999, 2999];

  return Array.from({ length: 5 }, (_, i) => {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    return {
      id: `INV-${2026}${String(date.getMonth() + 1).padStart(2, "0")}-${1000 + i}`,
      date: date.toISOString(),
      amount: amounts[i],
      currency,
      status: i === 0 ? "paid" : "paid",
      plan: i < 3 ? "Pro" : "Pro",
      interval: "annual" as BillingInterval,
      downloadUrl: `#invoice-${i}`,
    };
  });
}
