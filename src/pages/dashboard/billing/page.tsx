import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  CreditCard,
  Download,
  ExternalLink,
  ArrowUpRight,
  Check,
  Crown,
  Shield,
  Sparkles,
  Zap,
  Calendar,
  Receipt,
  AlertCircle,
  IndianRupee,
  DollarSign,
  ChevronRight,
  RefreshCw,
  X,
  Users,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { toast } from "sonner";
import { usePricing } from "@/hooks/use-pricing.ts";
import {
  PLANS,
  formatPrice,
  formatAnnualTotal,
  getAnnualSavingsPercent,
  generateDemoInvoices,
  getPlanById,
  type Currency,
  type BillingInterval,
  type PlanTier,
  type Invoice,
} from "@/lib/pricing.ts";

// Simulated current subscription state
function useSubscription() {
  const [subscription] = useState({
    plan: "pro" as PlanTier,
    interval: "annual" as BillingInterval,
    currency: "INR" as Currency,
    status: "active" as "active" | "trialing" | "canceled" | "past_due",
    currentPeriodStart: new Date(2026, 0, 15).toISOString(),
    currentPeriodEnd: new Date(2027, 0, 15).toISOString(),
    trialEnd: null as string | null,
    cancelAtPeriodEnd: false,
    paymentMethod: {
      type: "card" as "card" | "upi" | "paypal",
      last4: "4242",
      brand: "Visa",
      expiryMonth: 12,
      expiryYear: 2028,
    },
  });

  return subscription;
}

function CurrencySelector({
  currency,
  onChange,
}: {
  currency: Currency;
  onChange: (c: Currency) => void;
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-[#dfdbea] bg-white p-0.5">
      <button
        onClick={() => onChange("INR")}
        className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
          currency === "INR"
            ? "bg-[#6d48ff] text-white shadow-sm"
            : "text-[#665d82] hover:text-[#171126]"
        }`}
      >
        <IndianRupee className="h-3 w-3" />
        INR
      </button>
      <button
        onClick={() => onChange("USD")}
        className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
          currency === "USD"
            ? "bg-[#6d48ff] text-white shadow-sm"
            : "text-[#665d82] hover:text-[#171126]"
        }`}
      >
        <DollarSign className="h-3 w-3" />
        USD
      </button>
    </div>
  );
}

