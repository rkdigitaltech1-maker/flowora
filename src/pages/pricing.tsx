import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Check,
  X,
  Sparkles,
  ArrowRight,
  Crown,
  Zap,
  HelpCircle,
  ChevronDown,
  Shield,
  Star,
  Users,
  MessageSquare,
  IndianRupee,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { PageLayout } from "@/components/PageLayout.tsx";
import { useAuth } from "@/hooks/use-auth.ts";
import { usePricing } from "@/hooks/use-pricing.ts";
import {
  PLANS,
  formatPrice,
  getAnnualSavingsPercent,
  type Currency,
  type BillingInterval,
  type Plan,
} from "@/lib/pricing.ts";

// FAQ data
const FAQS = [
  {
    q: "Can I switch between INR and USD billing?",
    a: "Yes! You can select your preferred currency during checkout. Once subscribed, you can switch currency at the next billing cycle by contacting support.",
  },
  {
    q: "Is there a free trial?",
    a: "Yes, Starter and Pro plans come with a 14-day free trial. No credit card required to start. You'll only be charged after the trial ends.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Absolutely. Cancel anytime from your billing settings. You'll retain access until the end of your current billing period.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit/debit cards, UPI (for INR), Google Pay, PayPal, and bank transfers for Enterprise plans.",
  },
  {
    q: "Do you offer refunds?",
    a: "Yes, we have a 30-day money-back guarantee. If you're not satisfied, email support for a full refund—no questions asked.",
  },
  {
    q: "What happens when I hit my plan limits?",
    a: "You'll receive notifications as you approach limits. You can upgrade anytime to increase your limits instantly without losing data.",
  },
];

