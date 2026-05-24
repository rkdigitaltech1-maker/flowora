import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Zap,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Package,
  MessageSquare,
  Users,
  Repeat,
  Bot,
  X,
  ChevronRight,
  Lock,
  Clock,
  Check,
  Camera,
  ShoppingBag,
  Store,
  Network,
  MousePointerClick,
  TrendingUp,
  UserPlus,
  CreditCard,
  Database,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { toast } from "sonner";
import { useWorkflows } from "@/lib/supabase-hooks.ts";
import { useProducts } from "@/lib/supabase-hooks.ts";

const InstagramLogo = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const MetaLogo = () => (
  <svg className="w-14 h-4 fill-[#0668E1]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.44 6c-1.12 0-2.12.47-2.85 1.23A3.82 3.82 0 0 0 7.56 6c-2.12 0-3.82 1.7-3.82 3.82 0 1.62.74 3.08 1.92 4.02l-.06.06L9.77 17.6l4.15-3.69c1.18-.94 1.93-2.4 1.93-4.02c0-2.12-1.7-3.82-3.82-3.82" />
  </svg>
);

type Step = 1 | 2 | 3 | 4;
const TOTAL_STEPS = 4;

const PROFILE_TYPES = [
  { id: "creator", label: "Creator", icon: Camera },
  { id: "ecommerce", label: "E-commerce", icon: ShoppingBag },
  { id: "local_business", label: "Local business", icon: Store },
  { id: "agency", label: "Agency", icon: Network },
];

const GOAL_ITEMS = [
  { id: "clicks", label: "More Clicks", icon: MousePointerClick },
  { id: "engagement", label: "Boost Engagement", icon: TrendingUp },
  { id: "followers", label: "Gain Followers", icon: UserPlus },
  { id: "sales", label: "Drive Sales", icon: CreditCard },
  { id: "data", label: "Collect Data", icon: Database },
  { id: "faqs", label: "Answer FAQs", icon: HelpCircle },
];

