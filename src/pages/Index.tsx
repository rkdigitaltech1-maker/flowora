import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth.ts";
import { PageLayout } from "@/components/PageLayout.tsx";
import { CountUp } from "@/components/ui/count-up.tsx";
import { Button } from "@/components/ui/button.tsx";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  Play,
  Sparkles,
  MessageSquare,
  Mail,
  Zap,
  TrendingUp,
  ShieldCheck,
  Star,
  Users,
  ChevronDown,
  Rocket,
  Link2,
  Settings,
  Check,
  X,
  Camera,
  Video,
} from "lucide-react";


/* ─── DATA ─── */

const simulatorPresets = {
  guide: {
    name: "Lead Magnet",
    keyword: "GUIDE",
    comment: "Can I get the free guide? 📚",
    replyComment: "Sent! Check your DMs 🚀",
    dmText: "Hey! Here's your free IG growth guide:",
    ctaLabel: "Download Now",
    color: "from-violet-500 to-indigo-600",
  },
  discount: {
    name: "Coupon Code",
    keyword: "SAVE20",
    comment: "I want the discount! 💸",
    replyComment: "Done! Check your DMs for 20% off 🎉",
    dmText: "Here's your exclusive 20% off code:",
    ctaLabel: "Apply Code",
    color: "from-pink-500 to-rose-600",
  },
  webinar: {
    name: "Webinar",
    keyword: "SEAT",
    comment: "Reserve my spot please! 🎟️",
    replyComment: "Reserved! Details in your DMs ✨",
    dmText: "Click below to secure your seat:",
    ctaLabel: "Get Access",
    color: "from-blue-500 to-cyan-600",
  },
};


const creators = [
  { name: "Priya Patel", niche: "Fitness Coach", followers: "125K", avatarImage: "/creator_indian_1.png" },
  { name: "Aarav Sharma", niche: "Tech Reviewer", followers: "185K", avatarImage: "/creator_indian_2.png" },
  { name: "Ananya Iyer", niche: "Fashion Vlogger", followers: "240K", avatarImage: "/creator_indian_3.png" },
  { name: "Kabir Mehta", niche: "Business Coach", followers: "156K", avatarImage: "/creator_indian_4.png" },
  { name: "Rohan Verma", niche: "Travel Vlogger", followers: "98K", avatarImage: "/creator_indian_2.png" },
  { name: "Diya Malhotra", niche: "Food Creator", followers: "177K", avatarImage: "/creator_indian_3.png" },
];

const testimonials = [
  {
    name: "Priya Patel", role: "Fitness Influencer", followers: "120K",
    avatarImage: "/creator_indian_1.png", rating: 5,
    text: "Flowora has been a game-changer. I went from spending 3 hours replying to DMs to full autopilot. Sales up 300% in month one!",
  },
  {
    name: "Aarav Sharma", role: "Tech Creator", followers: "185K",
    avatarImage: "/creator_indian_2.png", rating: 5,
    text: "The lead capture inside comments is incredible. I've collected over 12,000 verified emails through Instagram comments alone.",
  },
  {
    name: "Ananya Iyer", role: "Lifestyle & Fashion", followers: "240K",
    avatarImage: "/creator_indian_3.png", rating: 5,
    text: "Set up in under 10 minutes. Meta-compliant, incredibly user-friendly, and the support team responds in minutes.",
  },
  {
    name: "Kabir Mehta", role: "Business Coach", followers: "156K",
    avatarImage: "/creator_indian_4.png", rating: 5,
    text: "I was skeptical but my engagement rose by 180% and responses feel totally natural. My audience loves it.",
  },
];


const pricingPlans = [
  {
    name: "Free",
    priceUSD: 0, priceINR: 0, monthlyUSD: 0, monthlyINR: 0,
    description: "Perfect for creators just getting started",
    features: [
      "1 Instagram account",
      "1,000 DMs / month",
      "10 active campaigns",
      "Comment Auto-DM",
      "Lead capture CRM",
      "7-day analytics",
      "Community support",
    ],
    gradient: "from-gray-500 to-gray-700",
    popular: false,
  },
  {
    name: "Pro",
    priceUSD: 4.99, priceINR: 399, monthlyUSD: 5.99, monthlyINR: 499,
    description: "Full automation suite for serious creators",
    features: [
      "10 Instagram accounts",
      "Unlimited DMs",
      "Unlimited campaigns",
      "All automations (Comment, Story, Lead Gen)",
      "Re-trigger old commenters",
      "Email & phone collection",
      "Advanced analytics (90d)",
      "CSV export",
      "Priority support",
      "7-day money-back guarantee",
    ],
    gradient: "from-purple-600 to-pink-600",
    popular: true,
  },
];


