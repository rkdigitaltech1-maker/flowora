import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Check,
  X,
  Sparkles,
  ArrowRight,
  Zap,
  HelpCircle,
  ChevronDown,
  Shield,
  IndianRupee,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { PageLayout } from "@/components/PageLayout.tsx";
import { useAuth } from "@/hooks/use-auth.ts";
import { usePricing } from "@/hooks/use-pricing.ts";
import {
  PLANS,
  getCompareFeatures,
  formatPrice,
  formatAnnualTotal,
  getAnnualSavingsPercent,
  type Currency,
  type BillingInterval,
  type Plan,
} from "@/lib/pricing.ts";

function CurrencyToggle({
  currency,
  onToggle,
}: {
  currency: Currency;
  onToggle: () => void;
}) {
  return (
    <div className="inline-flex items-center rounded-full border border-[#dfdbea] bg-white p-1 shadow-sm">
      <button
        onClick={() => currency !== "INR" && onToggle()}
        className={`flex items-center gap-1 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-all ${
          currency === "INR"
            ? "bg-gradient-to-r from-[#6d48ff] to-violet-500 text-white shadow-sm"
            : "text-[#665d82] hover:text-[#171126]"
        }`}
      >
        <span className="text-xs font-bold">₹</span>
        INR
      </button>
      <button
        onClick={() => currency !== "USD" && onToggle()}
        className={`flex items-center gap-1 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-all ${
          currency === "USD"
            ? "bg-gradient-to-r from-[#6d48ff] to-violet-500 text-white shadow-sm"
            : "text-[#665d82] hover:text-[#171126]"
        }`}
      >
        <span className="text-xs font-bold">$</span>
        USD
      </button>
    </div>
  );
}