function CurrencyToggle({
  currency,
  onToggle,
}: {
  currency: Currency;
  onToggle: () => void;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[#dfdbea] bg-white p-1 shadow-sm">
      <button
        onClick={() => currency !== "USD" && onToggle()}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
          currency === "USD"
            ? "bg-[#6d48ff] text-white shadow-sm"
            : "text-[#665d82] hover:text-[#171126]"
        }`}
      >
        <DollarSign className="h-3.5 w-3.5" />
        USD
      </button>
      <button
        onClick={() => currency !== "INR" && onToggle()}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
          currency === "INR"
            ? "bg-[#6d48ff] text-white shadow-sm"
            : "text-[#665d82] hover:text-[#171126]"
        }`}
      >
        <IndianRupee className="h-3.5 w-3.5" />
        INR
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
    <div className="inline-flex items-center gap-3">
      <span
        className={`text-sm font-medium ${interval === "monthly" ? "text-[#171126]" : "text-[#82799b]"}`}
      >
        Monthly
      </span>
      <button
        onClick={onToggle}
        className="relative h-7 w-12 rounded-full bg-[#e6e2ee] transition-colors data-[active=true]:bg-[#6d48ff]"
        data-active={interval === "annual"}
      >
        <span
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${
            interval === "annual" ? "translate-x-5.5" : "translate-x-0.5"
          }`}
        />
      </button>
      <span
        className={`text-sm font-medium ${interval === "annual" ? "text-[#171126]" : "text-[#82799b]"}`}
      >
        Annual
      </span>
      {savingsPercent > 0 && (
        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-600">
          Save {savingsPercent}%
        </span>
      )}
    </div>
  );
}

function PlanCard({
  plan,
  currency,
  interval,
  isCurrentPlan,
}: {
  plan: Plan;
  currency: Currency;
  interval: BillingInterval;
  isCurrentPlan: boolean;
}) {
  const navigate = useNavigate();
  const price = interval === "monthly" ? plan.pricing[currency].monthly : plan.pricing[currency].annual;
  const savingsPercent = getAnnualSavingsPercent(plan, currency);

  const tierIcons: Record<string, React.ReactNode> = {
    free: <Zap className="h-5 w-5 text-slate-500" />,
    starter: <Star className="h-5 w-5 text-amber-500" />,
    pro: <Crown className="h-5 w-5 text-[#6d48ff]" />,
    enterprise: <Shield className="h-5 w-5 text-indigo-600" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative flex flex-col rounded-2xl border p-6 transition-shadow hover:shadow-lg ${
        plan.popular
          ? "border-[#6d48ff] bg-gradient-to-b from-violet-50/50 to-white shadow-md ring-1 ring-[#6d48ff]/20"
          : "border-[#dfdbea] bg-white"
      }`}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 rounded-full bg-[#6d48ff] px-3 py-1 text-xs font-bold text-white shadow-sm">
            <Sparkles className="h-3 w-3" />
            Most Popular
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        {tierIcons[plan.id]}
        <h3 className="text-lg font-bold text-[#171126]">{plan.name}</h3>
      </div>
      <p className="text-sm text-[#82799b] mb-4">{plan.description}</p>

      {/* Price */}
      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold text-[#171126]">
            {formatPrice(price, currency)}
          </span>
          {price > 0 && (
            <span className="text-sm text-[#82799b]">/month</span>
          )}
        </div>
        {price > 0 && interval === "annual" && (
          <p className="mt-1 text-xs text-emerald-600 font-medium">
            Billed {formatPrice(price * 12, currency)}/year (save {savingsPercent}%)
          </p>
        )}
        {price > 0 && interval === "monthly" && (
          <p className="mt-1 text-xs text-[#82799b]">
            Switch to annual to save {savingsPercent}%
          </p>
        )}
      </div>

      {/* CTA */}
      <Button
        onClick={() => {
          if (plan.id === "enterprise") {
            window.open("mailto:sales@flowora.com?subject=Enterprise%20Plan%20Inquiry", "_blank");
          } else if (plan.id === "free") {
            navigate("/login");
          } else {
            navigate(`/dashboard/checkout?plan=${plan.id}&interval=${interval}&currency=${currency}`);
          }
        }}
        className={`w-full mb-6 ${
          plan.popular
            ? "bg-[#6d48ff] hover:bg-[#5a38e0] text-white"
            : plan.id === "enterprise"
            ? "bg-[#171126] hover:bg-[#2a1f45] text-white"
            : "bg-white border border-[#dfdbea] text-[#171126] hover:bg-[#f4f1fb]"
        }`}
        disabled={isCurrentPlan}
      >
        {isCurrentPlan ? "Current Plan" : plan.cta}
        {!isCurrentPlan && <ArrowRight className="ml-1.5 h-4 w-4" />}
      </Button>

      {/* Features */}
      <div className="space-y-2.5 flex-1">
        <p className="text-xs font-semibold text-[#82799b] uppercase tracking-wide">
          What's included
        </p>
        {plan.features.map((feature, i) => (
          <div key={i} className="flex items-start gap-2">
            {feature.included ? (
              <Check className={`h-4 w-4 mt-0.5 flex-shrink-0 ${feature.highlight ? "text-[#6d48ff]" : "text-emerald-500"}`} />
            ) : (
              <X className="h-4 w-4 mt-0.5 flex-shrink-0 text-slate-300" />
            )}
            <span
              className={`text-sm ${
                feature.included
                  ? feature.highlight
                    ? "font-medium text-[#171126]"
                    : "text-[#4a4362]"
                  : "text-slate-400"
              }`}
            >
              {feature.text}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-[#171126]">
          Frequently Asked Questions
        </h2>
        <p className="mt-2 text-[#82799b]">
          Everything you need to know about our pricing
        </p>
      </div>
      <div className="space-y-3">
        {FAQS.map((faq, i) => (
          <div
            key={i}
            className="rounded-xl border border-[#dfdbea] bg-white overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="flex w-full items-center justify-between p-4 text-left"
            >
              <span className="font-medium text-[#171126] pr-4">{faq.q}</span>
              <ChevronDown
                className={`h-4 w-4 flex-shrink-0 text-[#82799b] transition-transform ${
                  openIndex === i ? "rotate-180" : ""
                }`}
              />
            </button>
            <AnimatePresence>
              {openIndex === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="px-4 pb-4 text-sm text-[#665d82] leading-relaxed">
                    {faq.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}

function ComparisonTable({ currency, interval }: { currency: Currency; interval: BillingInterval }) {
  const features = [
    { name: "DMs per month", values: ["100", "1,000", "Unlimited", "Unlimited"] },
    { name: "Contacts", values: ["500", "2,500", "Unlimited", "Unlimited"] },
    { name: "Active workflows", values: ["2", "5", "Unlimited", "Unlimited"] },
    { name: "Products", values: ["3", "10", "Unlimited", "Unlimited"] },
    { name: "Campaigns", values: ["1", "5", "Unlimited", "Unlimited"] },
    { name: "Analytics", values: ["Basic", "Advanced", "Advanced + Exports", "Full Suite"] },
    { name: "Support", values: ["Community", "Email", "Priority Chat", "Phone + Dedicated AM"] },
    { name: "Custom branding", values: ["No", "Yes", "Yes", "Yes"] },
    { name: "API access", values: ["No", "No", "Yes", "Yes"] },
    { name: "Team seats", values: ["1", "1", "1", "5"] },
    { name: "White-label", values: ["No", "No", "No", "Yes"] },
    { name: "SLA guarantee", values: ["No", "No", "No", "99.9%"] },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-[#dfdbea]">
            <th className="py-4 px-4 text-left text-sm font-semibold text-[#171126] min-w-[180px]">
              Feature
            </th>
            {PLANS.map((plan) => (
              <th key={plan.id} className="py-4 px-4 text-center min-w-[140px]">
                <div className="text-sm font-bold text-[#171126]">{plan.name}</div>
                <div className="text-xs text-[#82799b] mt-0.5">
                  {formatPrice(
                    interval === "monthly" ? plan.pricing[currency].monthly : plan.pricing[currency].annual,
                    currency
                  )}
                  {plan.pricing[currency].monthly > 0 && "/mo"}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {features.map((feature, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-slate-50/50" : ""}>
              <td className="py-3 px-4 text-sm text-[#4a4362] font-medium">
                {feature.name}
              </td>
              {feature.values.map((val, j) => (
                <td key={j} className="py-3 px-4 text-center text-sm text-[#665d82]">
                  {val === "Yes" ? (
                    <Check className="h-4 w-4 text-emerald-500 mx-auto" />
                  ) : val === "No" ? (
                    <X className="h-4 w-4 text-slate-300 mx-auto" />
                  ) : (
                    <span className={val === "Unlimited" ? "font-semibold text-[#6d48ff]" : ""}>
                      {val}
                    </span>
                  )}
                </td>
              ))}
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
  const [showComparison, setShowComparison] = useState(false);

  // For "Current Plan" badge logic
  const currentPlan = "free"; // Default for unauthenticated users

  const proSavings = getAnnualSavingsPercent(
    PLANS.find((p) => p.id === "pro")!,
    currency
  );

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-violet-50/30">
        {/* Hero */}
        <section className="pt-20 pb-12 px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-[#6d48ff] mb-4">
              <Sparkles className="h-3 w-3" />
              Simple, transparent pricing
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-[#171126] mb-4">
              Choose the perfect plan for{" "}
              <span className="bg-gradient-to-r from-[#6d48ff] to-violet-500 bg-clip-text text-transparent">
                your growth
              </span>
            </h1>
            <p className="text-lg text-[#82799b] max-w-2xl mx-auto mb-8">
              Start free and scale as you grow. All plans include a 14-day free trial. No credit card required.
            </p>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
              <BillingToggle
                interval={billingInterval}
                onToggle={toggleBillingInterval}
                savingsPercent={proSavings}
              />
              <CurrencyToggle currency={currency} onToggle={toggleCurrency} />
            </div>
          </motion.div>
        </section>

        {/* Plan Cards */}
        <section className="px-4 pb-16 max-w-7xl mx-auto">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {PLANS.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                currency={currency}
                interval={billingInterval}
                isCurrentPlan={isAuthenticated && plan.id === currentPlan}
              />
            ))}
          </div>
        </section>

        {/* Comparison Table Toggle */}
        <section className="px-4 pb-16 max-w-7xl mx-auto">
          <div className="text-center mb-6">
            <Button
              variant="outline"
              onClick={() => setShowComparison(!showComparison)}
              className="border-[#dfdbea] text-[#665d82] hover:bg-[#f4f1fb]"
            >
              {showComparison ? "Hide" : "Show"} Full Comparison
              <ChevronDown className={`ml-1.5 h-4 w-4 transition-transform ${showComparison ? "rotate-180" : ""}`} />
            </Button>
          </div>
          <AnimatePresence>
            {showComparison && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="rounded-2xl border border-[#dfdbea] bg-white p-6 overflow-hidden"
              >
                <ComparisonTable currency={currency} interval={billingInterval} />
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Trust Indicators */}
        <section className="px-4 pb-16 max-w-4xl mx-auto">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-xl border border-[#dfdbea] bg-white p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
                <Shield className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#171126]">30-day guarantee</p>
                <p className="text-xs text-[#82799b]">Full refund, no questions</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-[#dfdbea] bg-white p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-50">
                <Users className="h-5 w-5 text-[#6d48ff]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#171126]">10,000+ creators</p>
                <p className="text-xs text-[#82799b]">Trust Flowora daily</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-[#dfdbea] bg-white p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50">
                <MessageSquare className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#171126]">24/7 support</p>
                <p className="text-xs text-[#82799b]">Chat, email & phone</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-4 pb-20">
          <FAQSection />
        </section>

        {/* Bottom CTA */}
        <section className="px-4 pb-20">
          <div className="max-w-3xl mx-auto text-center rounded-2xl bg-gradient-to-br from-[#6d48ff] to-violet-600 p-10 text-white shadow-xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Ready to automate your growth?
            </h2>
            <p className="text-violet-100 mb-6 max-w-lg mx-auto">
              Join thousands of creators who use Flowora to engage their audience, capture leads, and sell products on autopilot.
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
              <Button
                asChild
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 font-semibold px-6"
              >
                <a href="mailto:sales@flowora.com">Talk to Sales</a>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
