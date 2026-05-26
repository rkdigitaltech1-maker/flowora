import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CreditCard, ShieldCheck, Check, Sparkles, ArrowRight,
  Percent, Lock, Info, Star, ChevronRight, HelpCircle,
  Play, Volume2, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { toast } from "sonner";
import { PLANS, formatPrice, getAnnualSavingsPercent, type Currency, type BillingInterval } from "@/lib/pricing.ts";
import { usePricing } from "@/hooks/use-pricing.ts";

// Custom Google Pay Icon
const GooglePayIcon = () => (
  <svg className="h-5 w-10 mr-1" viewBox="0 0 40 20" fill="none">
    <path d="M15.4 4.5h-2.5v10.3h2.5V4.5zM7.2 4.5H2v10.3h5.2c1.7 0 3.1-.6 4.1-1.7 1.1-1.1 1.6-2.5 1.6-4.1s-.5-3-1.6-4.1c-1-1.1-2.4-1.7-4.1-1.7zm1.7 7.2c-.4.5-1 .8-1.7.8H4.5V6.7h2.7c.7 0 1.3.3 1.7.8.4.5.6 1.1.6 1.8s-.2 1.3-.6 1.8zm22.4-7.2h-2.5v7c0 .8-.2 1.4-.6 1.8-.4.4-.9.6-1.7.6-.8 0-1.3-.2-1.7-.6-.4-.4-.6-1-.6-1.8v-7h-2.5v7.2c0 1.4.4 2.5 1.2 3.3.8.8 1.9 1.2 3.4 1.2s2.6-.4 3.4-1.2c.8-.8 1.2-1.9 1.2-3.3v-7.2zm4.4 7c0 .8.2 1.4.6 1.8.4.4.9.6 1.7.6.8 0 1.3-.2 1.7-.6.4-.4.6-1 .6-1.8v-7h2.5v7.2c0 1.4-.4 2.5-1.2 3.3-.8.8-1.9 1.2-3.4 1.2s-2.6-.4-3.4-1.2c-.8-.8-1.2-1.9-1.2-3.3v-7.2h2.5v7z" fill="currentColor"/>
  </svg>
);