function BillingToggle({
  interval,
  onToggle,
  savingsPercent,
}: {
  interval: BillingInterval;
  onToggle: () => void;
  savingsPercent: number;
}) {
  return (
    <div className="inline-flex items-center rounded-full border border-[#dfdbea] bg-white p-1 shadow-sm">
      <button
        onClick={() => interval !== "monthly" && onToggle()}
        className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
          interval === "monthly"
            ? "bg-[#171126] text-white shadow-sm"
            : "text-[#665d82] hover:text-[#171126]"
        }`}
      >
        Monthly
      </button>
      <button
        onClick={() => interval !== "annual" && onToggle()}
        className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
          interval === "annual"
            ? "bg-gradient-to-r from-[#6d48ff] to-violet-500 text-white shadow-sm"
            : "text-[#665d82] hover:text-[#171126]"
        }`}
      >
        Yearly
        {savingsPercent > 0 && (
          <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
            interval === "annual" ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-700"
          }`}>
            Save {savingsPercent}%
          </span>
        )}
      </button>
    </div>
  );
}

function FreePlanCard({ plan, currency }: { plan: Plan; currency: Currency }) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col rounded-2xl border border-[#dfdbea] bg-white p-7 hover:shadow-lg transition-shadow"
    >
      {/* Label */}
      <p className="text-xs font-semibold text-[#82799b] uppercase tracking-wider mb-2">
        {plan.subtitle}
      </p>

      {/* Plan Name */}
      <h3 className="text-3xl font-bold text-[#171126] mb-1">Free</h3>

      {/* Description */}
      <p className="text-sm text-[#82799b] mb-6">{plan.description}</p>

      {/* CTA */}
      <Button
        onClick={() => navigate("/login")}
        variant="outline"
        className="w-full mb-8 border-[#171126] text-[#171126] hover:bg-slate-50 font-semibold py-5"
      >
        {plan.cta}
      </Button>

      {/* Features */}
      <div className="space-y-3 flex-1">
        <p className="text-xs font-semibold text-[#82799b] uppercase tracking-wide mb-3">
          INCLUDED
        </p>
        {plan.features.map((feature, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <div className="flex h-5 w-5 items-center justify-center rounded-full border border-[#dfdbea] flex-shrink-0 mt-0.5">
              <Check className="h-3 w-3 text-[#82799b]" />
            </div>
            <span className="text-sm text-[#4a4362]">{feature.text}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function ProPlanCard({
  plan,
  currency,
  interval,
}: {
  plan: Plan;
  currency: Currency;
  interval: BillingInterval;
}) {
  const navigate = useNavigate();
  const price = interval === "monthly" ? plan.pricing[currency].monthly : plan.pricing[currency].annual;
  const savingsPercent = getAnnualSavingsPercent(plan, currency);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="relative flex flex-col rounded-2xl border-2 border-transparent bg-gradient-to-b from-violet-50 to-white p-7 shadow-xl ring-2 ring-[#6d48ff]/30 hover:shadow-2xl transition-shadow"
      style={{
        background: "linear-gradient(white, white) padding-box, linear-gradient(135deg, #6d48ff, #a855f7, #ec4899) border-box",
        borderColor: "transparent",
      }}
    >
      {/* Most Popular Badge */}
      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
        <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#6d48ff] to-violet-500 px-4 py-1.5 text-xs font-bold text-white shadow-md">
          Most Popular
        </span>
      </div>

      {/* Label + icon */}
      <div className="flex items-center justify-between mb-2 mt-2">
        <p className="text-xs font-semibold text-[#6d48ff] uppercase tracking-wider">
          {plan.subtitle}
        </p>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#6d48ff] to-violet-500">
          <Zap className="h-4 w-4 text-white" />
        </div>
      </div>

      {/* Plan Name */}
      <h3 className="text-xl font-bold text-[#171126] mb-4">{plan.name}</h3>

      {/* Price */}
      <div className="mb-2">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold text-[#171126]">
            {formatPrice(price, currency)}
          </span>
          <span className="text-sm text-[#82799b]">/ month</span>
        </div>
      </div>

      {/* Annual billing info */}
      {interval === "annual" && (
        <div className="mb-1">
          <p className="text-xs text-[#82799b]">
            Billed as <span className="line-through">{formatAnnualTotal({ ...plan, pricing: { ...plan.pricing, [currency]: { ...plan.pricing[currency], annual: plan.pricing[currency].monthly } } } as any, currency)}</span>{" "}
            {formatAnnualTotal(plan, currency)} per year
          </p>
          <p className="text-xs text-[#82799b]">
            You save{" "}
            <span className="inline-flex items-center rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
              {savingsPercent}%
            </span>{" "}
            compared to monthly
          </p>
        </div>
      )}
      {interval === "monthly" && (
        <p className="text-xs text-[#82799b] mb-1">
          Switch to yearly to save {savingsPercent}%
        </p>
      )}

      {/* CTA */}
      <Button
        onClick={() => navigate(`/dashboard/checkout?plan=pro&interval=${interval}&currency=${currency}`)}
        className="w-full my-5 bg-gradient-to-r from-[#6d48ff] to-violet-500 hover:from-[#5a38e0] hover:to-violet-600 text-white font-semibold py-5 shadow-lg shadow-violet-200"
      >
        {plan.cta}
        <ArrowRight className="ml-1.5 h-4 w-4" />
      </Button>

      {/* Money-back guarantee */}
      <div className="flex items-center justify-center gap-1.5 mb-6">
        <Shield className="h-3.5 w-3.5 text-[#82799b]" />
        <span className="text-xs text-[#82799b] font-medium">
          Risk-free · 7-day money-back guarantee
        </span>
      </div>

      {/* Features */}
      <div className="space-y-3 flex-1">
        <p className="text-xs font-semibold text-[#82799b] uppercase tracking-wide mb-3">
          EVERYTHING INCLUDED
        </p>
        {plan.features.map((feature, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <div className={`flex h-5 w-5 items-center justify-center rounded-full flex-shrink-0 mt-0.5 ${
              feature.highlight 
                ? "bg-gradient-to-br from-[#6d48ff] to-violet-500" 
                : "bg-emerald-100"
            }`}>
              <Check className={`h-3 w-3 ${feature.highlight ? "text-white" : "text-emerald-600"}`} />
            </div>
            <span className={`text-sm ${feature.highlight ? "font-medium text-[#171126]" : "text-[#4a4362]"}`}>
              {feature.text}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function ComparePlansTable({ currency }: { currency: Currency }) {
  const features = getCompareFeatures(currency);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-[#dfdbea]">
            <th className="py-4 px-6 text-left text-sm font-semibold text-[#171126] min-w-[200px]">
              Features
            </th>
            <th className="py-4 px-6 text-center text-sm font-semibold text-[#171126] min-w-[140px]">
              Free
            </th>
            <th className="py-4 px-6 text-center min-w-[140px]">
              <span className="text-sm font-bold text-[#6d48ff]">Pro</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {features.map((feature, i) => (
            <tr key={i} className="border-b border-[#f0edf5]">
              <td className="py-3.5 px-6 text-sm text-[#4a4362] font-medium">
                {feature.name}
              </td>
              <td className="py-3.5 px-6 text-center">
                {feature.free === "✓" ? (
                  <Check className="h-4 w-4 text-emerald-500 mx-auto" />
                ) : feature.free === "✗" ? (
                  <X className="h-4 w-4 text-red-400 mx-auto" />
                ) : (
                  <span className={`text-sm ${
                    feature.free === "Unlimited" ? "font-semibold text-[#171126]" : "text-[#665d82]"
                  }`}>
                    {feature.free}
                  </span>
                )}
              </td>
              <td className="py-3.5 px-6 text-center">
                {feature.pro === "✓" ? (
                  <Check className="h-4 w-4 text-emerald-500 mx-auto" />
                ) : feature.pro === "✗" ? (
                  <X className="h-4 w-4 text-red-400 mx-auto" />
                ) : (
                  <span className={`text-sm ${
                    feature.pro === "Unlimited" ? "font-bold text-[#171126]" : "text-[#665d82] font-medium"
                  }`}>
                    {feature.pro}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PricingPage() {
  const { isAuthenticated } = useAuth();
  const { currency, toggleCurrency, billingInterval, toggleBillingInterval } = usePricing();

  const freePlan = PLANS.find((p) => p.id === "free")!;
  const proPlan = PLANS.find((p) => p.id === "pro")!;

  const proSavings = getAnnualSavingsPercent(proPlan, currency);

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-b from-white via-slate-50/50 to-white">
        {/* Controls: Currency + Billing Toggle */}
        <section className="pt-16 pb-4 px-4">
          <div className="flex flex-col items-center gap-4">
            {/* Currency toggle */}
            <CurrencyToggle currency={currency} onToggle={toggleCurrency} />

            {/* Billing interval toggle */}
            <BillingToggle
              interval={billingInterval}
              onToggle={toggleBillingInterval}
              savingsPercent={proSavings}
            />
          </div>
        </section>

        {/* Plan Cards — 2 columns */}
        <section className="px-4 pb-20 pt-8 max-w-4xl mx-auto">
          <div className="grid gap-6 md:grid-cols-2 items-start">
            <FreePlanCard plan={freePlan} currency={currency} />
            <ProPlanCard plan={proPlan} currency={currency} interval={billingInterval} />
          </div>
        </section>

        {/* Compare Plans Table */}
        <section className="px-4 pb-20 max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-[#171126] text-center mb-10">
            Compare plans
          </h2>
          <div className="rounded-2xl border border-[#dfdbea] bg-white p-4 md:p-6">
            <ComparePlansTable currency={currency} />
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="px-4 pb-20">
          <div className="max-w-2xl mx-auto text-center rounded-2xl bg-gradient-to-br from-[#6d48ff] to-violet-600 p-10 text-white shadow-xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Ready to automate your growth?
            </h2>
            <p className="text-violet-200 mb-6 max-w-lg mx-auto text-sm">
              Join thousands of creators using Flowora to engage their audience, capture leads, and sell on autopilot.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                asChild
                className="bg-white text-[#6d48ff] hover:bg-violet-50 font-semibold px-6"
              >
                <Link to={isAuthenticated ? "/dashboard" : "/login"}>
                  Get Started Free
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
