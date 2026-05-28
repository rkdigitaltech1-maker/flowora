import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check, Sparkles, ArrowLeft, Lock, HelpCircle, Star, X
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { toast } from "sonner";
import { PLANS, getAnnualSavingsPercent, type Currency } from "@/lib/pricing.ts";
import { usePricing } from "@/hooks/use-pricing.ts";
import { processPayment } from "@/lib/razorpay.ts";

const FAQS = [
  { q: "Can I cancel my subscription anytime?", a: "Yes, you can cancel in one click from your account billing settings. You will retain access to Pro features until the end of your billing cycle." },
  { q: "How does the 30-day money-back guarantee work?", a: "If you are not satisfied with Flowora Pro within 30 days, just email our support team. We'll issue a full refund immediately—no questions asked." },
  { q: "What counts as a DM or contact limit?", a: "A 'DM' is any automated message sent by your campaigns. A 'contact' is a unique user who has interacted with your automations or whose details were captured." }
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { currency, setCurrency, billingInterval: pricingInterval, setBillingInterval: setPricingInterval } = usePricing();
  const proPlan = PLANS.find(p => p.id === "pro")!;
  const savingsPercent = getAnnualSavingsPercent(proPlan, currency);

  // Checkout State
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">(pricingInterval === "annual" ? "yearly" : "monthly");
  const [promoCode, setPromoCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [promoApplied, setPromoApplied] = useState(false);

  // Billing Form Fields (Razorpay-style)
  const [billedTo, setBilledTo] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("India");
  const [state, setState] = useState("");

  // Interactive flow states
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  // Price calculations
  const baseMonthly = proPlan.pricing[currency].monthly;
  const baseAnnual = proPlan.pricing[currency].annual;
  const basePrice = billingInterval === "monthly" ? baseMonthly : baseAnnual;
  const currSymbol = currency === "INR" ? "\u20B9" : "$";
  const gstRate = currency === "INR" ? 0.18 : 0.08; // 18% GST for India, 8% tax for USD
  const gstLabel = currency === "INR" ? "GST (18%)" : "Tax (8%)";

  const subtotal = basePrice * (billingInterval === "yearly" ? 12 : 1);
  const discountAmount = subtotal * (appliedDiscount / 100);
  const discountedSubtotal = subtotal - discountAmount;
  const tax = discountedSubtotal * gstRate;
  const total = discountedSubtotal + tax;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = promoCode.trim().toUpperCase();
    if (cleanCode === "CREATOR50") {
      setAppliedDiscount(50);
      setPromoApplied(true);
      toast.success("Promo code CREATOR50 applied: 50% discount!");
    } else if (cleanCode === "") {
      toast.error("Please enter a promo code first.");
    } else {
      toast.error("Invalid promo code. Try 'CREATOR50' for a 50% demo discount.");
    }
  };

  const handleRemovePromo = () => {
    setAppliedDiscount(0);
    setPromoApplied(false);
    setPromoCode("");
    toast.info("Promo code removed.");
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!billedTo.trim()) { toast.error("Please enter your name."); return; }
    if (!phone.trim()) { toast.error("Please enter your phone number."); return; }
    if (!state.trim()) { toast.error("Please select your state/province."); return; }

    setProcessing(true);

    try {
      // Calculate amount in smallest currency unit (paise for INR, cents for USD)
      const amountInSmallestUnit = Math.round(total * (currency === "INR" ? 100 : 100));

      const result = await processPayment({
        orderParams: {
          amount: amountInSmallestUnit,
          currency,
          planId: "pro",
          billingInterval: billingInterval === "yearly" ? "yearly" : "monthly",
          promoCode: promoApplied ? promoCode.trim().toUpperCase() : undefined,
          discountPercent: appliedDiscount || undefined,
        },
        customerName: billedTo.trim(),
        customerPhone: phone.trim(),
      });

      if (result.success) {
        // Payment verified server-side, subscription is now active
        setProcessing(false);
        setSuccess(true);
        toast.success("Payment completed successfully! Welcome to Flowora Pro.");

        // Update local state to reflect Pro status
        localStorage.setItem("cs_is_pro", "true");

        setTimeout(() => {
          navigate("/dashboard");
          // Reload to refresh subscription context from server
          window.location.reload();
        }, 3500);
      }
    } catch (error: any) {
      setProcessing(false);

      if (error.message?.includes("cancelled")) {
        toast.info("Payment was cancelled. You can try again whenever you're ready.");
      } else {
        toast.error(error.message || "Payment failed. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16 relative">

      {/* Checkout Navbar */}
      <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/dashboard")}>
            <div className="h-8 w-8 rounded-lg bg-[#6d48ff] flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white fill-white" />
            </div>
            <span className="font-extrabold text-lg tracking-tight">Flowora</span>
            <span className="text-[10px] px-1.5 py-0.5 font-bold uppercase tracking-wider bg-slate-100 text-slate-600 rounded">Checkout</span>
          </div>
          <button onClick={() => navigate("/dashboard")} className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer">
            Cancel & return
          </button>
        </div>
      </header>

      {/* Success Modal */}
      {success && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border border-slate-100">
            <div className="h-20 w-20 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-6 animate-bounce">
              <Check className="h-10 w-10 stroke-[3]" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Upgrade Successful!</h2>
            <p className="text-slate-500 mt-2 text-sm leading-relaxed">
              Your Flowora Pro account is now active. You have unlocked unlimited automations, advanced analytics, and priority support.
            </p>
            <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left text-xs space-y-2">
              <div className="flex justify-between font-medium">
                <span className="text-slate-400">Subscription:</span>
                <span className="text-slate-900 font-bold">Flowora Pro ({billingInterval === "yearly" ? "Annual" : "Monthly"})</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-slate-400">Total Paid:</span>
                <span className="text-slate-900 font-bold">{currSymbol}{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-slate-400">Payment via:</span>
                <span className="text-slate-900 font-bold">Razorpay</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-6 animate-pulse">Redirecting you to dashboard...</p>
          </div>
        </div>
      )}

      {/* Main Grid Content */}
      <main className="max-w-6xl mx-auto px-4 mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">

        {/* Left Column: Billing Form */}
        <div className="space-y-6">

          {/* Billing Interval Toggle */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Select your billing cycle</h3>
              <p className="text-xs text-slate-500 mt-0.5">Switch to <span className="text-[#6d48ff] font-semibold">annual</span> billing to save {savingsPercent}% on your subscription.</p>
            </div>

            <div className="bg-slate-100 p-1 rounded-xl flex gap-1 border border-slate-200 shrink-0 select-none">
              <button
                onClick={() => setBillingInterval("monthly")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${billingInterval === "monthly" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
              >
                Monthly ({currSymbol}{baseMonthly})
              </button>
              <button
                onClick={() => setBillingInterval("yearly")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${billingInterval === "yearly" ? "bg-white text-[#6d48ff] shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
              >
                Yearly ({currSymbol}{baseAnnual}/mo)
                <span className="bg-emerald-100 text-emerald-700 text-[9px] px-1.5 py-0.5 rounded font-black uppercase">Save {savingsPercent}%</span>
              </button>
            </div>
          </div>

          {/* Currency Toggle */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Currency</span>
            <div className="bg-slate-100 p-1 rounded-lg flex gap-1 border border-slate-200 select-none">
              <button
                onClick={() => setCurrency("USD")}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${currency === "USD" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
              >
                🇺🇸 USD ($)
              </button>
              <button
                onClick={() => setCurrency("INR")}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${currency === "INR" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
              >
                🇮🇳 INR ({currSymbol})
              </button>
            </div>
          </div>

          {/* Billing Details Form - Razorpay Style */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-6">
              <form onSubmit={handlePayment} className="space-y-5">

                {/* Billed To */}
                <div>
                  <h3 className="font-bold text-slate-900 text-base mb-4">Billed to</h3>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Input
                        type="text"
                        placeholder="Full Name"
                        value={billedTo}
                        onChange={e => setBilledTo(e.target.value)}
                        required
                        className="bg-white border-slate-200 rounded-xl h-12 focus:ring-2 focus:ring-[#6d48ff]/20 focus:border-[#6d48ff] text-sm font-medium"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 h-12 shrink-0">
                        <span className="text-xs font-bold text-slate-500">IN</span>
                        <span className="text-sm font-medium text-slate-700">+91</span>
                      </div>
                      <Input
                        type="tel"
                        placeholder="Phone Number"
                        value={phone}
                        onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        required
                        className="bg-white border-slate-200 rounded-xl h-12 focus:ring-2 focus:ring-[#6d48ff]/20 focus:border-[#6d48ff] text-sm font-medium flex-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Billing Details */}
                <div>
                  <h3 className="font-bold text-slate-900 text-base mb-4">Billing Details</h3>
                  <div className="space-y-4">
                    <div className="relative">
                      <select
                        value={country}
                        onChange={e => setCountry(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl h-12 px-4 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-[#6d48ff]/20 focus:border-[#6d48ff] appearance-none cursor-pointer"
                      >
                        <option value="India">India</option>
                        <option value="United States">United States</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Singapore">Singapore</option>
                        <option value="UAE">United Arab Emirates</option>
                        <option value="Other">Other</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>

                    <Input
                      type="text"
                      placeholder="State / Province"
                      value={state}
                      onChange={e => setState(e.target.value)}
                      required
                      className="bg-white border-slate-200 rounded-xl h-12 focus:ring-2 focus:ring-[#6d48ff]/20 focus:border-[#6d48ff] text-sm font-medium"
                    />
                  </div>
                </div>

                {/* Proceed to Pay Button - Razorpay Gradient */}
                <Button
                  type="submit"
                  disabled={processing}
                  className="w-full h-14 rounded-xl font-bold text-white text-base shadow-lg transition-all cursor-pointer mt-4 disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #6d48ff 0%, #c471ed 50%, #f64f59 100%)" }}
                >
                  {processing ? (
                    <span className="flex items-center gap-2">
                      <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      Processing Payment...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      Proceed to Pay {currSymbol}{total.toFixed(0)}
                    </span>
                  )}
                </Button>

                {/* Razorpay Secured Badge */}
                <div className="flex items-center justify-center gap-2 pt-2">
                  <Lock className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-[11px] text-slate-400 font-medium">Secured by</span>
                  <span className="text-[11px] font-bold text-blue-600">Razorpay</span>
                </div>
              </form>
            </div>
          </div>

          {/* Testimonial */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-[#f4effd] text-[#6d48ff] font-bold flex items-center justify-center shrink-0 text-sm">
              P
            </div>
            <div>
              <p className="text-xs italic text-slate-600 leading-relaxed">
                "I went from 0 to 2,400 email subscribers in 6 weeks using Flowora's comment automation. The Pro upgrade was a no-brainer."
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-xs font-bold text-slate-800">Priya Sharma</span>
                <span className="text-[10px] text-slate-400">@priya.creates</span>
                <div className="flex text-amber-400 ml-auto scale-90">
                  {[1,2,3,4,5].map(i => <Star key={i} className="h-3 w-3 fill-current" />)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="space-y-6">

          {/* Selected Plan Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <p className="text-[10px] font-bold text-[#6d48ff] uppercase tracking-wider">Selected Plan</p>
                <p className="font-black text-slate-900 text-lg mt-0.5">{billingInterval === "monthly" ? "Monthly" : "Annual"} Plan</p>
              </div>
              <button
                onClick={() => navigate("/pricing")}
                className="text-[10px] font-bold text-slate-400 hover:text-[#6d48ff] transition-colors cursor-pointer"
              >
                &larr; Back to Plans
              </button>
            </div>

            {/* Plan Info Row */}
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-slate-800 text-sm">Flowora Pro</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {billingInterval === "yearly" ? `Billed annually (${currSymbol}${baseAnnual}/mo)` : `Billed monthly (${currSymbol}${baseMonthly}/mo)`}
                </p>
              </div>
              <span className="font-bold text-sm text-slate-800">
                {currSymbol}{subtotal.toFixed(2)}
              </span>
            </div>

            {/* Promo Code Applied Row */}
            {promoApplied && (
              <div className="flex justify-between items-center text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl">
                <span className="flex items-center gap-1">
                  Promo (CREATOR50): 50% Off
                </span>
                <div className="flex items-center gap-2">
                  <span>-{currSymbol}{discountAmount.toFixed(2)}</span>
                  <button onClick={handleRemovePromo} className="text-slate-400 hover:text-red-500 cursor-pointer">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Calculations breakdown */}
            <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400 font-medium">
                <span>Subtotal</span>
                <span className="text-slate-700 font-semibold">{currSymbol}{discountedSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400 font-medium">
                <span>{gstLabel}</span>
                <span className="text-slate-700 font-semibold">{currSymbol}{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-black border-t border-slate-100 pt-3">
                <span className="text-slate-900">Total Payable</span>
                <span className="text-[#6d48ff] text-lg">{currSymbol}{total.toFixed(0)}</span>
              </div>
            </div>

            {/* Promo Code Input */}
            {!promoApplied && (
              <form onSubmit={handleApplyPromo} className="flex gap-2 pt-2 border-t border-slate-100">
                <Input
                  type="text"
                  placeholder="Promo code (e.g. CREATOR50)"
                  value={promoCode}
                  onChange={e => setPromoCode(e.target.value)}
                  className="bg-slate-50 border-slate-200 rounded-xl h-10 text-xs focus:ring-2 focus:ring-[#6d48ff]/20 focus:border-[#6d48ff]"
                />
                <Button type="submit" variant="outline" className="h-10 border-slate-200 text-xs font-bold rounded-xl hover:bg-slate-50 cursor-pointer px-4">
                  Apply
                </Button>
              </form>
            )}
          </div>

          {/* 30-Day Money-Back Guarantee */}
          <div className="bg-gradient-to-br from-[#fffdf5] to-[#fffde9] rounded-2xl p-6 border border-[#efe3bf] shadow-sm flex gap-4">
            <div className="h-12 w-12 rounded-full bg-[#fcf5d9] text-[#b45309] font-bold flex items-center justify-center shrink-0 border border-[#f5e9bd] text-xl">
              🌟
            </div>
            <div>
              <h4 className="font-bold text-amber-900 text-sm">30-day money-back guarantee</h4>
              <p className="text-xs text-amber-800 leading-relaxed mt-1">
                Try Pro risk-free. If you don't scale your audience or automate your sales within the first month, let us know and we'll refund your payment immediately.
              </p>
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4 text-slate-400" /> Checkout Questions
            </h4>
            <div className="divide-y divide-slate-100">
              {FAQS.map(faq => (
                <div key={faq.q} className="py-3 first:pt-0 last:pb-0">
                  <p className="text-xs font-bold text-slate-800">{faq.q}</p>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
