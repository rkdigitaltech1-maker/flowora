import { useState } from "react";
import { 
  CreditCard, Lock, Check, AlertCircle, Info, Sparkles, 
  ArrowRight, ChevronRight, Copy, CheckCircle2, RefreshCw 
} from "lucide-react";
import { toast } from "sonner";

export default function StripePlayground() {
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "tokens" | "forms">("all");
  
  // Simulated Card Payment State
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Helper to copy text to clipboard
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(label);
    toast.success(`Copied: ${text}`);
    setTimeout(() => setCopiedToken(null), 2000);
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

  // Simulate Stripe payment
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardName.trim() || !cardNumber || !cardExpiry || !cardCvc) {
      toast.error("Please fill in all card details.");
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      toast.success("Simulation payment succeeded!");
      setTimeout(() => {
        setIsSuccess(false);
        setCardName("");
        setCardNumber("");
        setCardExpiry("");
        setCardCvc("");
      }, 3000);
    }, 2000);
  };

  const colorTokens = [
    { name: "stripe-brand", hex: "#635bff", desc: "Primary brand Indigo", bgClass: "bg-stripe-brand", textClass: "text-white" },
    { name: "stripe-brand-dark", hex: "#0a2540", desc: "Deep headings / main text", bgClass: "bg-stripe-brand-dark", textClass: "text-white" },
    { name: "stripe-gray", hex: "#4f566b", desc: "Muted body text / labels", bgClass: "bg-stripe-gray", textClass: "text-white" },
    { name: "stripe-gray-light", hex: "#cfd7df", desc: "Subtle borders / outlines", bgClass: "bg-stripe-gray-light", textClass: "text-stripe-brand-dark" },
    { name: "stripe-gray-bg", hex: "#f6f9fc", desc: "Secondary layout background", bgClass: "bg-stripe-gray-bg", textClass: "text-stripe-brand-dark" },
    { name: "stripe-success", hex: "#00d4b2", desc: "Successful status green", bgClass: "bg-stripe-success", textClass: "text-stripe-brand-dark" },
    { name: "stripe-warning", hex: "#ff9800", desc: "Cautionary yellow / alert", bgClass: "bg-stripe-warning", textClass: "text-stripe-brand-dark" },
    { name: "stripe-danger", hex: "#df1b41", desc: "Validation errors / danger", bgClass: "bg-stripe-danger", textClass: "text-white" },
  ];

  const spacingScale = [
    { token: "xs", val: "4px", tw: "p-1 (0.25rem)", width: "w-1" },
    { token: "sm", val: "8px", tw: "p-2 (0.5rem)", width: "w-2" },
    { token: "md", val: "12px", tw: "p-3 (0.75rem)", width: "w-3" },
    { token: "lg", val: "16px", tw: "p-4 (1rem)", width: "w-4" },
    { token: "xl", val: "24px", tw: "p-6 (1.5rem)", width: "w-6" },
    { token: "2xl", val: "32px", tw: "p-8 (2rem)", width: "w-8" },
    { token: "3xl", val: "48px", tw: "p-12 (3rem)", width: "w-12" },
    { token: "4xl", val: "64px", tw: "p-16 (4rem)", width: "w-16" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-6 md:p-8">
      {/* Title Header Section */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-stripe-brand/10 text-stripe-brand px-2.5 py-1 rounded text-xs font-black uppercase tracking-wider">
                Extracted Design System
              </span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-100">
                <Check className="h-3 w-3" /> Fully Recreated
              </span>
            </div>
            <h1 className="text-3xl font-black text-stripe-brand-dark mt-2 tracking-tight">
              Stripe Design Playground
            </h1>
            <p className="text-sm text-stripe-gray mt-1 leading-relaxed max-w-2xl">
              An interactive visual environment demonstrating Stripe's signature colors, typography scales, 
              spacing grids, and pixel-perfect form inputs, configured directly inside Tailwind CSS v4.
            </p>
          </div>
          
          {/* Tab Filter buttons */}
          <div className="bg-slate-200/60 p-1 rounded-xl flex gap-1 border border-slate-200/30 w-fit shrink-0 select-none self-end sm:self-center">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === "all" ? "bg-white text-stripe-brand-dark shadow-sm" : "text-stripe-gray hover:text-stripe-brand-dark"}`}
            >
              Show All
            </button>
            <button
              onClick={() => setActiveTab("tokens")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === "tokens" ? "bg-white text-stripe-brand-dark shadow-sm" : "text-stripe-gray hover:text-stripe-brand-dark"}`}
            >
              Colors & Typography
            </button>
            <button
              onClick={() => setActiveTab("forms")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === "forms" ? "bg-white text-stripe-brand-dark shadow-sm" : "text-stripe-gray hover:text-stripe-brand-dark"}`}
            >
              Form Components
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-6xl mx-auto grid gap-8 lg:grid-cols-1">
        
        {/* TAB 1: DESIGN TOKENS (COLORS, TYPOGRAPHY, SPACING) */}
        {(activeTab === "all" || activeTab === "tokens") && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Color Swatches Grid */}
            <div className="bg-white rounded-stripe-card border border-[#e3e8ee] p-6 shadow-stripe-card">
              <h2 className="text-lg font-black text-stripe-brand-dark border-b border-slate-100 pb-3 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-stripe-brand"></span>
                Stripe Color Palette
              </h2>
              <p className="text-xs text-stripe-gray mt-1.5 mb-6">
                Click any card to copy its Tailwind utility class or Hex code.
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {colorTokens.map((tok) => (
                  <div 
                    key={tok.name}
                    onClick={() => copyToClipboard(tok.hex, tok.name)}
                    className="group relative bg-stripe-gray-bg border border-slate-200/50 rounded-lg p-4 cursor-pointer hover:border-stripe-brand/50 transition-all hover:translate-y-[-2px] hover:shadow-md"
                  >
                    <div className={`h-12 w-full rounded-md ${tok.bgClass} flex items-center justify-center font-bold text-xs shadow-sm border border-black/5`}>
                      {tok.hex}
                    </div>
                    <div className="mt-3">
                      <p className="text-xs font-bold text-stripe-brand-dark group-hover:text-stripe-brand transition-colors">
                        {tok.name}
                      </p>
                      <p className="text-[10px] text-stripe-gray mt-0.5 truncate">
                        {tok.desc}
                      </p>
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Copy className="h-3 w-3 text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Typography Hierarchy Demo */}
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Heading Classes */}
              <div className="bg-white rounded-stripe-card border border-[#e3e8ee] p-6 shadow-stripe-card">
                <h2 className="text-lg font-black text-stripe-brand-dark border-b border-slate-100 pb-3">
                  Typography Scale
                </h2>
                <div className="mt-6 space-y-5">
                  <div className="flex items-start gap-4">
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase w-12 text-center mt-1 shrink-0">H1</span>
                    <div>
                      <h1 className="text-3xl font-black text-stripe-brand-dark tracking-tight">Awesome Dashboard</h1>
                      <p className="text-[10px] text-slate-400 mt-1">Font: Inter Bold (30px / 1.875rem) · tracking-tight</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase w-12 text-center mt-1 shrink-0">H2</span>
                    <div>
                      <h2 className="text-xl font-bold text-stripe-brand-dark tracking-tight">Payment methods</h2>
                      <p className="text-[10px] text-slate-400 mt-1">Font: Inter Semibold (20px / 1.25rem) · tracking-tight</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase w-12 text-center mt-1 shrink-0">H3</span>
                    <div>
                      <h3 className="text-base font-bold text-stripe-brand-dark">Billing information</h3>
                      <p className="text-[10px] text-slate-400 mt-1">Font: Inter Medium/Semibold (16px / 1rem)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase w-12 text-center mt-0.5 shrink-0">Body</span>
                    <div>
                      <p className="text-sm font-normal text-stripe-gray leading-relaxed">
                        Use Stripe's clean text spacing to present critical data clearly. Fallbacks are system fonts to reduce layout shift.
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">Font: Inter Regular (14px / 0.875rem) · text-stripe-gray</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase w-12 text-center mt-0.5 shrink-0">Label</span>
                    <div>
                      <label className="text-xs font-semibold text-stripe-brand-dark uppercase tracking-wider">Email address</label>
                      <p className="text-[10px] text-slate-400 mt-1">Font: Inter Semibold (12px / 0.75rem) · uppercase tracking-wider</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Spacing Grid visualization */}
              <div className="bg-white rounded-stripe-card border border-[#e3e8ee] p-6 shadow-stripe-card flex flex-col justify-between">
                <div>
                  <h2 className="text-lg font-black text-stripe-brand-dark border-b border-slate-100 pb-3">
                    Stripe 8px Baseline Spacing Grid
                  </h2>
                  <p className="text-xs text-stripe-gray mt-2 leading-relaxed">
                    Stripe lays out card elements and columns along an 8px grid baseline. Margin gaps, field gaps, 
                    and visual blocks map precisely to specific sizing factors.
                  </p>
                  
                  <div className="mt-4 space-y-2">
                    {spacingScale.map((space) => (
                      <div key={space.token} className="flex items-center text-xs">
                        <span className="w-16 font-bold text-stripe-brand-dark">{space.token} ({space.val})</span>
                        <span className="w-28 text-slate-400 text-[10px]">{space.tw}</span>
                        <div className="flex-1 bg-slate-100 rounded-md h-4 overflow-hidden relative">
                          <div 
                            className="bg-stripe-brand/40 h-full rounded-md" 
                            style={{ width: `${(parseInt(space.val) / 64) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4 p-3 bg-stripe-gray-bg rounded-lg border border-slate-200/50 text-[11px] text-stripe-gray leading-normal">
                  <span className="font-bold text-stripe-brand-dark">Tip:</span> Use `gap-4` (16px) for standard column layouts and `gap-3` (12px) or `space-y-1.5` (6px) for field labels and form components.
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: INTERACTIVE COMPONENT PLAYGROUND */}
        {(activeTab === "all" || activeTab === "forms") && (
          <div className="space-y-8 animate-fade-in mt-2">
            
            <div className="grid lg:grid-cols-[1fr_1.1fr] gap-8">
              
              {/* Payment Card Form Container */}
              <div className="bg-white rounded-stripe-card border border-[#e3e8ee] p-6 shadow-stripe-card relative overflow-hidden">
                
                {/* Visual Glow Header Element */}
                <div className="absolute top-0 inset-x-0 h-[3px] bg-stripe-brand"></div>
                
                <h3 className="font-black text-stripe-brand-dark text-base border-b border-slate-100 pb-4 flex items-center justify-between">
                  <span>Simulated Checkout Card</span>
                  <Lock className="h-4 w-4 text-emerald-500" />
                </h3>

                <form onSubmit={handlePaymentSubmit} className="mt-6 space-y-4">
                  
                  {/* Cardholder name input */}
                  <div className="space-y-1.5">
                    <label htmlFor="stripe-cardname" className="text-xs font-semibold text-stripe-gray">
                      Name on card
                    </label>
                    <input
                      id="stripe-cardname"
                      type="text"
                      placeholder="Jane Doe"
                      value={cardName}
                      onChange={e => setCardName(e.target.value)}
                      className="w-full bg-white border border-[#cfd7df] rounded-[5px] h-10 px-3 text-sm focus:border-stripe-brand focus:ring-4 focus:ring-stripe-brand/10 transition-all outline-none shadow-stripe-input font-medium"
                    />
                  </div>

                  {/* Credit Card Details container (Stripe unified style) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stripe-gray">
                      Card details
                    </label>
                    
                    {/* Unified Card input grid block */}
                    <div className="border border-[#cfd7df] rounded-[5px] shadow-stripe-input overflow-hidden focus-within:border-stripe-brand focus-within:ring-4 focus-within:ring-stripe-brand/10 transition-all bg-white">
                      
                      {/* Top Row: Card number */}
                      <div className="relative border-b border-[#cfd7df] flex items-center">
                        <input
                          type="text"
                          placeholder="Card number"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          className="w-full h-10 pl-3 pr-10 text-sm bg-transparent outline-none font-medium placeholder:text-[#a3acb9] tracking-wider"
                        />
                        <div className="absolute right-3 text-slate-400">
                          <CreditCard className="h-4 w-4" />
                        </div>
                      </div>

                      {/* Bottom Row: Expiry & CVC */}
                      <div className="grid grid-cols-2 divide-x divide-[#cfd7df]">
                        <input
                          type="text"
                          placeholder="MM / YY"
                          value={cardExpiry}
                          onChange={handleExpiryChange}
                          className="h-10 px-3 text-sm bg-transparent outline-none text-center font-medium placeholder:text-[#a3acb9]"
                        />
                        <input
                          type="password"
                          placeholder="CVC"
                          maxLength={4}
                          value={cardCvc}
                          onChange={e => setCardCvc(e.target.value.replace(/\D/g, ""))}
                          className="h-10 px-3 text-sm bg-transparent outline-none text-center font-medium placeholder:text-[#a3acb9]"
                        />
                      </div>

                    </div>
                  </div>

                  {/* Term Agreement and secure note */}
                  <p className="text-[11px] text-stripe-gray leading-normal">
                    Payments are handled securely. By continuing, you agree to our Terms of Service and Privacy Policy.
                  </p>

                  {/* Stripe button with hover state */}
                  <button
                    type="submit"
                    disabled={isProcessing || isSuccess}
                    className="w-full bg-stripe-brand hover:bg-stripe-brand-hover text-white text-sm font-bold h-10 rounded-[4px] shadow-stripe-button transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                  >
                    {isProcessing ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : isSuccess ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <>
                        <Lock className="h-3.5 w-3.5" /> Pay $29.00
                      </>
                    )}
                  </button>

                </form>

                {/* Secure overlay during success */}
                {isSuccess && (
                  <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center p-6 animate-fade-in">
                    <div className="h-12 w-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-3 animate-bounce">
                      <Check className="h-6 w-6 stroke-[3]" />
                    </div>
                    <p className="text-sm font-bold text-stripe-brand-dark">Transaction Succeeded</p>
                    <p className="text-xs text-stripe-gray mt-1">Stripe simulated processing completed.</p>
                  </div>
                )}
              </div>

              {/* Stripe Button & Alerts System Demos */}
              <div className="space-y-6">
                
                {/* Button styles list */}
                <div className="bg-white rounded-stripe-card border border-[#e3e8ee] p-6 shadow-stripe-card">
                  <h3 className="font-bold text-stripe-brand-dark text-sm border-b border-slate-100 pb-3">
                    Stripe Button Variants
                  </h3>
                  
                  <div className="mt-4 space-y-4">
                    {/* Primary Button */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-stripe-gray w-32">Primary Button:</span>
                      <button className="bg-stripe-brand hover:bg-stripe-brand-hover text-white text-xs font-bold h-9 px-4 rounded-[4px] shadow-stripe-button transition-all cursor-pointer">
                        Pay with Stripe
                      </button>
                    </div>

                    {/* Secondary Button */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-stripe-gray w-32">Secondary Outlined:</span>
                      <button className="bg-white border border-[#cfd7df] hover:border-stripe-brand-dark text-stripe-gray hover:text-stripe-brand-dark text-xs font-bold h-9 px-4 rounded-[4px] shadow-stripe-input transition-all cursor-pointer">
                        Manage Billing
                      </button>
                    </div>

                    {/* Disabled state */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-stripe-gray w-32">Disabled Button:</span>
                      <button disabled className="bg-stripe-brand opacity-50 text-white text-xs font-bold h-9 px-4 rounded-[4px] shadow-stripe-button transition-all cursor-not-allowed">
                        Locked Feature
                      </button>
                    </div>

                    {/* Link button */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-stripe-gray w-32">Text Link style:</span>
                      <button className="text-stripe-brand hover:text-stripe-brand-hover text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer">
                        View transactions <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Form Alert States */}
                <div className="bg-white rounded-stripe-card border border-[#e3e8ee] p-6 shadow-stripe-card space-y-4">
                  <h3 className="font-bold text-stripe-brand-dark text-sm border-b border-slate-100 pb-3">
                    Stripe Form Alert Messages
                  </h3>
                  
                  {/* Alert Error */}
                  <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded-md text-stripe-danger text-xs font-medium">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Card verification failed</p>
                      <p className="opacity-90 mt-0.5">Your card was declined. Please try another card or check expiration data.</p>
                    </div>
                  </div>

                  {/* Alert Warning */}
                  <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-100 rounded-md text-amber-800 text-xs font-medium">
                    <Info className="h-4 w-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-amber-900">Sandbox Test Mode</p>
                      <p className="opacity-90 mt-0.5">This checkout form is simulated. Real transactions will not be executed.</p>
                    </div>
                  </div>

                  {/* Alert Success */}
                  <div className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-md text-emerald-800 text-xs font-medium">
                    <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
                    <div>
                      <p className="font-bold text-emerald-900">Invoice paid automatically</p>
                      <p className="opacity-90 mt-0.5">Subscription billing is up to date. Next billing date: Jun 22, 2026.</p>
                    </div>
                  </div>

                </div>

              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