function CurrentPlanCard({
  subscription,
  currency,
}: {
  subscription: ReturnType<typeof useSubscription>;
  currency: Currency;
}) {
  const plan = getPlanById(subscription.plan);
  if (!plan) return null;

  const price =
    subscription.interval === "monthly"
      ? plan.pricing[currency].monthly
      : plan.pricing[currency].annual;

  const periodEnd = new Date(subscription.currentPeriodEnd);
  const daysUntilRenewal = Math.max(
    0,
    Math.ceil((periodEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );

  const statusColors = {
    active: "bg-emerald-50 text-emerald-700",
    trialing: "bg-blue-50 text-blue-700",
    canceled: "bg-red-50 text-red-700",
    past_due: "bg-amber-50 text-amber-700",
  };

  const statusLabels = {
    active: "Active",
    trialing: "Trial",
    canceled: "Canceled",
    past_due: "Past Due",
  };

  return (
    <div className="rounded-2xl border border-[#dfdbea] bg-white p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#6d48ff] to-violet-600 text-white shadow-sm">
            <Crown className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#171126]">Pro Plan</h2>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${statusColors[subscription.status]}`}>
                {statusLabels[subscription.status]}
              </span>
            </div>
            <p className="text-sm text-[#82799b]">
              {formatPrice(price, currency)}/month · Billed {subscription.interval === "annual" ? "annually" : "monthly"}
            </p>
          </div>
        </div>
      </div>

      {/* Billing Cycle Progress */}
      <div className="rounded-xl bg-slate-50 p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-[#82799b]">Current Billing Period</span>
          <span className="text-xs font-bold text-[#6d48ff]">{daysUntilRenewal} days remaining</span>
        </div>
        <div className="h-2 rounded-full bg-[#e6e2ee] overflow-hidden">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-[#6d48ff] to-violet-500 transition-all duration-500"
            style={{
              width: `${Math.max(5, ((365 - daysUntilRenewal) / 365) * 100)}%`,
            }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px] text-[#82799b]">
            {new Date(subscription.currentPeriodStart).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <span className="text-[10px] text-[#82799b]">
            Renews{" "}
            {periodEnd.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          className="border-[#dfdbea] text-[#665d82] hover:bg-[#f4f1fb] text-xs"
          onClick={() => toast.info("Switching billing interval...")}
        >
          <Calendar className="h-3.5 w-3.5 mr-1" />
          Switch to {subscription.interval === "annual" ? "Monthly" : "Annual"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="border-red-100 text-red-500 hover:bg-red-50 text-xs"
          onClick={() => toast.error("Plan cancellation flow would open here")}
        >
          <X className="h-3.5 w-3.5 mr-1" />
          Cancel Plan
        </Button>
      </div>
    </div>
  );
}

function UsageOverview() {
  // Demo usage data for Pro plan (unlimited everything)
  const metrics = [
    {
      label: "DMs this month",
      used: 847,
      limit: 999999,
      color: "bg-[#6d48ff]",
      icon: MessageSquare,
    },
    {
      label: "Leads collected",
      used: 2340,
      limit: 999999,
      color: "bg-emerald-500",
      icon: Users,
    },
    {
      label: "Instagram accounts",
      used: 3,
      limit: 10,
      color: "bg-cyan-500",
      icon: Zap,
    },
    {
      label: "Active campaigns",
      used: 8,
      limit: 999999,
      color: "bg-rose-500",
      icon: Sparkles,
    },
  ];

  const formatLimit = (limit: number) => (limit >= 999999 ? "Unlimited" : limit.toLocaleString());

  return (
    <div className="rounded-2xl border border-[#dfdbea] bg-white p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-[#171126] flex items-center gap-2">
          <Zap className="h-4 w-4 text-[#6d48ff]" />
          Usage Overview
        </h3>
        <Link
          to="/dashboard/settings"
          className="text-xs font-medium text-[#6d48ff] hover:underline flex items-center gap-1"
        >
          View details
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          const percent = m.limit >= 999999 ? 0 : Math.min((m.used / m.limit) * 100, 100);
          return (
            <div key={i} className="rounded-xl border border-[#dfdbea] p-3.5 bg-slate-50/50">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-[#82799b] flex items-center gap-1.5">
                  <Icon className="h-3 w-3" />
                  {m.label}
                </span>
              </div>
              <p className="text-xl font-bold text-[#171126]">
                {m.used.toLocaleString()}
                <span className="text-xs font-normal text-slate-400 ml-1">
                  / {formatLimit(m.limit)}
                </span>
              </p>
              {m.limit < 999999 && (
                <div className="mt-2 h-1.5 rounded-full bg-[#e6e2ee] overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full ${m.color} transition-all duration-500`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              )}
              {m.limit >= 999999 && (
                <p className="mt-1 text-[10px] font-medium text-emerald-600">Unlimited on Pro</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PaymentMethodCard({ subscription }: { subscription: ReturnType<typeof useSubscription> }) {
  const pm = subscription.paymentMethod;

  return (
    <div className="rounded-2xl border border-[#dfdbea] bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-[#171126] flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-[#6d48ff]" />
          Payment Method
        </h3>
        <Button
          variant="outline"
          size="sm"
          className="border-[#dfdbea] text-[#665d82] hover:bg-[#f4f1fb] text-xs"
          onClick={() => toast.info("Update payment method flow...")}
        >
          Update
        </Button>
      </div>

      <div className="flex items-center gap-4 rounded-xl border border-[#dfdbea] p-4 bg-slate-50/30">
        <div className="flex h-10 w-14 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 text-white text-[10px] font-bold">
          {pm.brand}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-[#171126]">
            {pm.brand} ending in {pm.last4}
          </p>
          <p className="text-xs text-[#82799b]">
            Expires {String(pm.expiryMonth).padStart(2, "0")}/{pm.expiryYear}
          </p>
        </div>
        <Shield className="h-4 w-4 text-emerald-500" />
      </div>
    </div>
  );
}

function InvoiceHistory({ currency }: { currency: Currency }) {
  const invoices = generateDemoInvoices(currency);

  const statusBadge = (status: Invoice["status"]) => {
    const styles = {
      paid: "bg-emerald-50 text-emerald-700",
      pending: "bg-amber-50 text-amber-700",
      failed: "bg-red-50 text-red-700",
    };
    return (
      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${styles[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="rounded-2xl border border-[#dfdbea] bg-white p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-[#171126] flex items-center gap-2">
          <Receipt className="h-4 w-4 text-[#6d48ff]" />
          Invoice History
        </h3>
        <Button
          variant="outline"
          size="sm"
          className="border-[#dfdbea] text-[#665d82] hover:bg-[#f4f1fb] text-xs"
          onClick={() => toast.info("Downloading all invoices...")}
        >
          <Download className="h-3.5 w-3.5 mr-1" />
          Export All
        </Button>
      </div>

      <div className="space-y-2">
        {invoices.map((invoice) => (
          <div
            key={invoice.id}
            className="flex items-center justify-between rounded-xl border border-[#dfdbea] p-3.5 hover:bg-slate-50/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50">
                <Receipt className="h-4 w-4 text-[#6d48ff]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#171126]">{invoice.id}</p>
                <p className="text-xs text-[#82799b]">
                  {new Date(invoice.date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}{" "}
                  · {invoice.plan} ({invoice.interval})
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-[#171126]">
                {formatPrice(invoice.amount, invoice.currency)}
              </span>
              {statusBadge(invoice.status)}
              <button
                onClick={() => toast.success(`Downloading ${invoice.id}...`)}
                className="rounded-lg p-1.5 text-[#82799b] hover:bg-[#f4f1fb] hover:text-[#6d48ff] transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UpgradeBanner({ currency }: { currency: Currency }) {
  const navigate = useNavigate();
  const proPlan = getPlanById("pro")!;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-gradient-to-r from-[#6d48ff] to-violet-600 p-6 text-white shadow-lg"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Upgrade to Pro</h3>
            <p className="text-sm text-violet-200">
              Unlimited DMs, campaigns & leads starting at{" "}
              {formatPrice(proPlan.pricing[currency].annual, currency)}/mo
            </p>
          </div>
        </div>
        <Button
          onClick={() => navigate(`/dashboard/checkout?plan=pro&currency=${currency}`)}
          className="bg-white text-[#6d48ff] hover:bg-violet-50 font-semibold shadow-sm"
        >
          Upgrade Now
          <ArrowUpRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}

export default function BillingPage() {
  const { currency, setCurrency } = usePricing();
  const subscription = useSubscription();

  return (
    <div className="space-y-6 p-1">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#171126]">Billing & Subscription</h1>
          <p className="text-sm text-[#82799b] mt-0.5">
            Manage your plan, payment method, and view invoices
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CurrencySelector currency={currency} onChange={setCurrency} />
          <Button
            variant="outline"
            size="sm"
            className="border-[#dfdbea] text-[#665d82] hover:bg-[#f4f1fb] text-xs"
            asChild
          >
            <Link to="/pricing">
              <ExternalLink className="h-3.5 w-3.5 mr-1" />
              View Plans
            </Link>
          </Button>
        </div>
      </div>

      {/* Upgrade Banner (show if on free plan) */}
      {subscription.plan === "free" && <UpgradeBanner currency={currency} />}

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Current Plan */}
        <CurrentPlanCard subscription={subscription} currency={currency} />

        {/* Payment Method */}
        <PaymentMethodCard subscription={subscription} />
      </div>

      {/* Usage */}
      <UsageOverview />

      {/* Invoices */}
      <InvoiceHistory currency={currency} />

      {/* Help Section */}
      <div className="rounded-2xl border border-[#dfdbea] bg-white p-6">
        <div className="flex items-center gap-3 mb-3">
          <AlertCircle className="h-4 w-4 text-[#6d48ff]" />
          <h3 className="font-semibold text-[#171126]">Need Help?</h3>
        </div>
        <p className="text-sm text-[#82799b] mb-4">
          Have questions about billing, need to update your payment info, or want help with your plan?
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-[#dfdbea] text-[#665d82] hover:bg-[#f4f1fb] text-xs"
            asChild
          >
            <Link to="/support">Contact Support</Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-[#dfdbea] text-[#665d82] hover:bg-[#f4f1fb] text-xs"
            asChild
          >
            <a href="mailto:billing@flowora.tech">Email Billing Team</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