// Custom PayPal Icon
const PayPalIcon = () => (
  <svg className="h-5 w-14" viewBox="0 0 100 28" fill="none">
    <path d="M16.5 4.5h-9c-.6 0-1.1.4-1.2.9L1.4 24.3c-.1.5.3.9.8.9h4.7c.5 0 .9-.3 1-.8L9.8 13c.1-.5.5-.8 1-.8h3c4.5 0 7.8-1.8 8.8-6.2.5-2.2-.1-3.9-1.4-4.8-1.2-.8-2.9-1.2-4.7-1.2z" fill="#003087" />
    <path d="M16.5 4.5c1.8 0 3.5.4 4.7 1.2 1.3.9 1.9 2.6 1.4 4.8-.5 2.5-2 4.5-4.5 5.5-.5.2-1.1.3-1.7.3h-4.3c-.5 0-.9.3-1 .8L9 25.1c-.1.5.3.9.8.9h4.3c.5 0 .9-.3 1-.8l1.6-10.2c.1-.5.5-.8 1-.8h1c4.5 0 7.8-1.8 8.8-6.2.6-2.5-.2-4.5-1.7-5.5-1.4-1-3.6-1.4-5.8-1.4z" fill="#0079C1" />
  </svg>
);

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
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0); // Percentage
  const [promoApplied, setPromoApplied] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal" | "gpay">("card");

  // Form Fields
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [email, setEmail] = useState("aisha@createwith.co");

  // Interactive flow states
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  // Price calculations using pricing.ts
  const baseMonthly = proPlan.pricing[currency].monthly;
  const baseAnnual = proPlan.pricing[currency].annual;
  const basePrice = billingInterval === "monthly" ? baseMonthly : baseAnnual;
  const currSymbol = currency === "INR" ? "₹" : "$";
  
  const discountMultiplier = 1 - (appliedDiscount / 100);
  const subtotal = basePrice * (billingInterval === "yearly" ? 12 : 1);
  const discountedSubtotal = subtotal * discountMultiplier;
  const tax = discountedSubtotal * 0.08; // 8% Tax
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

  // Luhn validator helper for credit cards
  const validateCard = (num: string) => {
    const cleanNum = num.replace(/\s+/g, "");
    if (cleanNum.length < 13 || cleanNum.length > 19) return false;
    let sum = 0;
    let shouldDouble = false;
    for (let i = cleanNum.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanNum.charAt(i));
      if (shouldDouble) {
        if ((digit *= 2) > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === "card") {
      if (!cardName.trim()) { toast.error("Please enter the name on your card."); return; }
      if (!cardNumber.replace(/\s+/g, "")) { toast.error("Please enter a valid credit card number."); return; }
      if (!cardExpiry) { toast.error("Please enter your card expiry date."); return; }
      if (!cardCvc || cardCvc.length < 3) { toast.error("Please enter your card CVV/CVC code."); return; }
    }

    setProcessing(true);
    // Simulate premium payment processor response
    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);
      toast.success("Payment completed successfully! Welcome to Pro.");
      // After success show modal, then redirect
      setTimeout(() => {
        localStorage.setItem("cs_is_pro", "true");
        navigate("/dashboard");
      }, 3500);
    }, 2800);
  };

  // Auto-format card number
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    let formattedValue = value.match(/.{1,4}/g)?.join(" ") || value;
    setCardNumber(formattedValue.substring(0, 19));
  };

  // Auto-format card expiry
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length >= 2) {
      value = value.substring(0, 2) + "/" + value.substring(2, 4);
    }
    setCardExpiry(value.substring(0, 5));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16 relative">
      
      {/* Checkout Navbar */}
      <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/dashboard")}>
            <div className="h-8 w-8 rounded-lg bg-[#6d48ff] flex items-center justify-center">
              <Sparkles className="h-4.5 w-4.5 text-white fill-white" />
            </div>
            <span className="font-extrabold text-lg tracking-tight">Flowora</span>
            <span className="text-[10px] px-1.5 py-0.5 font-bold uppercase tracking-wider bg-slate-100 text-slate-600 rounded">Checkout</span>
          </div>
          <button onClick={() => navigate("/dashboard")} className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors">
            Cancel & return
          </button>
        </div>
      </header>

      {/* Success Modal Backdrop */}
      {success && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border border-slate-100 transform scale-100 transition-transform duration-300">
            <div className="h-20 w-20 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-6 animate-bounce">
              <Check className="h-10 w-10 stroke-[3]" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Upgrade Successful! 🎉</h2>
            <p className="text-slate-500 mt-2 text-sm leading-relaxed">
              Your Flowora Pro account is now active. You have unlocked unlimited automations, advanced analytics, and custom AI responses.
            </p>
            <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left text-xs space-y-2">
              <div className="flex justify-between font-medium">
                <span className="text-slate-400">Subscription:</span>
                <span className="text-slate-900 font-bold">Flowora Pro ({billingInterval})</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-slate-400">Total Billed:</span>
                <span className="text-slate-900 font-bold">{currSymbol}{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-slate-400">Status:</span>
                <span className="text-emerald-600 font-bold">Paid</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-6 animate-pulse">Redirecting you to dashboard...</p>
          </div>
        </div>
      )}

      {/* Main Grid Content */}
      <main className="max-w-6xl mx-auto px-4 mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        
        {/* Left Column: Form and Payments */}
        <div className="space-y-6">
          
          {/* Billing Interval Toggle Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Select your billing cycle</h3>
              <p className="text-xs text-slate-500 mt-0.5">Switch to annual billing to save {savingsPercent}% on your subscription.</p>
            </div>
            
            {/* Interval Toggle Tabs */}
            <div className="bg-slate-100 p-1 rounded-xl flex gap-1 border border-slate-200 shrink-0 select-none">
              <button
                onClick={() => setBillingInterval("monthly")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${billingInterval === "monthly" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
              >
                Monthly ({currSymbol}{baseMonthly}{currency === "INR" ? "" : "/mo"})
              </button>
              <button
                onClick={() => setBillingInterval("yearly")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${billingInterval === "yearly" ? "bg-white text-[#6d48ff] shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
              >
                Yearly ({currSymbol}{baseAnnual}/mo)
                <span className="bg-[#6d48ff]/10 text-[#6d48ff] text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider">Save {savingsPercent}%</span>
              </button>
            </div>
          </div>

          {/* Currency Toggle */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Currency</span>
            <div className="bg-slate-100 p-1 rounded-lg flex gap-1 border border-slate-200 select-none">
              <button
                onClick={() => setCurrency("USD")}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${currency === "USD" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
              >
                🇺🇸 USD ($)
              </button>
              <button
                onClick={() => setCurrency("INR")}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${currency === "INR" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
              >
                🇮🇳 INR (₹)
              </button>
            </div>
          </div>

          {/* Payment Method Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            
            {/* Header tab choices */}
            <div className="grid grid-cols-3 border-b border-slate-200 text-center select-none bg-slate-50/50">
              <button
                onClick={() => setPaymentMethod("card")}
                className={`py-4 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${paymentMethod === "card" ? "border-[#6d48ff] text-[#6d48ff] bg-white font-black" : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"}`}
              >
                <CreditCard className="h-4 w-4" />
                Credit Card
              </button>
              <button
                onClick={() => setPaymentMethod("paypal")}
                className={`py-4 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${paymentMethod === "paypal" ? "border-[#6d48ff] text-[#6d48ff] bg-white font-black" : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"}`}
              >
                <PayPalIcon />
              </button>
              <button
                onClick={() => setPaymentMethod("gpay")}
                className={`py-4 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${paymentMethod === "gpay" ? "border-[#6d48ff] text-[#6d48ff] bg-white font-black" : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"}`}
              >
                <GooglePayIcon />
              </button>
            </div>

            {/* Form Fields */}
            <div className="p-6">
              <form onSubmit={handlePayment} className="space-y-4">
                
                {paymentMethod === "card" && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="space-y-1.5">
                      <Label htmlFor="checkout-email" className="text-slate-600 text-xs font-bold">Email Address</Label>
                      <Input
                        id="checkout-email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        className="bg-white border-slate-200 rounded-xl h-11 focus:ring-2 focus:ring-[#6d48ff]/20 focus:border-[#6d48ff] text-sm font-medium"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label htmlFor="checkout-name" className="text-slate-600 text-xs font-bold">Cardholder Name</Label>
                      <Input
                        id="checkout-name"
                        type="text"
                        placeholder="John Doe"
                        value={cardName}
                        onChange={e => setCardName(e.target.value)}
                        required
                        className="bg-white border-slate-200 rounded-xl h-11 focus:ring-2 focus:ring-[#6d48ff]/20 focus:border-[#6d48ff] text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="checkout-number" className="text-slate-600 text-xs font-bold">Card Number</Label>
                      <div className="relative">
                        <Input
                          id="checkout-number"
                          type="text"
                          placeholder="0000 0000 0000 0000"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          required
                          className="bg-white border-slate-200 rounded-xl h-11 pr-10 focus:ring-2 focus:ring-[#6d48ff]/20 focus:border-[#6d48ff] text-sm tracking-wider font-medium"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                          <CreditCard className="h-4 w-4 text-slate-400" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="checkout-expiry" className="text-slate-600 text-xs font-bold">Expiry Date</Label>
                        <Input
                          id="checkout-expiry"
                          type="text"
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={handleExpiryChange}
                          required
                          className="bg-white border-slate-200 rounded-xl h-11 focus:ring-2 focus:ring-[#6d48ff]/20 focus:border-[#6d48ff] text-sm text-center font-medium"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="checkout-cvc" className="text-slate-600 text-xs font-bold">CVC / CVV</Label>
                        <Input
                          id="checkout-cvc"
                          type="password"
                          placeholder="•••"
                          maxLength={4}
                          value={cardCvc}
                          onChange={e => setCardCvc(e.target.value.replace(/\D/g, ""))}
                          required
                          className="bg-white border-slate-200 rounded-xl h-11 focus:ring-2 focus:ring-[#6d48ff]/20 focus:border-[#6d48ff] text-sm text-center font-medium"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === "paypal" && (
                  <div className="py-6 text-center space-y-4 animate-fade-in">
                    <div className="h-12 w-12 mx-auto rounded-full bg-blue-50 flex items-center justify-center text-[#003087]">
                      <Info className="h-6 w-6" />
                    </div>
                    <div className="max-w-xs mx-auto">
                      <p className="text-sm font-bold text-slate-800">Complete payment via PayPal</p>
                      <p className="text-xs text-slate-400 mt-1">We will launch a new window to securely authenticate your PayPal credentials.</p>
                    </div>
                  </div>
                )}

                {paymentMethod === "gpay" && (
                  <div className="py-6 text-center space-y-4 animate-fade-in">
                    <div className="h-12 w-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                      <Info className="h-6 w-6" />
                    </div>
                    <div className="max-w-xs mx-auto">
                      <p className="text-sm font-bold text-slate-800">Complete payment via Google Pay</p>
                      <p className="text-xs text-slate-400 mt-1">Pay quickly using cards stored inside your Google Account.</p>
                    </div>
                  </div>
                )}

                {/* Terms Acceptance */}
                <div className="text-[11px] text-slate-400 leading-normal mt-2">
                  By clicking below, you authorize Flowora to charge your chosen payment method today and automatically renew your subscription at the same rate until cancelled.
                </div>

                {/* Large CTA Upgrade Button */}
                <Button
                  type="submit"
                  disabled={processing}
                  className="w-full bg-[#6d48ff] hover:bg-[#5b3ce3] text-white font-bold h-12 rounded-xl shadow-lg shadow-[#6d48ff]/15 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-4 text-sm disabled:opacity-60"
                >
                  {processing ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" /> Securing transaction…
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Lock className="h-4 w-4" /> Upgrade to Flowora Pro · {currSymbol}{total.toFixed(2)}
                    </span>
                  )}
                </Button>
              </form>
            </div>
            
            {/* Stripe/Security badge footer */}
            <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-emerald-600" /> Secure 256-bit SSL encrypted connection
              </span>
              <div className="flex items-center gap-3 grayscale opacity-60">
                <ShieldCheck className="h-4.5 w-4.5" />
                <span className="text-xs font-bold text-slate-500">Stripe Verified</span>
              </div>
            </div>
          </div>

          {/* Checkout Trust Testimonial */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-[#f4effd] text-[#6d48ff] font-bold flex items-center justify-center shrink-0">
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
                  <Star className="h-3 w-3 fill-current" />
                  <Star className="h-3 w-3 fill-current" />
                  <Star className="h-3 w-3 fill-current" />
                  <Star className="h-3 w-3 fill-current" />
                  <Star className="h-3 w-3 fill-current" />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Order Summary, Trust Badges, FAQs */}
        <div className="space-y-6">
          
          {/* Order Summary Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">Order Summary</h3>
            
            {/* Plan Info Row */}
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-slate-800 text-sm">Flowora Pro</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {billingInterval === "yearly" ? `Billed annually (${currSymbol}${baseAnnual}/mo)` : `Billed monthly (${currSymbol}${baseMonthly}/mo)`}
                </p>
              </div>
              <span className="font-bold text-sm text-slate-800">
                {currSymbol}{(basePrice * (billingInterval === "yearly" ? 12 : 1)).toFixed(2)}
              </span>
            </div>

            {/* Promo Code Applied Row */}
            {promoApplied && (
              <div className="flex justify-between items-center text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl">
                <span className="flex items-center gap-1">
                  <Percent className="h-3.5 w-3.5" /> Promo (CREATOR50): 50% Off
                </span>
                <div className="flex items-center gap-2">
                  <span>-{currSymbol}{(subtotal * (appliedDiscount / 100)).toFixed(2)}</span>
                  <button onClick={handleRemovePromo} className="text-slate-400 hover:text-red-500 cursor-pointer">×</button>
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
                <span>GST / Taxes (8%)</span>
                <span className="text-slate-700 font-semibold">{currSymbol}{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-black border-t border-slate-100 pt-3">
                <span className="text-slate-900">Total Charged Today</span>
                <span className="text-[#6d48ff] text-base">{currSymbol}{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Dynamic Promo Code Input Form */}
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

          {/* Refund Guarantee Trust Card */}
          <div className="bg-gradient-to-br from-[#fffdf5] to-[#fffde9] rounded-2xl p-6 border border-[#efe3bf] shadow-sm flex gap-4">
            <div className="h-12 w-12 rounded-full bg-[#fcf5d9] text-[#b45309] font-bold flex items-center justify-center shrink-0 border border-[#f5e9bd]">
              🌟
            </div>
            <div>
              <h4 className="font-bold text-amber-900 text-sm">30-day money-back guarantee</h4>
              <p className="text-xs text-amber-800 leading-relaxed mt-1">
                Try Pro risk-free. If you don't scale your audience or automate your sales within the first month, let us know and we'll refund your payment immediately.
              </p>
            </div>
          </div>

          {/* Frequently Asked Checkout Questions */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <HelpCircle className="h-4.5 w-4.5 text-slate-400" /> Checkout Questions
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