const faqData = [
  { question: "Is Flowora safe for my Instagram account?", answer: "Absolutely! We're an official Meta Technology Provider following all Instagram guidelines. Your account is completely safe." },
  { question: "Do I need technical skills?", answer: "Not at all! Set up automation in a few clicks—no coding or technical knowledge required." },
  { question: "Can I customize automated messages?", answer: "Yes! Full control over replies for comments, stories, and DMs. Add links, forms, and personalize everything." },
  { question: "How does email capture work?", answer: "When someone engages with your content, Flowora sends them a custom form in DMs to collect their email—seamless and privacy-compliant." },
  { question: "What support is available?", answer: "24/7 chat and email support, plus extensive docs and video tutorials to help you succeed." },
  { question: "Can I try Flowora for free?", answer: "Yes! 14-day free trial with full access. No credit card required. Try it risk-free." },
];

const features = [
  { icon: MessageSquare, title: "Auto-Reply Comments", description: "Respond to every comment with personalized messages and links to your offers.", gradient: "from-blue-500 to-cyan-500" },
  { icon: Sparkles, title: "Story DM Automation", description: "Engage with everyone who replies to your stories with instant responses.", gradient: "from-purple-500 to-pink-500" },
  { icon: Mail, title: "Email Capture", description: "Collect emails in DMs with custom forms and grow your list on autopilot.", gradient: "from-orange-500 to-red-500" },
  { icon: Zap, title: "Instant DM Links", description: "Send followers exactly what they need—no more 'link in bio' hassle.", gradient: "from-green-500 to-emerald-500" },
  { icon: TrendingUp, title: "Advanced Analytics", description: "Track engagement, conversions, and ROI with detailed insights.", gradient: "from-indigo-500 to-blue-500" },
  { icon: ShieldCheck, title: "Meta Verified & Secure", description: "Official Meta Technology Provider with enterprise-grade security.", gradient: "from-gray-700 to-gray-900" },
];

const stats = [
  { icon: Users, value: 60000, suffix: "+", label: "Active Creators", color: "from-blue-500 to-cyan-500" },
  { icon: MessageSquare, value: 100, suffix: "M+", label: "Messages Automated", color: "from-purple-500 to-pink-500" },
  { icon: TrendingUp, value: 300, suffix: "%", label: "Avg. Engagement Boost", color: "from-green-500 to-emerald-500" },
  { icon: Zap, value: 24, suffix: "/7", label: "Always Active", color: "from-orange-500 to-red-500" },
];

const steps = [
  { icon: Link2, step: "01", title: "Connect Your Instagram", description: "Link your account securely in one click. Meta Verified Partner—always safe." },
  { icon: Settings, step: "02", title: "Set Up Automation", description: "Create auto-replies for comments, stories, and DMs. Add links and forms." },
  { icon: Rocket, step: "03", title: "Watch It Grow", description: "Sit back as Flowora engages 24/7. Track results and convert followers." },
];


/* ─── HELPER COMPONENTS ─── */

function FloatingParticles() {
  const particles = Array.from({ length: 20 });
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 bg-white/20 rounded-full"
          style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
          animate={{ y: [0, -30, 0], opacity: [0, 0.7, 0], scale: [0.5, 1.2, 0.5] }}
          transition={{ duration: 4 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 4, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function SocialProofToast() {
  const notifications = [
    { name: "Priya", location: "Mumbai", action: "just started their free trial", time: "2 min ago" },
    { name: "Aarav", location: "Delhi", action: "upgraded to Pro plan", time: "5 min ago" },
    { name: "Ananya", location: "Bangalore", action: "captured 150 leads today", time: "8 min ago" },
    { name: "Kabir", location: "Pune", action: "just started their free trial", time: "11 min ago" },
  ];
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const initial = setTimeout(() => setVisible(true), 5000);
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setIdx((p) => (p + 1) % notifications.length); setVisible(true); }, 500);
    }, 8000);
    return () => { clearTimeout(initial); clearInterval(interval); };
  }, []);

  const n = notifications[idx];
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="fixed bottom-6 left-6 z-50 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 max-w-[280px] hidden md:flex items-center gap-3"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shrink-0">{n.name[0]}</div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate">{n.name} from {n.location}</p>
            <p className="text-[10px] text-gray-500 truncate">{n.action}</p>
            <p className="text-[9px] text-gray-400 mt-0.5">{n.time}</p>
          </div>
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shrink-0" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}