const WORKFLOW_TEMPLATES = [
  {
    id: "comment_dm",
    icon: MessageSquare,
    color: "#7c3cff",
    bg: "rgba(124,60,255,0.08)",
    title: "Comment → DM",
    description: "Auto-reply to comments and send a DM link.",
    triggerType: "instagram_comment",
  },
  {
    id: "story_reply",
    icon: Sparkles,
    color: "#ec149e",
    bg: "rgba(236,20,158,0.08)",
    title: "Story Reply Flow",
    description: "Send DMs automatically when users reply to stories.",
    triggerType: "instagram_story_reply",
  },
  {
    id: "follow_gate",
    icon: Users,
    color: "#0d9488",
    bg: "rgba(13,148,136,0.08)",
    title: "Follow Check Gate",
    description: "Encourage users to follow before sending links.",
    triggerType: "follow_gate",
  },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [done, setDone] = useState(false);
  const [showToast, setShowToast] = useState(true);

  // Personalization states
  const [profileType, setProfileType] = useState<string>("creator");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const toggleGoal = (goalId: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId) ? prev.filter((g) => g !== goalId) : [...prev, goalId]
    );
  };
  
  // Instagram Connection state
  const [connecting, setConnecting] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // Permission settings states
  const [permComments, setPermComments] = useState(true);
  const [permDms, setPermDms] = useState(true);
  const [permAnalytics, setPermAnalytics] = useState(true);

  // Template State
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [creatingWorkflow, setCreatingWorkflow] = useState(false);
  const { createWorkflow } = useWorkflows();

  // Product State
  const [productTitle, setProductTitle] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productType, setProductType] = useState("digital_download");
  const [creatingProduct, setCreatingProduct] = useState(false);
  const { createProduct } = useProducts();

  const next = () => setStep(s => Math.min(s + 1, TOTAL_STEPS) as Step);
  const finish = () => setDone(true);

  const goToDashboard = () => {
    localStorage.setItem("cs_onboarding_done", "true");
    navigate("/dashboard", { replace: true });
  };

  const handleConnectInstagram = () => {
    setShowAuthModal(true);
  };

  const handleCreateWorkflow = async () => {
    if (!selectedTemplate) {
      toast.error("Please select a template first.");
      return;
    }
    const tpl = WORKFLOW_TEMPLATES.find(t => t.id === selectedTemplate)!;
    setCreatingWorkflow(true);
    try {
      await createWorkflow({ name: tpl.title, description: tpl.description, triggerType: tpl.triggerType });
      toast.success(`Workflow "${tpl.title}" created successfully!`);
      next();
    } catch {
      toast.error("Could not create workflow. You can setup automations in the dashboard.");
      next();
    } finally {
      setCreatingWorkflow(false);
    }
  };

  const handleCreateProduct = async () => {
    if (!productTitle.trim() || !productPrice) {
      toast.error("Please enter a product title and price.");
      return;
    }
    const priceNum = parseFloat(productPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      toast.error("Please enter a valid price.");
      return;
    }
    setCreatingProduct(true);
    try {
      await createProduct({ title: productTitle.trim(), type: productType, price: priceNum });
      toast.success(`"${productTitle}" added to your products!`);
      finish();
    } catch {
      toast.error("Could not create product. You can add products in the dashboard.");
      finish();
    } finally {
      setCreatingProduct(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f3f4f6] flex flex-col justify-between items-center py-8 px-4 font-sans select-none antialiased">
      {/* HEADER LOGO */}
      <div className="flex items-center gap-2 cursor-pointer font-black text-xl text-slate-900 tracking-tight py-4">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-tr from-[#7c3cff] to-[#ec149e] text-white shadow-md shadow-[#7c3cff]/15">
          <Zap className="h-5 w-5 fill-white text-white" />
        </span>
        flowora
      </div>

      {/* MAIN LAYOUT CONTAINER */}
      <div className="w-full max-w-5xl bg-white rounded-[32px] border border-slate-100 shadow-[0_24px_80px_rgba(109,72,255,0.05)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px] my-auto">
        {/* LEFT COLUMN: ONBOARDING FLOW */}
        <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-between min-h-[480px]">
          
          {/* STEP HEADER */}
          {!done && (
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6">
              <span>Step {step} of {TOTAL_STEPS}</span>
              <span className="text-[#7c3cff]">{Math.round(((step - 1) / TOTAL_STEPS) * 100)}% Complete</span>
            </div>
          )}

          {/* STEP CONTENT SWITCHER */}
          <div className="my-auto space-y-6">
            {done ? (
              /* Done Screen */
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-3">
                  <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                    You're All <span className="animated-gradient-text bg-gradient-to-r from-[#7c3cff] to-[#ec149e] bg-clip-text text-transparent">Set Up!</span>
                  </h1>
                  <p className="text-slate-550 text-sm leading-relaxed font-semibold">
                    Your Flowora account is fully prepared. Head to your dashboard to manage integrations and track analytics.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-3 w-full">
                  {[["🤖", "Automations", "Active"], ["📦", "Storefront", "Ready"], ["📊", "Analytics", "Live"]].map(([emoji, label, status]) => (
                    <div key={label} className="flex flex-col items-center gap-1 bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <span className="text-2xl mb-1">{emoji}</span>
                      <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider">{label}</span>
                      <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{status}</span>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={goToDashboard}
                  className="w-full h-12 rounded-2xl bg-[#7c3cff] hover:bg-[#6c30eb] text-white font-extrabold shadow-md shadow-[#7c3cff]/15 transition-all text-sm flex items-center justify-center gap-1.5"
                >
                  Go to my Dashboard <ChevronRight className="h-4.5 w-4.5" />
                </Button>
              </div>
            ) : step === 1 ? (
              /* Step 1: Connect Instagram */
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-3">
                  <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                    Let's <span className="animated-gradient-text bg-gradient-to-r from-[#7c3cff] to-[#ec149e] bg-clip-text text-transparent">Kick Things Off!</span>
                  </h1>
                  <p className="text-slate-500 text-sm leading-relaxed font-semibold">
                    Start with any channel you like — you can connect more later.
                  </p>
                </div>

                {/* Instagram Channel button */}
                <button
                  onClick={handleConnectInstagram}
                  disabled={connecting}
                  className="w-full flex items-center justify-between p-4.5 rounded-2xl border border-slate-200 bg-white hover:border-[#7c3cff]/40 hover:shadow-md transition-all duration-300 group cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-tr from-[#f91f7f] via-[#ec149e] to-[#fb923c] text-white shadow-sm">
                      <InstagramLogo />
                    </span>
                    <span className="font-extrabold text-sm text-slate-800">Instagram</span>
                  </div>
                  {connecting ? (
                    <span className="h-4.5 w-4.5 rounded-full border-2 border-[#7c3cff]/30 border-t-[#7c3cff] animate-spin" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-[#7c3cff] transition-colors" />
                  )}
                </button>

                <div className="flex flex-col gap-2 w-full pt-1.5">
                  <button
                    onClick={next}
                    className="text-xs text-slate-450 hover:text-slate-650 font-bold transition-colors text-center cursor-pointer"
                  >
                    Skip connection step for now
                  </button>
                </div>
              </div>
            ) : step === 2 ? (
              /* Step 2: Zorcha Onboarding mock personalization */
              <div className="space-y-5 animate-fade-in text-left">
                <div className="space-y-2">
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
                    What <span className="text-[#7c3cff]">best</span> describes you?
                  </h1>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                    Tell us a little about yourself, so we can personalize your experience.
                  </p>
                </div>

                {/* Profile type selection grid */}
                <div className="grid grid-cols-2 gap-3 mt-1">
                  {PROFILE_TYPES.map((t) => {
                    const Icon = t.icon;
                    const isSelected = profileType === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setProfileType(t.id)}
                        className={`flex items-center gap-2.5 p-3 px-4 rounded-xl border text-left transition-all duration-200 cursor-pointer font-bold text-xs ${
                          isSelected
                            ? "border-[#7c3cff] bg-[#f8f6ff] text-[#7c3cff] ring-1 ring-[#7c3cff]/10 shadow-sm"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-350 hover:bg-slate-50"
                        }`}
                      >
                        <Icon className={`h-4.5 w-4.5 shrink-0 ${isSelected ? "text-[#7c3cff]" : "text-slate-400"}`} />
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>

                <hr className="border-slate-100 my-4" />

                {/* Goals selection grid */}
                <div className="grid grid-cols-2 gap-3">
                  {GOAL_ITEMS.map((g) => {
                    const Icon = g.icon;
                    const isSelected = selectedGoals.includes(g.id);
                    return (
                      <button
                        key={g.id}
                        onClick={() => toggleGoal(g.id)}
                        className={`flex items-center gap-2.5 p-3 px-4 rounded-xl border text-left transition-all duration-200 cursor-pointer font-bold text-xs ${
                          isSelected
                            ? "border-[#7c3cff] bg-[#f8f6ff] text-[#7c3cff] ring-1 ring-[#7c3cff]/10 shadow-sm"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-350 hover:bg-slate-50"
                        }`}
                      >
                        <Icon className={`h-4.5 w-4.5 shrink-0 ${isSelected ? "text-[#7c3cff]" : "text-slate-400"}`} />
                        <span>{g.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Action buttons */}
                <div className="pt-4 flex flex-col gap-2.5">
                  <Button
                    onClick={next}
                    className="w-fit h-11 px-6 bg-slate-955 hover:bg-slate-900 text-white font-extrabold rounded-xl transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-slate-950/10"
                  >
                    Next <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : step === 3 ? (
              /* Step 3: Pick a Template */
              <div className="space-y-5 animate-fade-in">
                <div className="space-y-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                    Pick Your First Automation
                  </h1>
                  <p className="text-slate-555 text-xs font-semibold leading-relaxed">
                    Select a core template to configure instantly. You can fully customize actions in your dashboard settings.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {WORKFLOW_TEMPLATES.map(tpl => {
                    const Icon = tpl.icon;
                    const isSelected = selectedTemplate === tpl.id;
                    return (
                      <button
                        key={tpl.id}
                        onClick={() => setSelectedTemplate(tpl.id)}
                        className={`w-full flex items-center gap-4 p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? "border-[#7c3cff] bg-[#f8f6ff] ring-1 ring-[#7c3cff]/30 shadow-sm"
                            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: tpl.bg }}>
                          <Icon className="h-4.5 w-4.5" style={{ color: tpl.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-black text-slate-900 leading-none">{tpl.title}</p>
                          <p className="text-[10px] text-slate-500 mt-1 leading-snug font-semibold">{tpl.description}</p>
                        </div>
                        <div className={`h-4.5 w-4.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                          isSelected ? "border-[#7c3cff] bg-[#7c3cff]" : "border-slate-300"
                        }`}>
                          {isSelected && <Check className="h-3 w-3 text-white stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-col gap-2.5 pt-1.5">
                  <Button
                    onClick={handleCreateWorkflow}
                    disabled={!selectedTemplate || creatingWorkflow}
                    className="w-full h-11 bg-[#7c3cff] hover:bg-[#6c30eb] text-white font-extrabold rounded-xl shadow-md transition-all text-xs disabled:opacity-50 flex items-center justify-center gap-1"
                  >
                    {creatingWorkflow ? (
                      <>
                        <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Creating workflow…
                      </>
                    ) : (
                      <>
                        Create Workflow <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                  <button onClick={next} className="text-xs text-slate-450 hover:text-slate-650 font-bold text-center transition-colors cursor-pointer">
                    Skip workflow template step
                  </button>
                </div>
              </div>
            ) : (
              /* Step 4: Add first Product */
              <div className="space-y-4 animate-fade-in">
                <div className="space-y-1.5">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                    Add Your First Product
                  </h1>
                  <p className="text-slate-555 text-xs font-semibold leading-relaxed">
                    Optionally configure a digital product storefront to deliver checkouts automatically inside Instagram chat replies.
                  </p>
                </div>

                <div className="space-y-3 pt-1">
                  <div className="space-y-1">
                    <Label className="text-slate-700 text-[10px] font-black uppercase tracking-wider" htmlFor="product-name">Product name</Label>
                    <Input
                      id="product-name"
                      placeholder='e.g. "Presets Pack" or "Coaching Guide PDF"'
                      value={productTitle}
                      onChange={e => setProductTitle(e.target.value)}
                      className="bg-white border-slate-200 rounded-xl h-10 focus:ring-2 focus:ring-[#7c3cff]/10 focus:border-[#7c3cff] text-xs font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-slate-700 text-[10px] font-black uppercase tracking-wider" htmlFor="product-type">Product type</Label>
                    <select
                      id="product-type"
                      value={productType}
                      onChange={e => setProductType(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 h-10 px-3 text-xs outline-none focus:ring-2 focus:ring-[#7c3cff]/10 focus:border-[#7c3cff] bg-white text-slate-700 font-semibold"
                    >
                      <option value="digital_download">Digital Download (PDF, Template)</option>
                      <option value="coaching">1:1 Coaching Call</option>
                      <option value="course">Online Video Course</option>
                      <option value="other">Other Digital Good</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-slate-700 text-[10px] font-black uppercase tracking-wider" htmlFor="product-price">Price (USD)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">$</span>
                      <Input
                        id="product-price"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="29.00"
                        value={productPrice}
                        onChange={e => setProductPrice(e.target.value)}
                        className="bg-white border-slate-200 rounded-xl h-10 pl-7 focus:ring-2 focus:ring-[#7c3cff]/10 focus:border-[#7c3cff] text-xs font-semibold"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5 pt-2">
                  <Button
                    onClick={handleCreateProduct}
                    disabled={creatingProduct}
                    className="w-full h-11 bg-[#7c3cff] hover:bg-[#6c30eb] text-white font-extrabold rounded-xl shadow-md transition-all text-xs flex items-center justify-center gap-1"
                  >
                    {creatingProduct ? (
                      <>
                        <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Adding product…
                      </>
                    ) : (
                      <>
                        Add Store Product <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                  <button onClick={finish} className="text-xs text-slate-450 hover:text-slate-650 font-bold text-center transition-colors cursor-pointer">
                    Skip — I'll set up products later
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* LEFT COLUMN FOOTER */}
          <div className="pt-6 border-t border-slate-100 flex items-center gap-3.5 text-left">
            <MetaLogo />
            <p className="text-[10px] text-slate-450 leading-normal font-semibold">
              Flowora has been certified by Meta as an official Tech Provider.
            </p>
          </div>

        </div>

        {/* RIGHT COLUMN: GRAPHICS */}
        <div className="lg:col-span-6 relative overflow-hidden bg-slate-50 min-h-[350px] lg:min-h-full rounded-b-[32px] lg:rounded-b-none lg:rounded-r-[32px]">
          <img
            src="/excited_creator.png"
            alt="Excited Creator Onboarding"
            className="w-full h-full object-cover select-none pointer-events-none"
          />
          {/* Subtle gradient overlay to tie into design */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
          
          {/* Skip all overlay button */}
          {!done && (
            <button
              onClick={goToDashboard}
              className="absolute top-6 right-6 flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors bg-white/90 backdrop-blur px-3.5 py-2 rounded-full border border-slate-200/50 shadow-md cursor-pointer"
              aria-label="Skip onboarding and go to dashboard"
            >
              Skip onboarding <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* FOOTER */}
      {!done && (
        <p className="text-[11px] text-slate-400 font-semibold py-2">
          You can always complete setup later from your dashboard settings.
        </p>
      )}

      {/* BOTTOM-RIGHT FLOATING TOAST NOTIFICATION */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 w-[350px] bg-white border border-slate-150 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.08)] p-5.5 animate-slide-in flex gap-4 select-none pointer-events-auto">
          {/* Toast Avatar */}
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-tr from-[#7c3cff] to-[#ec149e] text-white shadow-md shadow-[#7c3cff]/15 shrink-0 my-auto">
            <Zap className="h-5 w-5 fill-white text-white" />
          </span>
          {/* Toast Body */}
          <div className="flex-1 space-y-1 relative">
            <button
              onClick={() => setShowToast(false)}
              className="absolute -top-2.5 -right-2.5 text-slate-400 hover:text-slate-650 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <h4 className="text-xs font-black text-slate-800 leading-tight">Hi Creator,</h4>
            <p className="text-[11px] text-slate-500 leading-normal font-semibold font-sans">
              If you face any issues connecting your workspace - please{" "}
              <a href="mailto:support@flowora.com" className="text-[#7c3cff] hover:underline font-bold">click here</a> to solve this.
            </p>
            <p className="text-[9px] font-bold text-slate-400 pt-0.5">Flowora • Just now</p>
          </div>
        </div>
      )}

      {/* SIMULATED INSTAGRAM CONNECTION MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_32px_96px_rgba(109,72,255,0.16)] max-w-md w-full p-7 sm:p-8 space-y-6 relative">
            
            {/* Close Button */}
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-650 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Branded Connecting Graphics */}
            <div className="flex items-center justify-center gap-6 pt-2">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-tr from-[#f91f7f] via-[#ec149e] to-[#fb923c] text-white shadow-md">
                <InstagramLogo />
              </span>
              
              {/* Animated Connection Arrow */}
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7c3cff] animate-ping" />
                <div className="w-8 h-[2px] bg-gradient-to-r from-[#ec149e]/40 to-[#7c3cff]/40 relative">
                  <ArrowRight className="h-3.5 w-3.5 text-[#7c3cff] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <span className="w-1.5 h-1.5 rounded-full bg-[#ec149e] animate-pulse" />
              </div>

              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-tr from-[#7c3cff] to-[#ec149e] text-white shadow-md shadow-[#7c3cff]/15">
                <Zap className="h-6 w-6 fill-white text-white" />
              </span>
            </div>

            {/* Header Text */}
            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-black text-slate-900 leading-tight">Requesting Access</h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed max-w-xs mx-auto">
                <strong>Flowora App</strong> wants to connect with your Instagram Business profile <strong>@ramkumaronly</strong>.
              </p>
            </div>

            {/* Permission Toggles List */}
            <div className="space-y-3.5 bg-slate-50/70 border border-slate-100 rounded-2xl p-4.5">
              
              {/* Item 1: Profile Info (Required) */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-slate-800 leading-none">View Profile Profile &amp; Media</h4>
                  <p className="text-[10px] text-slate-400 mt-1 font-semibold">Required to read handle and verify status.</p>
                </div>
                {/* Active switch slider */}
                <div className="w-9 h-5 rounded-full bg-[#7c3cff]/20 flex items-center p-0.5 opacity-60 cursor-not-allowed">
                  <div className="w-4 h-4 rounded-full bg-[#7c3cff] translate-x-4" />
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Item 2: Comments */}
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setPermComments(!permComments)}
              >
                <div>
                  <h4 className="text-xs font-black text-slate-800 leading-none">Access &amp; Manage Comments</h4>
                  <p className="text-[10px] text-slate-400 mt-1 font-semibold">Required to listen to keyword comment triggers.</p>
                </div>
                <div className={`w-9 h-5 rounded-full transition-colors duration-200 flex items-center p-0.5 ${permComments ? "bg-[#7c3cff]" : "bg-slate-200"}`}>
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${permComments ? "translate-x-4" : "translate-x-0"}`} />
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Item 3: Messages */}
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setPermDms(!permDms)}
              >
                <div>
                  <h4 className="text-xs font-black text-slate-800 leading-none">Manage Direct Messages</h4>
                  <p className="text-[10px] text-slate-400 mt-1 font-semibold">Required to send replies with links/storefronts.</p>
                </div>
                <div className={`w-9 h-5 rounded-full transition-colors duration-200 flex items-center p-0.5 ${permDms ? "bg-[#7c3cff]" : "bg-slate-200"}`}>
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${permDms ? "translate-x-4" : "translate-x-0"}`} />
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Item 4: Analytics */}
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setPermAnalytics(!permAnalytics)}
              >
                <div>
                  <h4 className="text-xs font-black text-slate-800 leading-none">Read Account Insights</h4>
                  <p className="text-[10px] text-slate-400 mt-1 font-semibold">Required to synchronize campaign reach &amp; clicks.</p>
                </div>
                <div className={`w-9 h-5 rounded-full transition-colors duration-200 flex items-center p-0.5 ${permAnalytics ? "bg-[#7c3cff]" : "bg-slate-200"}`}>
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${permAnalytics ? "translate-x-4" : "translate-x-0"}`} />
                </div>
              </div>

            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5">
              <Button
                onClick={() => {
                  setAuthLoading(true);
                  setTimeout(() => {
                    toast.success("Linked Instagram account successfully!");
                    setAuthLoading(false);
                    setShowAuthModal(false);
                    next();
                  }, 1200);
                }}
                disabled={authLoading}
                className="w-full h-11.5 bg-gradient-to-r from-[#7c3cff] to-[#ec149e] hover:opacity-95 text-white font-extrabold rounded-xl shadow-md shadow-[#7c3cff]/10 text-xs flex items-center justify-center gap-1.5"
              >
                {authLoading ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Linking profiles…
                  </>
                ) : (
                  <>
                    Authorize &amp; Continue
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAuthModal(false)}
                className="w-full h-11.5 border-slate-200 hover:bg-slate-50 text-slate-500 font-bold rounded-xl text-xs"
              >
                Cancel
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* KEYFRAMES FOR TRANSITIONS */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateY(32px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .animate-slide-in {
          animation: slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
      `}</style>
    </div>
  );
}
