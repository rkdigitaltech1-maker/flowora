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
  Shield,
  PartyPopper,
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
  // Check if returning from Instagram OAuth (state param in URL or accounts already exist)
  const [step, setStep] = useState<Step>(() => {
    // If we just came back from Meta OAuth callback, skip step 1
    const justConnected = localStorage.getItem("flowora_ig_just_connected");
    if (justConnected) {
      localStorage.removeItem("flowora_ig_just_connected");
      return 2 as Step;
    }
    return 1 as Step;
  });
  const [done, setDone] = useState(false);
  const [showToast, setShowToast] = useState(true);

  // Show congrats if just connected
  useEffect(() => {
    const justConnected = localStorage.getItem("flowora_ig_just_connected_show_congrats");
    if (justConnected) {
      localStorage.removeItem("flowora_ig_just_connected_show_congrats");
      setShowCongrats(true);
      setConnectedUsername(justConnected);
    }
  }, []);

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
  const [showCongrats, setShowCongrats] = useState(false);
  const [connectedUsername, setConnectedUsername] = useState("");

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
              /* Step 1: Connect Instagram to Unlock */
              <div className="space-y-6 animate-fade-in text-center">
                {/* Lock Icon */}
                <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6d48ff]/10 to-indigo-500/10 flex items-center justify-center border border-violet-100">
                  <Lock className="w-7 h-7 text-[#6d48ff]" />
                </div>

                <div className="space-y-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                    Connect Instagram to unlock your dashboard
                  </h1>
                  <p className="text-slate-500 text-sm leading-relaxed font-medium max-w-sm mx-auto">
                    Connect Instagram once to activate your checklist, quick actions, and live metrics. Your How section will stay available below.
                  </p>
                </div>

                {/* Connect Instagram Button */}
                <button
                  onClick={handleConnectInstagram}
                  disabled={connecting}
                  className="mx-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#6d48ff] to-[#9b59ff] text-white font-bold text-sm shadow-lg shadow-violet-500/20 hover:shadow-xl hover:from-[#5a38e0] hover:to-[#8b49ef] hover:scale-[1.02] transition-all duration-200 cursor-pointer"
                >
                  {connecting ? (
                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : (
                    <>
                      <InstagramLogo />
                      Connect Instagram
                    </>
                  )}
                </button>

                <button
                  onClick={next}
                  className="text-xs text-slate-400 hover:text-slate-600 font-semibold transition-colors text-center cursor-pointer"
                >
                  Skip for now →
                </button>
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
        <div className="lg:col-span-6 relative overflow-hidden bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-50 min-h-[350px] lg:min-h-full rounded-b-[32px] lg:rounded-b-none lg:rounded-r-[32px] flex items-center justify-center p-8">
          {/* Custom SVG Illustration - Creator connecting social media */}
          <div className="w-full max-w-[380px] mx-auto select-none pointer-events-none">
            <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto drop-shadow-xl">
              {/* Background circle */}
              <circle cx="200" cy="200" r="160" fill="url(#bgGradient)" opacity="0.15" />
              <circle cx="200" cy="200" r="120" fill="url(#bgGradient2)" opacity="0.1" />
              
              {/* Phone device */}
              <rect x="145" y="80" width="110" height="220" rx="20" fill="white" stroke="#e2e8f0" strokeWidth="2" />
              <rect x="155" y="100" width="90" height="180" rx="4" fill="#f8fafc" />
              
              {/* Phone notch */}
              <rect x="180" y="86" width="40" height="6" rx="3" fill="#e2e8f0" />
              
              {/* Phone screen content - profile mockup */}
              <circle cx="200" cy="135" r="18" fill="url(#avatarGradient)" />
              <rect x="180" y="160" width="40" height="4" rx="2" fill="#cbd5e1" />
              <rect x="170" y="170" width="60" height="3" rx="1.5" fill="#e2e8f0" />
              
              {/* Stats bars on phone */}
              <rect x="165" y="185" width="25" height="35" rx="4" fill="url(#stat1Gradient)" opacity="0.8" />
              <rect x="195" y="195" width="25" height="25" rx="4" fill="url(#stat2Gradient)" opacity="0.8" />
              <rect x="225" y="190" width="25" height="30" rx="4" fill="url(#stat3Gradient)" opacity="0.8" />
              
              {/* Chat bubbles on phone */}
              <rect x="162" y="230" width="55" height="14" rx="7" fill="#7c3cff" opacity="0.9" />
              <rect x="185" y="248" width="50" height="14" rx="7" fill="#e2e8f0" />
              
              {/* Floating elements - notification badges */}
              <circle cx="270" cy="120" r="22" fill="white" stroke="#e2e8f0" strokeWidth="1.5" className="animate-sparkle" />
              <path d="M262 120 L268 120 L268 114 C268 111.8 269.8 110 272 110 C274.2 110 276 111.8 276 114 L276 120 L278 120" stroke="#7c3cff" strokeWidth="2" strokeLinecap="round" />
              <circle cx="270" cy="126" r="2" fill="#7c3cff" />
              
              {/* Floating heart */}
              <circle cx="130" cy="140" r="18" fill="white" stroke="#e2e8f0" strokeWidth="1.5" />
              <path d="M123 140 C123 136 126 134 130 137 C134 134 137 136 137 140 C137 144 130 148 130 148 C130 148 123 144 123 140Z" fill="#ec149e" />
              
              {/* Floating message icon */}
              <circle cx="290" cy="220" r="20" fill="white" stroke="#e2e8f0" strokeWidth="1.5" />
              <rect x="278" y="212" width="24" height="16" rx="4" fill="#7c3cff" opacity="0.9" />
              <path d="M282 228 L286 224" stroke="#7c3cff" strokeWidth="2" strokeLinecap="round" />
              
              {/* Floating chart icon */}
              <circle cx="120" cy="240" r="18" fill="white" stroke="#e2e8f0" strokeWidth="1.5" />
              <rect x="112" y="244" width="4" height="10" rx="2" fill="#0d9488" />
              <rect x="118" y="238" width="4" height="16" rx="2" fill="#7c3cff" />
              <rect x="124" y="241" width="4" height="13" rx="2" fill="#ec149e" />
              
              {/* Connection lines (dashed) */}
              <path d="M255 130 L248 120" stroke="#7c3cff" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
              <path d="M148 150 L155 145" stroke="#ec149e" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
              <path d="M270 200 L255 195" stroke="#7c3cff" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
              <path d="M138 230 L155 225" stroke="#0d9488" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
              
              {/* Sparkle decorations */}
              <path d="M310 160 L313 155 L316 160 L313 165Z" fill="#f59e0b" opacity="0.7" />
              <path d="M100 180 L102 176 L104 180 L102 184Z" fill="#ec149e" opacity="0.6" />
              <path d="M320 270 L322 267 L324 270 L322 273Z" fill="#7c3cff" opacity="0.5" />
              <path d="M90 290 L92 287 L94 290 L92 293Z" fill="#0d9488" opacity="0.6" />
              
              {/* Bottom text area */}
              <rect x="140" y="320" width="120" height="40" rx="12" fill="white" stroke="#e2e8f0" strokeWidth="1.5" />
              <circle cx="160" cy="340" r="8" fill="url(#avatarGradient)" />
              <rect x="172" y="335" width="50" height="4" rx="2" fill="#cbd5e1" />
              <rect x="172" y="343" width="35" height="3" rx="1.5" fill="#e2e8f0" />
              <circle cx="245" cy="340" r="6" fill="#10b981" opacity="0.8" />
              <path d="M242 340 L244 342 L248 338" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              
              {/* Gradients */}
              <defs>
                <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7c3cff" />
                  <stop offset="100%" stopColor="#ec149e" />
                </linearGradient>
                <linearGradient id="bgGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#6d48ff" />
                  <stop offset="100%" stopColor="#0d9488" />
                </linearGradient>
                <linearGradient id="avatarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7c3cff" />
                  <stop offset="100%" stopColor="#ec149e" />
                </linearGradient>
                <linearGradient id="stat1Gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#7c3cff" />
                  <stop offset="100%" stopColor="#6d48ff" />
                </linearGradient>
                <linearGradient id="stat2Gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ec149e" />
                  <stop offset="100%" stopColor="#f472b6" />
                </linearGradient>
                <linearGradient id="stat3Gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#0d9488" />
                  <stop offset="100%" stopColor="#14b8a6" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Text below illustration */}
            <div className="text-center mt-6 space-y-2">
              <h3 className="text-lg font-black text-slate-800">Automate Your Growth</h3>
              <p className="text-xs text-slate-500 font-semibold max-w-[260px] mx-auto leading-relaxed">
                Connect your Instagram, set up automations, and watch your engagement grow on autopilot.
              </p>
            </div>
          </div>
          
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
          <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_32px_96px_rgba(109,72,255,0.16)] max-w-sm w-full p-7 sm:p-8 space-y-5 relative">
            
            {/* Back Button */}
            <button
              onClick={() => setShowAuthModal(false)}
              className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
            >
              ‹ Back
            </button>

            {/* Flowora Logo */}
            <div className="flex items-center justify-center gap-2">
              <img src="/logo.png" alt="Flowora" className="h-7 w-auto object-contain" />
            </div>

            {/* Header Text */}
            <div className="text-center space-y-1.5">
              <h3 className="text-xl font-black text-slate-900 leading-tight">Connect Instagram Account ✨</h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed max-w-xs mx-auto">
                Only a few steps away to automate your growth!
              </p>
            </div>

            {/* Meta Verified Badge */}
            <div className="bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 rounded-2xl p-4 text-center space-y-2.5">
              <div className="flex items-center justify-center gap-2">
                <Shield className="w-4 h-4 text-[#7c3cff]" />
                <span className="text-xs font-black text-[#7c3cff]">We're a Meta-verified business</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed max-w-[260px] mx-auto">
                We only use official Instagram APIs and processes. Your account is secure, and you stay in full control.
              </p>
              <div className="flex flex-col gap-1.5 items-start max-w-[220px] mx-auto pt-1">
                {["Official Meta OAuth login", "Safe and Secure", "Used by 1000+ creators"].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="text-[11px] text-slate-700 font-semibold">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <Button
                onClick={async () => {
                  setAuthLoading(true);
                  try {
                    // Try to open real Instagram OAuth
                    const appId = import.meta.env.VITE_META_APP_ID;
                    if (appId) {
                      const redirectUri = (import.meta.env.VITE_META_REDIRECT_URI as string | undefined) ?? `${window.location.origin}/auth/meta/callback`;
                      const state = `dashboard_conn:onboarding`;
                      const url = new URL("https://www.instagram.com/oauth/authorize");
                      url.searchParams.set("force_reauth", "true");
                      url.searchParams.set("client_id", appId);
                      url.searchParams.set("redirect_uri", redirectUri);
                      url.searchParams.set("scope", "instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish,instagram_business_manage_insights");
                      url.searchParams.set("response_type", "code");
                      url.searchParams.set("state", state);
                      window.location.href = url.toString();
                    } else {
                      // Fallback: simulate connection for demo/dev
                      setTimeout(() => {
                        setConnectedUsername("@your.instagram");
                        setAuthLoading(false);
                        setShowAuthModal(false);
                        setShowCongrats(true);
                      }, 1500);
                    }
                  } catch (err) {
                    toast.error("Failed to start Instagram connection. Please try again.");
                    setAuthLoading(false);
                  }
                }}
                disabled={authLoading}
                className="w-full h-12 bg-gradient-to-r from-[#f59e0b] via-[#f97316] to-[#ef4444] hover:opacity-95 text-white font-extrabold rounded-xl shadow-md text-sm flex items-center justify-center gap-2"
              >
                {authLoading ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Connecting account…
                  </>
                ) : (
                  <>
                    <InstagramLogo /> Login with Instagram
                  </>
                )}
              </Button>

              <p className="text-[10px] text-slate-400 font-medium text-center">
                By continuing, you agree to Flowora's{" "}
                <a href="/terms" className="text-[#6d48ff] hover:underline">Terms of Service</a> and{" "}
                <a href="/privacy" className="text-[#6d48ff] hover:underline">Privacy Policy</a>
              </p>

              <button
                onClick={() => setShowAuthModal(false)}
                className="text-xs text-slate-400 hover:text-slate-600 font-semibold text-center cursor-pointer transition-colors"
              >
                Logout
              </button>
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
        @keyframes sparkle-float {
          0%, 100% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
          50% { transform: translateY(-12px) rotate(180deg) scale(1.3); opacity: 0.7; }
        }
        @keyframes confetti-fall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateY(40px) rotate(360deg); opacity: 0; }
        }
        .animate-fade-in {
          animation: fade-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .animate-slide-in {
          animation: slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .animate-sparkle {
          animation: sparkle-float 2s ease-in-out infinite;
        }
      `}</style>

      {/* CONGRATS MODAL — shows after successful Instagram connection */}
      {showCongrats && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_32px_96px_rgba(109,72,255,0.2)] max-w-sm w-full p-8 text-center space-y-5 relative overflow-hidden">
            
            {/* Floating sparkles decoration */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[
                { left: "10%", top: "15%", delay: "0s", size: "text-yellow-400" },
                { left: "80%", top: "10%", delay: "0.3s", size: "text-pink-400" },
                { left: "20%", top: "75%", delay: "0.6s", size: "text-violet-400" },
                { left: "75%", top: "80%", delay: "0.9s", size: "text-blue-400" },
                { left: "50%", top: "5%", delay: "1.2s", size: "text-emerald-400" },
                { left: "5%", top: "50%", delay: "0.4s", size: "text-orange-400" },
                { left: "90%", top: "45%", delay: "0.7s", size: "text-rose-400" },
              ].map((spark, i) => (
                <Sparkles
                  key={i}
                  className={`absolute w-4 h-4 ${spark.size} animate-sparkle`}
                  style={{ left: spark.left, top: spark.top, animationDelay: spark.delay }}
                />
              ))}
            </div>

            {/* Flowora Logo */}
            <div className="flex items-center justify-center gap-2">
              <img src="/logo.png" alt="Flowora" className="h-6 w-auto object-contain" />
            </div>

            {/* Avatar circle */}
            <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-[#6d48ff] to-[#ec149e] flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
            </div>

            {/* Congrats text */}
            <div className="space-y-2 relative z-10">
              <h2 className="text-2xl font-black text-slate-900">Congratulations! 🎉</h2>
              <p className="text-sm text-slate-500 font-medium">
                {connectedUsername || "Your Instagram"} is successfully connected!
              </p>
            </div>

            {/* Next button */}
            <Button
              onClick={() => {
                setShowCongrats(false);
                toast.success("Instagram connected! Let's continue setup.");
                next();
              }}
              className="w-full h-12 bg-[#6d48ff] hover:bg-[#5a38e0] text-white font-extrabold rounded-2xl shadow-lg shadow-violet-500/20 text-sm transition-all"
            >
              Next →
            </Button>

            {/* Terms */}
            <p className="text-[10px] text-slate-400 font-medium">
              By continuing, you agree to Flowora's{" "}
              <a href="/terms" className="text-[#6d48ff] hover:underline">Terms of Service</a> and{" "}
              <a href="/privacy" className="text-[#6d48ff] hover:underline">Privacy Policy</a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