/* ─── MAIN COMPONENT ─── */

export default function Index() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  const [selectedSim, setSelectedSim] = useState<keyof typeof simulatorPresets>("guide");
  const [simStep, setSimStep] = useState<number>(0);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");
  const [pricingCurrency, setPricingCurrency] = useState<"USD" | "INR">("INR");
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [ctaEmail, setCtaEmail] = useState("");

  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);

  // Auth error callback
  useEffect(() => {
    const errorCode = searchParams.get("error_code");
    const errorDesc = searchParams.get("error_description");
    const errorMsg = searchParams.get("error");
    if (errorCode || errorMsg) {
      toast.error(`Authentication failed: ${errorDesc || errorMsg || errorCode}`);
      navigate("/", { replace: true });
    }
  }, [searchParams, navigate]);

  // Simulator auto-cycle
  useEffect(() => {
    setSimStep(0);
    const t1 = setTimeout(() => setSimStep(1), 1000);
    const t2 = setTimeout(() => setSimStep(2), 2500);
    const t3 = setTimeout(() => setSimStep(3), 4000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [selectedSim]);

  // Testimonial auto-rotate
  useEffect(() => {
    const timer = setInterval(() => setTestimonialIdx((p) => (p + 1) % testimonials.length), 5000);
    return () => clearInterval(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const currentPreset = simulatorPresets[selectedSim];


  return (
    <PageLayout>
      <SocialProofToast />

      {/* ═══════════════════════ HERO SECTION ═══════════════════════ */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Aurora/mesh gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-purple-50/40 to-blue-50/30" />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-[10%] w-[500px] h-[500px] bg-gradient-to-r from-purple-300/30 to-blue-300/20 rounded-full blur-[100px] pointer-events-none"
        />
        <motion.div
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-10 right-[5%] w-[400px] h-[400px] bg-gradient-to-r from-pink-300/25 to-violet-300/20 rounded-full blur-[80px] pointer-events-none"
        />
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-40 right-[20%] w-16 h-16 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-sm pointer-events-none"
        />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-white/80 backdrop-blur border border-purple-200/50 text-purple-700 px-4 py-2 rounded-full mb-8 shadow-sm"
            >
              <ShieldCheck className="w-4 h-4" />
              <span className="text-sm font-semibold">Meta Verified Partner · Trusted by 60K+ Creators</span>
            </motion.div>


            {/* Headline with staggered words */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.1] mb-6 text-slate-900">
              {"Turn Every Comment Into a Customer".split(" ").map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="inline-block mr-[0.3em]"
                >
                  {word === "Customer" ? (
                    <span className="bg-gradient-to-r from-[#6d48ff] via-purple-500 to-pink-500 bg-clip-text text-transparent">{word}</span>
                  ) : word}
                </motion.span>
              ))}
            </h1>

            {/* Sub-headline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.5 }}
              className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Automate Instagram DMs, capture emails, and convert followers into paying customers—all on autopilot with Flowora's AI-powered automation.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-10"
            >
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  className="bg-gradient-to-r from-[#6d48ff] via-purple-600 to-pink-500 text-white px-8 py-4 rounded-full font-bold shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all flex items-center gap-2 cursor-pointer text-lg"
                >
                  Start Free <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
              <a href="#how-it-works">
                <motion.button
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  className="border-2 border-gray-200 bg-white/70 backdrop-blur text-gray-700 px-8 py-4 rounded-full font-bold hover:border-purple-200 transition-all flex items-center gap-2 cursor-pointer text-lg"
                >
                  <Play className="w-5 h-5 text-purple-600 fill-purple-600" /> Watch Demo
                </motion.button>
              </a>
            </motion.div>


            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
              viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.8 }}
              className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500"
            >
              <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-500" /><span>Meta Verified</span></div>
              <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-500" /><span>No Credit Card</span></div>
              <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-500" /><span>14-Day Free Trial</span></div>
            </motion.div>

            {/* Floating stat cards */}
            <div className="relative mt-16 flex justify-center gap-6 flex-wrap">
              {[
                { label: "Creators", value: "60K+", color: "from-blue-500 to-purple-500" },
                { label: "Response Time", value: "< 1s", color: "from-green-500 to-emerald-500" },
                { label: "Engagement", value: "+300%", color: "from-pink-500 to-rose-500" },
              ].map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1 + i * 0.15, type: "spring", stiffness: 200 }}
                  animate={{ y: [0, -8, 0] }}
                  className="bg-white rounded-2xl px-6 py-4 shadow-lg border border-gray-100"
                >
                  <div className={`text-2xl font-black bg-gradient-to-r ${card.color} bg-clip-text text-transparent`}>{card.value}</div>
                  <div className="text-xs text-gray-500 font-semibold mt-1">{card.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* ═══════════════════════ SOCIAL PROOF BAR ═══════════════════════ */}
      <section className="py-12 border-y border-gray-100 bg-white/50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <motion.p
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-center text-sm font-semibold text-gray-400 uppercase tracking-wider mb-8"
          >
            Trusted by 60,000+ creators worldwide
          </motion.p>
          {/* Marquee of creator avatars */}
          <div className="relative">
            <div className="flex animate-marquee gap-8 items-center">
              {[...creators, ...creators].map((c, i) => (
                <div key={i} className="flex items-center gap-3 bg-white rounded-full pl-1 pr-5 py-1 shadow-sm border border-gray-100 shrink-0">
                  <img src={c.avatarImage} alt={c.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="text-xs font-bold text-gray-800">{c.name}</p>
                    <p className="text-[10px] text-gray-500">{c.followers} followers</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <style>{`
          @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
          .animate-marquee { animation: marquee 30s linear infinite; width: max-content; }
        `}</style>
      </section>


      {/* ═══════════════════════ DM SIMULATOR ═══════════════════════ */}
      <section id="demo" className="py-24 px-6 bg-gradient-to-b from-white to-gray-50/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">See It In Action</h2>
            <p className="text-gray-600 max-w-xl mx-auto">Watch how Flowora automatically converts comments into DM conversations in seconds.</p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Tabs */}
            <div className="space-y-4">
              {(Object.keys(simulatorPresets) as Array<keyof typeof simulatorPresets>).map((key) => (
                <motion.button
                  key={key}
                  onClick={() => setSelectedSim(key)}
                  whileHover={{ x: 4 }}
                  className={`w-full text-left p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                    selectedSim === key
                      ? "border-purple-300 bg-purple-50/80 shadow-lg shadow-purple-100"
                      : "border-gray-100 bg-white hover:border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${simulatorPresets[key].color} flex items-center justify-center text-white`}>
                      {key === "guide" ? <Camera className="w-5 h-5" /> : key === "discount" ? <Zap className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{simulatorPresets[key].name}</h4>
                      <p className="text-sm text-gray-500">Keyword: {simulatorPresets[key].keyword}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>


            {/* Right: Phone mockup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
              className="flex justify-center"
            >
              <div className="w-[320px] bg-slate-950 rounded-[40px] p-2.5 shadow-2xl border-4 border-slate-800 ring-1 ring-white/10">
                <div className="w-full aspect-[9/18] bg-white rounded-[30px] overflow-hidden flex flex-col relative pt-8 pb-4">
                  {/* Dynamic island */}
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-slate-950 rounded-full z-10" />
                  {/* Header */}
                  <div className="flex items-center gap-2 px-4 pb-3 border-b border-gray-100">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <img src="/flowora-favicon.svg" alt="Flowora" className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-gray-900">Flowora Bot</p>
                      <p className="text-[9px] text-green-600 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Active
                      </p>
                    </div>
                  </div>
                  {/* Chat messages */}
                  <div className="flex-1 p-4 space-y-3 overflow-hidden">
                    <AnimatePresence mode="wait">
                      {simStep >= 1 && (
                        <motion.div key={`comment-${selectedSim}`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex justify-start">
                          <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-2.5 max-w-[80%]">
                            <p className="text-[11px] text-gray-800 font-medium">{currentPreset.comment}</p>
                            <p className="text-[9px] text-gray-400 mt-1">Comment · Just now</p>
                          </div>
                        </motion.div>
                      )}
                      {simStep >= 2 && (
                        <motion.div key={`reply-${selectedSim}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="flex justify-end">
                          <div className="bg-gradient-to-r from-[#6d48ff] to-purple-600 rounded-2xl rounded-tr-none px-4 py-2.5 max-w-[80%]">
                            <p className="text-[11px] text-white font-medium">{currentPreset.replyComment}</p>
                            <p className="text-[9px] text-purple-200 mt-1">Auto-Reply ✓</p>
                          </div>
                        </motion.div>
                      )}
                      {simStep >= 3 && (
                        <motion.div key={`dm-${selectedSim}`} initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.3, type: "spring" }} className="flex justify-end">
                          <div className="bg-white border-2 border-purple-200 rounded-2xl px-4 py-3 max-w-[85%] shadow-md">
                            <p className="text-[11px] text-gray-800 font-medium">{currentPreset.dmText}</p>
                            <div className={`mt-2 bg-gradient-to-r ${currentPreset.color} text-white text-[10px] font-bold px-4 py-2 rounded-xl text-center`}>
                              {currentPreset.ctaLabel}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>


      {/* ═══════════════════════ FEATURES GRID ═══════════════════════ */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">Everything You Need to Scale</h2>
            <p className="text-gray-600 max-w-xl mx-auto">Powerful features designed to help creators grow faster with less effort.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.03, rotateY: 5 }}
                style={{ perspective: 1000 }}
                className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-purple-200/50 transition-all duration-300 cursor-default"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* ═══════════════════════ HOW IT WORKS ═══════════════════════ */}
      <section id="how-it-works" className="py-24 px-6 bg-gradient-to-b from-gray-50/50 to-white">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-lg mx-auto">Get started in under 3 minutes. No coding required.</p>
          </motion.div>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden lg:block absolute top-1/2 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-purple-200 via-purple-300 to-pink-200 -translate-y-1/2" />

            <div className="grid lg:grid-cols-3 gap-8">
              {steps.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2, duration: 0.6 }}
                  className="relative text-center"
                >
                  <div className="relative z-10 mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-[#6d48ff] to-purple-600 flex items-center justify-center text-white shadow-xl shadow-purple-500/20 mb-6">
                    <span className="text-2xl font-black">{s.step}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{s.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed max-w-xs mx-auto">{s.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* ═══════════════════════ STATS SECTION ═══════════════════════ */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, type: "spring", stiffness: 200 }}
                className="relative overflow-hidden rounded-2xl p-8 text-center bg-gradient-to-br from-gray-50 to-white border border-gray-100 shadow-sm"
              >
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${s.color}`} />
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white mx-auto mb-4`}>
                  <s.icon className="w-6 h-6" />
                </div>
                <div className="text-3xl sm:text-4xl font-black text-slate-900 mb-2">
                  <CountUp end={s.value} suffix={s.suffix} duration={2000} />
                </div>
                <p className="text-sm text-gray-600 font-semibold">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* ═══════════════════════ TESTIMONIALS ═══════════════════════ */}
      <section className="py-24 px-6 bg-gradient-to-b from-gray-50/50 to-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">Loved by Creators</h2>
            <p className="text-gray-600 max-w-lg mx-auto">See what our community has to say about their results with Flowora.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.02, y: -4 }}
                className={`bg-white rounded-2xl p-6 border shadow-sm hover:shadow-lg transition-all ${
                  i === testimonialIdx ? "border-purple-200 shadow-purple-100" : "border-gray-100"
                }`}
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, s) => (
                    <Star key={s} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-5 line-clamp-4">{t.text}</p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                  <img src={t.avatarImage} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-bold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role} · {t.followers}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* ═══════════════════════ PRICING ═══════════════════════ */}
      <section id="pricing" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-gray-600 max-w-lg mx-auto mb-8">Start free. Upgrade when you're ready to go all-in.</p>

            {/* Toggles */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {/* Billing toggle */}
              <div className="flex items-center gap-3 bg-gray-100 rounded-full p-1">
                <button
                  onClick={() => setBillingCycle("monthly")}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${billingCycle === "monthly" ? "bg-white shadow text-gray-900" : "text-gray-500"}`}
                >Monthly</button>
                <button
                  onClick={() => setBillingCycle("yearly")}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${billingCycle === "yearly" ? "bg-white shadow text-gray-900" : "text-gray-500"}`}
                >Yearly <span className="text-green-600 text-xs ml-1">Save 17%</span></button>
              </div>
              {/* Currency toggle */}
              <div className="flex items-center gap-3 bg-gray-100 rounded-full p-1">
                <button
                  onClick={() => setPricingCurrency("INR")}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${pricingCurrency === "INR" ? "bg-white shadow text-gray-900" : "text-gray-500"}`}
                >₹ INR</button>
                <button
                  onClick={() => setPricingCurrency("USD")}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${pricingCurrency === "USD" ? "bg-white shadow text-gray-900" : "text-gray-500"}`}
                >$ USD</button>
              </div>
            </div>
          </motion.div>


          {/* Pricing cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {pricingPlans.map((plan, i) => {
              const price = plan.name === "Free" ? 0
                : billingCycle === "yearly"
                  ? pricingCurrency === "USD" ? plan.priceUSD : plan.priceINR
                  : pricingCurrency === "USD" ? plan.monthlyUSD : plan.monthlyINR;
              const currency = pricingCurrency === "USD" ? "$" : "₹";

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  whileHover={{ scale: 1.02 }}
                  className={`relative rounded-3xl p-8 border-2 transition-all ${
                    plan.popular
                      ? "border-transparent bg-white shadow-2xl ring-2 ring-purple-500/20"
                      : "border-gray-100 bg-white shadow-sm"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#6d48ff] to-pink-500 text-white text-xs font-bold px-5 py-1.5 rounded-full shadow-lg">
                      POPULAR
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{plan.name}</h3>
                  <p className="text-sm text-gray-500 mb-5">{plan.description}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-black text-slate-900">{currency}{price}</span>
                    {plan.name !== "Free" && <span className="text-sm text-gray-500 ml-1">/ month</span>}
                  </div>
                  <Link to="/login">
                    <Button className={`w-full rounded-full h-12 font-bold text-sm cursor-pointer ${
                      plan.popular
                        ? "bg-gradient-to-r from-[#6d48ff] to-pink-500 text-white hover:opacity-90 shadow-lg"
                        : "bg-gray-900 text-white hover:bg-gray-800"
                    }`}>
                      {plan.name === "Free" ? "Get Started Free" : "Start Pro Trial"}
                    </Button>
                  </Link>
                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feat, fi) => (
                      <li key={fi} className="flex items-start gap-2 text-sm text-gray-700">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>


      {/* ═══════════════════════ FAQ ═══════════════════════ */}
      <section id="faq" className="py-24 px-6 bg-gradient-to-b from-gray-50/50 to-white">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600">Got questions? We've got answers.</p>
          </motion.div>

          <div className="space-y-3">
            {faqData.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left cursor-pointer hover:bg-gray-50/50 transition-colors"
                >
                  <span className="font-semibold text-slate-900 pr-4">{faq.question}</span>
                  <motion.div
                    animate={{ rotate: activeFaq === i ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {activeFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* ═══════════════════════ FINAL CTA ═══════════════════════ */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#6d48ff] via-purple-600 to-pink-600" />
        <FloatingParticles />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="inline-flex items-center gap-2 bg-white/15 backdrop-blur border border-white/20 text-white px-4 py-2 rounded-full mb-6"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-semibold">Join 60,000+ Creators</span>
            </motion.div>

            <h2 className="text-3xl sm:text-5xl font-black text-white mb-5 leading-tight">
              Ready to Go Viral?
            </h2>
            <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto">
              Start automating your Instagram DMs today. Free for 14 days, no credit card required.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={ctaEmail}
                onChange={(e) => setCtaEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-5 py-4 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="bg-white text-purple-700 px-8 py-4 rounded-full font-bold shadow-xl hover:bg-gray-100 transition-all cursor-pointer whitespace-nowrap"
                >
                  Start Free
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </PageLayout>
  );
}
