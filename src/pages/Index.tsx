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
  Quote,
  HelpCircle,
  Settings,
  Crown,
  ShoppingCart,
  GraduationCap,
  MapPin,
  Check,
  X,
  Tag,
  Video,
  Image
} from "lucide-react";

// Simulator Preset Configuration
const simulatorPresets = {
  guide: {
    name: "Lead Magnet Flow",
    keyword: "GUIDE",
    comment: "Can I get the free guide?",
    replyComment: "Sent! Check your DMs for the link 🚀",
    dmText: "Hey! Here is your download link for the IG growth secrets guide:",
    ctaLabel: "Get eBook",
    link: "https://flowora.com/free-guide",
    color: "from-violet-500 to-indigo-600",
  },
  discount: {
    name: "Coupon Code Flow",
    keyword: "SAVE20",
    comment: "Send me the discount code!",
    replyComment: "Done! Check your DMs for 20% off 💸",
    dmText: "Here is your 20% off coupon code: SAVE20. Use it at checkout:",
    ctaLabel: "Apply Code",
    link: "https://flowora.com/shop",
    color: "from-pink-500 to-rose-600",
  },
  webinar: {
    name: "Webinar Sign-up",
    keyword: "SEAT",
    comment: "Reserve my seat please!",
    replyComment: "Reserved! Check your DMs to complete sign-up 🎟️",
    dmText: "Click below to secure your spot for tomorrow's live automation masterclass:",
    ctaLabel: "Secure Spot",
    link: "https://flowora.com/webinar-register",
    color: "from-blue-500 to-cyan-600",
  }
};

// Data arrays from Figma reverse engineering
const Re = [
  { name: "Nike", gradient: "from-gray-800 to-gray-600" },
  { name: "Adidas", gradient: "from-blue-600 to-blue-800" },
  { name: "Puma", gradient: "from-orange-500 to-red-600" },
  { name: "Reebok", gradient: "from-purple-600 to-pink-600" },
  { name: "Under Armour", gradient: "from-green-600 to-teal-600" },
  { name: "New Balance", gradient: "from-indigo-600 to-purple-600" }
];

const Id = [
  { name: "Priya Patel", niche: "Fitness Coach", followers: "125K", avatar: 1, avatarImage: "/creator_indian_1.png" },
  { name: "Aarav Sharma", niche: "Tech & Gadgets Reviewer", followers: "185K", avatar: 2, avatarImage: "/creator_indian_2.png" },
  { name: "Ananya Iyer", niche: "Fashion Designer & Vlogger", followers: "240K", avatar: 3, avatarImage: "/creator_indian_3.png" },
  { name: "Kabir Mehta", niche: "Business Coach", followers: "156K", avatar: 4, avatarImage: "/creator_indian_4.png" },
  { name: "Rohan Verma", niche: "Travel Vlogger", followers: "98K", avatar: 5, avatarImage: "/creator_indian_2.png" },
  { name: "Diya Malhotra", niche: "Food Content Creator", followers: "177K", avatar: 6, avatarImage: "/creator_indian_3.png" }
];

const _d = [
  {
    name: "Priya Patel",
    role: "Fitness Influencer",
    followers: "120K",
    avatar: 1,
    avatarImage: "/creator_indian_1.png",
    rating: 5,
    text: "Flowora has been a game-changer for my business. I went from spending 3 hours a day replying to DMs to doing it completely on autopilot. My sales went up 300% in the first month!"
  },
  {
    name: "Aarav Sharma",
    role: "Tech Creator",
    followers: "185K",
    avatar: 2,
    avatarImage: "/creator_indian_2.png",
    rating: 5,
    text: "The lead capture tool inside comments is incredible. I've collected over 12,000 verified emails directly through Instagram comments. Highly recommend it to any creator."
  },
  {
    name: "Ananya Iyer",
    role: "Lifestyle & Fashion",
    followers: "240K",
    avatar: 3,
    avatarImage: "/creator_indian_3.png",
    rating: 5,
    text: "Extremely user-friendly and Meta-compliant. I set it up in less than 10 minutes and it's been running flawlessly. The support team is also exceptionally fast."
  },
  {
    name: "Kabir Mehta",
    role: "Business Coach",
    followers: "156K",
    avatar: 4,
    avatarImage: "/creator_indian_4.png",
    rating: 5,
    text: "I was skeptical about automated responses, but my engagement rose by 180% and the responses feel natural. My audience loves it."
  }
];

const Ud = [
  {
    name: "Free",
    priceUSD: 0,
    priceINR: 0,
    description: "Perfect for creators just getting started",
    features: [
      "1 connected Instagram account",
      "Up to 1,000 DMs / month",
      "Up to 10 active campaigns",
      "Comment Auto-DM automation",
      "Lead capture & contact CRM",
      "7-day analytics dashboard",
      "Real-time activity feed",
      "Community support"
    ],
    gradient: "from-gray-500 to-gray-700",
    popular: false
  },
  {
    name: "Pro",
    priceUSD: 4.99,
    priceINR: 399,
    monthlyUSD: 5.99,
    monthlyINR: 499,
    description: "Full automation suite",
    features: [
      "10 connected Instagram accounts",
      "Unlimited DMs per month",
      "Unlimited campaigns",
      "Unlimited lead collection",
      "All automations: Comment, Story DM, Ask-for-Follow & Lead Gen",
      "Re-trigger old commenters & followers",
      "Email & phone collection in DM",
      "Story Mention Auto-DM",
      "Advanced analytics (7d / 30d / 90d)",
      "Per-campaign performance reports",
      "CSV export of leads & contacts",
      "Webhook auto-retry & reliability",
      "Priority email + chat support",
      "7-day money-back guarantee"
    ],
    gradient: "from-purple-600 to-pink-600",
    popular: true
  }
];

const Hd = [
  {
    question: "Is Flowora safe for my Instagram account?",
    answer: "Absolutely! We're an official Meta Technology Provider, which means we follow all Instagram guidelines and best practices. Your account is completely safe with us."
  },
  {
    question: "Do I need any technical skills to use Flowora?",
    answer: "Not at all! Flowora is designed to be super user-friendly. You can set up your automation in just a few clicks—no coding or technical knowledge required."
  },
  {
    question: "Can I customize the automated messages?",
    answer: "Yes! You have complete control over your messages. Customize replies for comments, stories, and DMs. Add your links, create forms, and personalize everything to match your brand."
  },
  {
    question: "How does the email capture work?",
    answer: "When someone engages with your content, Flowora can automatically send them a custom form in their DMs to collect their email. It's seamless and compliant with all privacy regulations."
  },
  {
    question: "What if I need help or have questions?",
    answer: "Our support team is here for you! We offer 24/7 customer support via chat and email. Plus, we have extensive documentation and video tutorials to help you get the most out of Flowora."
  },
  {
    question: "Can I try Flowora for free?",
    answer: "Yes! We offer a 14-day free trial with full access to all features. No credit card required. Try it risk-free and see the results for yourself."
  }
];

const rs = [
  {
    icon: Link2,
    step: "01",
    title: "Connect Your Instagram",
    description: "Link your Instagram account securely in just one click. We're a Meta Verified Partner, so your account is always safe."
  },
  {
    icon: Settings,
    step: "02",
    title: "Set Up Automation",
    description: "Create custom auto-replies for comments, stories, and DMs. Add your links, forms, and personalized messages."
  },
  {
    icon: Rocket,
    step: "03",
    title: "Watch It Grow",
    description: "Sit back as Flowora engages with your audience 24/7. Track results, capture emails, and convert followers into customers."
  }
];

const Fd = [
  {
    icon: MessageSquare,
    title: "Auto-Reply to Comments",
    description: "Automatically respond to every comment with personalized messages and links to your offers.",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    icon: Sparkles,
    title: "Story Reply Automation",
    description: "Engage with everyone who replies to your stories with instant, automated responses.",
    gradient: "from-purple-500 to-pink-500"
  },
  {
    icon: Mail,
    title: "Email Capture",
    description: "Collect emails directly in DMs with custom forms and grow your email list on autopilot.",
    gradient: "from-orange-500 to-red-500"
  },
  {
    icon: Zap,
    title: "Instant DM Links",
    description: 'Send followers what they need directly in their DMs—no more "link in bio" hassle.',
    gradient: "from-green-500 to-emerald-500"
  },
  {
    icon: TrendingUp,
    title: "Advanced Analytics",
    description: "Track engagement, conversions, and ROI with detailed insights and reports.",
    gradient: "from-indigo-500 to-blue-500"
  },
  {
    icon: ShieldCheck,
    title: "Meta Verified & Secure",
    description: "Official Meta Technology Provider with enterprise-grade security and compliance.",
    gradient: "from-gray-700 to-gray-900"
  }
];

const kd = [
  {
    icon: Users,
    value: 60000,
    suffix: "+",
    label: "Active Creators",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: MessageSquare,
    value: 100,
    suffix: "M+",
    label: "Messages Automated",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: TrendingUp,
    value: 300,
    suffix: "%",
    label: "Avg. Engagement Boost",
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: Zap,
    value: 24,
    suffix: "/7",
    label: "Always Active",
    color: "from-orange-500 to-red-500"
  }
];

// Social proof notification data
const socialProofNotifications = [
  { name: "Priya", location: "Mumbai", action: "just started their free trial", time: "2 min ago" },
  { name: "Aarav", location: "Delhi", action: "upgraded to Pro plan", time: "5 min ago" },
  { name: "Ananya", location: "Bangalore", action: "captured 150 leads today", time: "8 min ago" },
  { name: "Kabir", location: "Pune", action: "just started their free trial", time: "11 min ago" },
  { name: "Rohan", location: "Hyderabad", action: "automated 500 DMs this week", time: "15 min ago" },
  { name: "Diya", location: "Chennai", action: "upgraded to Pro plan", time: "18 min ago" },
];

// Floating social proof toast
function SocialProofToast() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show notification after 5 seconds, then cycle every 8 seconds
    const initialDelay = setTimeout(() => {
      setVisible(true);
    }, 5000);

    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % socialProofNotifications.length);
        setVisible(true);
      }, 500);
    }, 8000);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, []);

  const notification = socialProofNotifications[currentIndex];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: 0 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="fixed bottom-6 left-6 z-50 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 max-w-[300px] hidden md:flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {notification.name[0]}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate">
              {notification.name} from {notification.location}
            </p>
            <p className="text-[10px] text-gray-500 font-semibold truncate">{notification.action}</p>
            <p className="text-[9px] text-gray-400 font-medium mt-0.5">{notification.time}</p>
          </div>
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse flex-shrink-0" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Floating particles overlay for CTA
function FloatingParticles() {
  const particles = Array.from({ length: 25 });
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 bg-white/20 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -40, 0],
            opacity: [0, 0.8, 0],
            scale: [0.5, 1.5, 0.5],
          }}
          transition={{
            duration: 4 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 4,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}


const showcaseTabs = [
  {
    title: "Respond to every comment",
    description: "Auto-respond to every Instagram comment in a DM. Keep your audience (and the algorithm) happy — and watch your revenue grow.",
    icon: MessageSquare,
    bubbles: [
      { sender: "bot", content: "Hey there! I'm so happy you're here, thanks so much for your interest 😊. Click below and I'll send you the link in just a sec ✨", hasButton: true, btnText: "Send me the link" },
      { sender: "user", content: "Send me the link" },
      { sender: "bot", content: "Hey!! Here is your link enjoy your trial 👋", hasButton: true, btnText: "Get Link" }
    ]
  },
  {
    title: "Only send links after they follow you",
    description: "Ensure followers are actually following your page before sending them lead magnets or coupon codes. Boost your follower count automatically.",
    icon: Users,
    bubbles: [
      { sender: "user", content: "GIVEAWAY" },
      { sender: "bot", content: "Checking if you follow @flowora... 🔍" },
      { sender: "bot", content: "Thanks for the follow! 🎉 Here is your entry ticket: https://flowora.com/ticket", hasButton: true, btnText: "Get Ticket" }
    ]
  },
  {
    title: "Create data collection forms",
    description: "Gather verified emails and phone numbers natively inside Instagram DMs. Sync them automatically to your email marketing tool.",
    icon: Mail,
    bubbles: [
      { sender: "user", content: "GUIDE" },
      { sender: "bot", content: "Great! Where should I send the guide? Please type your email address below: 📧" },
      { sender: "user", content: "user@example.com" },
      { sender: "bot", content: "Email saved! Sent the guide to user@example.com. Check your inbox! 🚀" }
    ]
  },
  {
    title: "Never leave a DM unanswered",
    description: "Set up 24/7 automated support for frequently asked questions, product questions, and objection handling in comments.",
    icon: HelpCircle,
    bubbles: [
      { sender: "user", content: "Is this course live?" },
      { sender: "bot", content: "It is pre-recorded so you can learn at your own pace! You get lifetime access to all updates. 📚", hasButton: true, btnText: "See Curriculum" }
    ]
  }
];

export default function Index() {
  const [activeTab, setActiveTab] = useState(0);

  // Autoplay for the interactive accordion section
  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveTab((prev) => (prev + 1) % showcaseTabs.length);
    }, 5000); // changes tab every 5 seconds
    return () => clearTimeout(timer);
  }, [activeTab]);

  // DM Flow Mockup Cycle (for the new interactive mockup section)
  const [mockupStep, setMockupStep] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setMockupStep((prev) => (prev + 1) % 9); // Steps 0 to 8
    }, 2200); // 2.2 seconds per step transition
    return () => clearInterval(timer);
  }, []);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  // Component local states
  const [selectedSim, setSelectedSim] = useState<keyof typeof simulatorPresets>("guide");
  const [simStep, setSimStep] = useState<"idle" | "comment" | "reply" | "dm" | "done">("idle");
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [demoPlaying, setDemoPlaying] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");
  const [pricingCurrency, setPricingCurrency] = useState<"USD" | "INR">("INR");

  // Redirect handling for active login sessions
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Auth callback error detection
  useEffect(() => {
    const errorCode = searchParams.get("error_code");
    const errorDesc = searchParams.get("error_description");
    const errorMsg = searchParams.get("error");
    if (errorCode || errorMsg) {
      toast.error(`Authentication failed: ${errorDesc || errorMsg || errorCode}`);
      navigate("/", { replace: true });
    }
  }, [searchParams, navigate]);

  // IG Mockup Simulator loops on step progress
  useEffect(() => {
    setSimStep("idle");
    const t1 = setTimeout(() => setSimStep("comment"), 1200);
    const t2 = setTimeout(() => setSimStep("reply"), 2800);
    const t3 = setTimeout(() => setSimStep("dm"), 4400);
    const t4 = setTimeout(() => setSimStep("done"), 6000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [selectedSim]);

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
      {/* Social Proof Toast Notification */}
      <SocialProofToast />

      {/* ── HERO SECTION ── */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden bg-white">
        {/* Blurry decorative background blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Content */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/50 text-blue-600 px-4 py-2 rounded-full mb-6 shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">Meta Verified Partner</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-5xl lg:text-7xl font-bold leading-tight mb-6 text-slate-900"
              >
                Go Viral On IG with{" "}
                <span 
                  className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent inline-block animate-shine"
                  style={{ backgroundSize: "200% 200%" }}
                >
                  DM Automation
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl text-gray-600 mb-8 leading-relaxed max-w-xl"
              >
                Auto-reply to comments, stories, and DMs with your link. Capture emails, grow followers, and track results—all on autopilot.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 mb-8"
              >
                <Link to="/login" className="w-full sm:w-auto">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white px-8 py-4 rounded-full font-semibold shadow-xl hover:shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Start For Free
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </Link>
                <a href="#how-it-works" className="w-full sm:w-auto">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full sm:w-auto border-2 border-gray-200 bg-white/50 backdrop-blur-sm text-gray-700 px-8 py-4 rounded-full font-semibold hover:border-gray-300 hover:bg-white transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    <Play className="w-4 h-4 text-purple-600 fill-purple-600" />
                    Watch Demo
                  </motion.button>
                </a>
              </motion.div>

              {/* Trust badges */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-wrap items-center gap-6 text-sm text-gray-600"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <span>14-day free trial</span>
                </div>
              </motion.div>
            </div>

            {/* Right Interactive Simulator Column */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
              whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative flex justify-center lg:justify-end"
            >
              <div className="w-full max-w-[370px] relative">
                
                {/* Floating stat card 1: Creators Count */}
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                  whileHover={{ scale: 1.08 }}
                  className="absolute -top-6 -right-6 bg-white rounded-2xl p-4 shadow-xl border border-gray-100/50 flex flex-col items-center z-25"
                >
                  <motion.div
                    animate={{ scale: [1, 1.06, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    className="text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                  >
                    60K+
                  </motion.div>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Creators</span>
                </motion.div>

                {/* Floating stat card 2: Response time */}
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                  className="absolute -bottom-6 -left-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl p-4 shadow-xl text-white flex items-center gap-2.5 z-25"
                >
                  <Zap className="w-5 h-5 text-yellow-300 fill-yellow-300 animate-pulse" />
                  <div>
                    <div className="text-[9px] font-bold text-emerald-100 uppercase tracking-widest leading-none mb-1">Response Time</div>
                    <div className="text-base font-black leading-none">Instant</div>
                  </div>
                </motion.div>

                {/* Main Phone Simulation Box - Realistic iPhone Mockup */}
                <div className="relative w-full max-w-[340px] mx-auto aspect-[9/18.5] bg-slate-950 rounded-[45px] p-2.5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] border-[4px] border-slate-800 ring-1 ring-white/10">
                  {/* Left Side Buttons */}
                  <div className="absolute -left-[3px] top-24 w-[3px] h-6 bg-slate-800 rounded-l" />
                  <div className="absolute -left-[3px] top-36 w-[3px] h-10 bg-slate-800 rounded-l" />
                  <div className="absolute -left-[3px] top-48 w-[3px] h-10 bg-slate-800 rounded-l" />
                  {/* Right Power Button */}
                  <div className="absolute -right-[3px] top-36 w-[3px] h-14 bg-slate-800 rounded-r" />
                  
                  {/* Internal Phone Screen Container */}
                  <div className="w-full h-full bg-white rounded-[35px] overflow-hidden flex flex-col relative pt-7 pb-3 border border-slate-900/5 select-none">
                    
                    {/* Dynamic Island Notch */}
                    <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-950 rounded-full z-30 flex items-center justify-between px-3.5 shadow-inner">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                      <div className="w-2 h-2 rounded-full bg-[#0d1e3d]" />
                    </div>

                    {/* Status Bar */}
                    <div className="h-6 flex justify-between items-center px-5 text-[10px] font-bold text-gray-800 z-20 select-none pointer-events-none mb-1">
                      <span>9:41</span>
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3 h-3 fill-current text-gray-800" viewBox="0 0 24 24">
                          <path d="M12 3c-1.2 0-2.4.2-3.6.7L9.7 5c.7-.3 1.5-.5 2.3-.5.8 0 1.6.2 2.3.5l1.3-1.3C14.4 3.2 13.2 3 12 3zm0 4c-.7 0-1.4.2-2.1.5l1.3 1.3c.2-.1.5-.2.8-.2s.6.1.8.2l1.3-1.3c-.7-.3-1.4-.5-2.1-.5zm0 4c-.2 0-.4.1-.6.2l1.3 1.3c.1-.1.3-.2.5-.2.2 0 .4.1.5.2l1.3-1.3c-.2-.1-.4-.2-.6-.2zm0 4a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
                        </svg>
                        <svg className="w-2.5 h-2.5 fill-current text-gray-800" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                        </svg>
                        <div className="w-4.5 h-2.5 border border-gray-800 rounded-sm p-0.5 flex items-center">
                          <div className="w-full h-full bg-gray-800 rounded-2xs" />
                        </div>
                      </div>
                    </div>

                    {/* Chat Content Panel */}
                    <div className="flex-1 flex flex-col justify-between px-4 overflow-hidden">
                      
                      {/* Header bar mock */}
                      <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                          className="w-8 h-8 rounded-full bg-white shadow-sm ring-1 ring-purple-100 flex items-center justify-center overflow-hidden"
                        >
                          <img src="/flowora-favicon.svg" alt="Flowora" className="h-full w-full object-cover" />
                        </motion.div>
                        <div>
                          <h4 className="font-extrabold text-[12px] text-gray-900 leading-none">Flowora Bot</h4>
                          <p className="text-[9px] text-gray-400 mt-0.5 flex items-center gap-1 font-semibold">
                            <span className="w-1 h-1 bg-green-500 rounded-full inline-block animate-ping" />
                            Instagram DM
                          </p>
                        </div>
                      </div>

                      {/* Chat Bubble Loop Simulator */}
                      <div className="flex-1 space-y-2.5 py-3 overflow-y-auto min-h-[200px] scrollbar-none">
                        {/* Follower comments trigger */}
                        {(simStep === "comment" || simStep === "reply" || simStep === "dm" || simStep === "done") && (
                          <motion.div
                            initial={{ opacity: 0, x: -20, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            className="bg-gray-100 rounded-2xl rounded-tl-none p-3 max-w-[85%] text-[10.5px] font-semibold text-gray-800 shadow-sm"
                          >
                            <p className="text-[8px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Follower Comment</p>
                            {currentPreset.comment}
                          </motion.div>
                        )}

                        {/* Bot reply comment trigger notification */}
                        {(simStep === "reply" || simStep === "dm" || simStep === "done") && (
                          <motion.div
                            initial={{ opacity: 0, x: 20, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            className="bg-purple-50 border border-purple-100 rounded-2xl rounded-tr-none p-3 max-w-[85%] text-[10.5px] font-bold text-purple-700 ml-auto shadow-sm"
                          >
                            <p className="text-[8px] text-purple-400 font-bold uppercase tracking-wider mb-0.5">Auto-Reply</p>
                            {currentPreset.replyComment}
                          </motion.div>
                        )}

                        {/* Bot send DM link */}
                        {(simStep === "dm" || simStep === "done") && (
                          <motion.div
                            initial={{ opacity: 0, y: 15, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl rounded-tl-none p-3 max-w-[90%] text-[10.5px] shadow-md space-y-1.5"
                          >
                            <div className="flex items-center gap-1">
                              <Zap className="w-3 h-3 text-yellow-300 fill-yellow-300" />
                              <span className="font-extrabold text-[8px] tracking-wider uppercase">Direct Link Sent</span>
                            </div>
                            <p className="leading-relaxed font-semibold">{currentPreset.dmText}</p>
                            <div className="bg-white/15 border border-white/20 p-2 rounded-lg text-[9px] text-center font-bold tracking-tight text-white/95">
                              {currentPreset.link}
                            </div>
                          </motion.div>
                        )}

                        {/* User clicks & downloads */}
                        {simStep === "done" && (
                          <motion.div
                            initial={{ opacity: 0, x: -20, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            className="bg-gray-100 rounded-2xl rounded-tl-none p-3 max-w-[85%] text-[10.5px] font-semibold text-gray-800 shadow-sm"
                          >
                            Amazing! Just downloaded it 😍
                          </motion.div>
                        )}
                      </div>

                      {/* Selector triggers bar */}
                      <div className="flex justify-between gap-1 pt-2 border-t border-gray-100">
                        {Object.keys(simulatorPresets).map((presetKey) => {
                          const key = presetKey as keyof typeof simulatorPresets;
                          const isSelected = selectedSim === key;
                          return (
                            <button
                              key={key}
                              onClick={() => setSelectedSim(key)}
                              className={`flex-1 text-[8px] py-1.5 rounded-md font-bold transition-all cursor-pointer text-center ${
                                isSelected
                                  ? "bg-slate-900 text-white shadow-sm"
                                  : "bg-gray-50 hover:bg-gray-100 text-gray-500"
                              }`}
                            >
                              {simulatorPresets[key].keyword}
                            </button>
                          );
                        })}
                      </div>

                    </div>

                    {/* Home Indicator */}
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-24 h-1 bg-gray-300 rounded-full z-20 pointer-events-none" />

                  </div>
                </div>

              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── BRAND LOGOS MARQUEE TICKER ── */}
      <section className="relative overflow-hidden py-12 bg-gradient-to-r from-gray-50 to-white border-y border-gray-100">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-gray-50 to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-gray-50 to-transparent z-10" />
        <div className="flex items-center">
          <motion.div
            className="flex gap-12 items-center whitespace-nowrap"
            animate={{ x: [0, -180 * Re.length] }}
            transition={{
              x: {
                duration: 22,
                repeat: Infinity,
                ease: "linear",
              }
            }}
          >
            {[...Re, ...Re, ...Re].map((brand, idx) => (
              <div
                key={idx}
                className="flex-shrink-0 w-36 h-12 flex items-center justify-center"
              >
                <div className={`bg-gradient-to-r ${brand.gradient} rounded-xl py-2 px-5 shadow-sm border border-white/10 flex items-center justify-center`}>
                  <span className="text-white font-bold text-sm tracking-wide">{brand.name}</span>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CREATORS GRID SECTION ── */}
      <section className="py-20 px-6 bg-gradient-to-b from-white to-blue-50/50">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center mb-16 space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200/50 text-yellow-700 px-5 py-2.5 rounded-full shadow-sm"
            >
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-semibold">Trusted by 60,000+ Creators</span>
            </motion.div>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
              Join Thousands of Successful Creators
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              From fitness coaches to fashion bloggers, creators across all niches are using Flowora to automate their Instagram engagement and grow their business.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Id.map((creator, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl p-6 hover:shadow-xl transition-all"
              >
                <div className="flex items-center gap-4 mb-4">
                  {creator.avatarImage ? (
                    <img 
                      src={creator.avatarImage} 
                      alt={creator.name} 
                      className="w-12 h-12 rounded-full object-cover shadow-md border border-gray-200" 
                    />
                  ) : (
                    <motion.div
                      className="w-12 h-12 rounded-full shadow-inner flex items-center justify-center font-bold text-white text-xs"
                      style={{
                        background: `linear-gradient(135deg, hsl(${creator.avatar * 60}, 75%, 65%), hsl(${creator.avatar * 60 + 40}, 75%, 55%))`
                      }}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                     >
                      {creator.name.split(" ").map(w => w[0]).join("")}
                    </motion.div>
                  )}
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm leading-snug">{creator.name}</h4>
                    <p className="text-xs text-gray-400 font-semibold">{creator.niche}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                  {/* Static review stars */}
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, a) => (
                      <Star key={a} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold">
                    <Users className="w-3.5 h-3.5 text-gray-400" />
                    {creator.followers} followers
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ── STATS SECTION ── */}
      <section className="py-16 px-6 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {kd.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -5, scale: 1.04 }}
                className="text-center group p-4"
              >
                <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-md text-white`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                
                {/* Dynamically counts up to target value */}
                <div className="text-4xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-1">
                  <CountUp
                    end={stat.value}
                    suffix={stat.suffix}
                    triggerImmediately={false}
                  />
                </div>
                <div className="text-sm text-gray-500 font-semibold">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section id="features" className="py-20 px-6 relative overflow-hidden bg-gray-50/50">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-purple-300/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
              Everything You Need to{" "}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Automate &amp; Grow
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Powerful features designed to help you convert more followers into customers while saving hours every day.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Fd.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="bg-white/85 backdrop-blur-md rounded-3xl p-8 shadow-md hover:shadow-xl transition-all group border border-gray-100/60"
              >
                <motion.div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-md text-white`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <feature.icon className="w-6 h-6" />
                </motion.div>
                
                <h3 className="text-xl font-bold mb-3 text-slate-900 group-hover:text-purple-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed font-medium">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ── INTERACTIVE ACCORDION & PHONE SHOWCASE SECTION ── */}
      <section className="py-24 px-6 bg-white relative overflow-hidden border-t border-gray-100">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-purple-300/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10 grid lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Column - Accordion */}
          <div className="lg:col-span-6 space-y-8">
            {showcaseTabs.map((tab, idx) => {
              const isActive = activeTab === idx;
              const Icon = tab.icon;
              return (
                <div
                  key={idx}
                  onClick={() => setActiveTab(idx)}
                  className="cursor-pointer border-b border-gray-100 pb-6 last:border-b-0 group"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                      isActive 
                        ? "bg-purple-100 text-purple-600 scale-110 shadow-md" 
                        : "bg-gray-50 text-gray-400 group-hover:bg-gray-100 group-hover:text-gray-600"
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-xl font-bold transition-colors ${
                        isActive ? "text-slate-900" : "text-gray-600 group-hover:text-gray-900"
                      }`}>
                        {tab.title}
                      </h3>
                      
                      <AnimatePresence initial={false}>
                        {isActive && (
                          <motion.div
                            initial={{ height: 0, opacity: 0, marginTop: 0 }}
                            animate={{ height: "auto", opacity: 1, marginTop: 8 }}
                            exit={{ height: 0, opacity: 0, marginTop: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <p className="text-sm text-gray-500 font-semibold leading-relaxed">
                              {tab.description}
                            </p>
                            <div className="relative mt-4 w-full h-[3px] bg-slate-100 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 5, ease: "linear" }}
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column - Mockup Graphic */}
          <div className="lg:col-span-6 flex justify-center relative">
            <div className="relative w-full max-w-[340px] mx-auto aspect-[9/18.5] bg-slate-950 rounded-[45px] p-2.5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] border-[4px] border-slate-800 ring-1 ring-white/10">
              {/* Left Side Buttons */}
              <div className="absolute -left-[3px] top-24 w-[3px] h-6 bg-slate-800 rounded-l" />
              <div className="absolute -left-[3px] top-36 w-[3px] h-10 bg-slate-800 rounded-l" />
              <div className="absolute -left-[3px] top-48 w-[3px] h-10 bg-slate-800 rounded-l" />
              {/* Right Power Button */}
              <div className="absolute -right-[3px] top-36 w-[3px] h-14 bg-slate-800 rounded-r" />
              
              {/* Internal Phone Screen Container */}
              <div className="w-full h-full rounded-[35px] overflow-hidden flex flex-col relative pt-7 pb-3 border border-slate-900/5 select-none bg-slate-950">
                {/* Dynamic Island Notch */}
                <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-950 rounded-full z-30 flex items-center justify-between px-3.5 shadow-inner">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                  <div className="w-2 h-2 rounded-full bg-[#0d1e3d]" />
                </div>

                {/* Status Bar */}
                <div className="h-6 flex justify-between items-center px-5 text-[10px] font-bold text-white z-20 select-none pointer-events-none pt-4 mb-2">
                  <span>9:41</span>
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3 h-3 fill-current text-white" viewBox="0 0 24 24">
                      <path d="M12 3c-1.2 0-2.4.2-3.6.7L9.7 5c.7-.3 1.5-.5 2.3-.5.8 0 1.6.2 2.3.5l1.3-1.3C14.4 3.2 13.2 3 12 3zm0 4c-.7 0-1.4.2-2.1.5l1.3 1.3c.2-.1.5-.2.8-.2s.6.1.8.2l1.3-1.3c-.7-.3-1.4-.5-2.1-.5zm0 4c-.2 0-.4.1-.6.2l1.3 1.3c.1-.1.3-.2.5-.2.2 0 .4.1.5.2l1.3-1.3c-.2-.1-.4-.2-.6-.2zm0 4a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
                    </svg>
                    <svg className="w-2.5 h-2.5 fill-current text-white" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                    </svg>
                    <div className="w-4.5 h-2.5 border border-white rounded-sm p-0.5 flex items-center">
                      <div className="w-full h-full bg-white rounded-2xs" />
                    </div>
                  </div>
                </div>

                {/* Chat Header */}
                <div className="flex items-center gap-2.5 px-4 pb-2 border-b border-white/10 z-10">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden ring-1 ring-white/20">
                    <img src="/flowora-favicon.svg" alt="Flowora" className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[11px] text-white leading-none">Excited Creator</h4>
                    <p className="text-[9px] text-gray-400 mt-0.5 font-semibold">Instagram DM</p>
                  </div>
                </div>

                {/* Animated Floating Bubbles */}
                <div className="flex-1 p-4 pt-3 flex flex-col justify-start space-y-3 overflow-hidden relative">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={{
                        hidden: { opacity: 0 },
                        visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
                      }}
                      className="w-full h-full relative"
                    >
                      {showcaseTabs[activeTab].bubbles.map((bubble, bIdx) => {
                        const isBot = bubble.sender === "bot";
                        const totalBubbles = showcaseTabs[activeTab].bubbles.length;
                        
                        // Dynamic layout positioning based on the index and total bubbles
                        let positionClass = "";
                        if (totalBubbles === 2) {
                          if (bIdx === 0) positionClass = "absolute right-0 top-6 w-[80%]";
                          else positionClass = "absolute left-0 top-[36%] w-[85%]";
                        } else if (totalBubbles === 3) {
                          if (bIdx === 0) {
                            positionClass = isBot ? "absolute left-0 top-4 w-[85%]" : "absolute right-0 top-4 w-[75%]";
                          } else if (bIdx === 1) {
                            positionClass = isBot ? "absolute left-0 top-[36%] w-[85%]" : "absolute right-0 top-[36%] w-[75%]";
                          } else {
                            positionClass = isBot ? "absolute left-0 bottom-6 w-[85%]" : "absolute right-0 bottom-6 w-[75%]";
                          }
                        } else { // 4 bubbles
                          if (bIdx === 0) {
                            positionClass = isBot ? "absolute left-0 top-2 w-[85%]" : "absolute right-0 top-2 w-[75%]";
                          } else if (bIdx === 1) {
                            positionClass = isBot ? "absolute left-0 top-[22%] w-[85%]" : "absolute right-0 top-[22%] w-[75%]";
                          } else if (bIdx === 2) {
                            positionClass = isBot ? "absolute left-0 top-[48%] w-[85%]" : "absolute right-0 top-[48%] w-[75%]";
                          } else {
                            positionClass = isBot ? "absolute left-0 bottom-4 w-[85%]" : "absolute right-0 bottom-4 w-[75%]";
                          }
                        }

                        return (
                          <motion.div
                            key={bIdx}
                            variants={{
                              hidden: { opacity: 0, y: 12, scale: 0.9 },
                              visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 200 } }
                            }}
                            className={`${positionClass} flex gap-2 items-start z-10`}
                          >
                            {/* Mini profile avatar for Bot bubbles */}
                            {isBot && (
                              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0 flex items-center justify-center overflow-hidden ring-1 ring-white/20">
                                <img src="/flowora-favicon.svg" alt="Flowora" className="h-full w-full object-cover" />
                              </div>
                            )}
                            
                            <div className={`p-2.5 rounded-xl text-[10.5px] font-semibold leading-snug shadow-lg ${
                              isBot
                                ? "bg-slate-800/90 text-white rounded-tl-none border border-white/10"
                                : "bg-white text-gray-800 rounded-tr-none border border-gray-200 ml-auto"
                            }`}>
                              <p>{bubble.content}</p>
                              {bubble.hasButton && (
                                <div className="mt-2 bg-white/15 border border-white/20 text-white font-bold text-[8.5px] py-1.5 px-3 rounded-md text-center">
                                  {bubble.btnText}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Home Indicator */}
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-24 h-1 bg-white/50 rounded-full z-20 pointer-events-none" />

              </div>
            </div>
          </div>

        </div>
      </section>



      {/* ── VIDEO ACTION DEMO SECTION ── */}
      <section className="py-20 px-6 bg-white relative overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-200/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight">
              See Flowora in{" "}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Action
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Watch how easy it is to automate your Instagram engagement and convert followers into customers.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            {/* Visual placeholder for the product demo video */}
            <div className="relative aspect-video bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl overflow-hidden shadow-2xl border border-slate-800/80 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 pointer-events-none" />
              
              {!demoPlaying ? (
                <motion.button
                  className="absolute inset-0 flex flex-col items-center justify-center group z-10 cursor-pointer"
                  onClick={() => setDemoPlaying(true)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl group-hover:shadow-blue-500/40 transition-all">
                    <Play className="w-8 h-8 text-purple-600 fill-purple-600 ml-1" />
                  </div>
                  <span className="text-white/80 font-bold text-xs mt-4 tracking-widest uppercase">Click to Play Demo</span>
                </motion.button>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-slate-950/90 text-white z-10">
                  <Play className="w-12 h-12 text-yellow-300 fill-yellow-300 animate-ping mb-4" />
                  <p className="text-sm font-bold uppercase tracking-widest text-slate-350">Streaming demo content...</p>
                  <button 
                    onClick={() => setDemoPlaying(false)}
                    className="mt-6 text-xs border border-white/20 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full font-bold cursor-pointer"
                  >
                    Pause Video
                  </button>
                </div>
              )}

              <div className="absolute inset-0 flex flex-col justify-end p-8 text-white bg-gradient-to-t from-slate-950/50 via-transparent to-transparent pointer-events-none">
                <h4 className="text-lg font-bold">Product Demo Video</h4>
                <p className="text-xs text-white/70">Setup in 5 min • No coding needed • 24/7 automation</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CUSTOM SOLUTIONS SECTION ── */}
      <section className="py-24 px-6 bg-white relative overflow-hidden">
        {/* Decorative background glows */}
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-purple-200/10 to-indigo-200/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-pink-200/10 to-blue-200/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* Header block with animated letters/words */}
          <div className="text-center mb-20">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.05
                  }
                }
              }}
              className="space-y-4"
            >
              <motion.span
                variants={{
                  hidden: { opacity: 0, scale: 0.95 },
                  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100 } }
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider text-purple-600 bg-purple-50 border border-purple-100 uppercase animate-pulse"
              >
                Use Cases
              </motion.span>
              
              <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-none mt-2">
                {"Perfect for every ".split(" ").map((word, i) => (
                  <motion.span
                    key={i}
                    className="inline-block mr-2"
                    variants={{
                      hidden: { opacity: 0, y: 25 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
                    }}
                  >
                    {word}
                  </motion.span>
                ))}
                <span className="inline-block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {"Instagram business".split(" ").map((word, i) => (
                    <motion.span
                      key={i}
                      className="inline-block mr-2"
                      variants={{
                        hidden: { opacity: 0, y: 25, scale: 0.9 },
                        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, type: "spring", stiffness: 80, delay: i * 0.1 } }
                      }}
                    >
                      {word}
                    </motion.span>
                  ))}
                </span>
              </h2>

              <div className="text-lg lg:text-xl text-gray-650 max-w-3xl mx-auto leading-relaxed mt-4">
                {"Whether you're selling products, offering services, or building an engaged community, Flowora automates your interactions to turn followers into loyal customers."
                  .split(" ")
                  .map((word, i) => (
                    <motion.span
                      key={i}
                      className="inline-block mr-1 text-gray-500"
                      variants={{
                        hidden: { opacity: 0, y: 10 },
                        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
                      }}
                    >
                      {word}
                    </motion.span>
                  ))}
              </div>
            </motion.div>
          </div>

          {/* Cards Grid */}
          <div className="grid md:grid-cols-2 gap-8 lg:gap-10">
            
            {/* Card 1: E-commerce Brands */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={{
                hidden: { opacity: 0, y: 50 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.7,
                    ease: "easeOut",
                    staggerChildren: 0.08
                  }
                }
              }}
              whileHover={{ y: -6, scale: 1.01, transition: { duration: 0.2 } }}
              className="bg-white rounded-3xl p-8 lg:p-10 border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:border-purple-100 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, scale: 0.8 },
                    visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 120 } }
                  }}
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 mb-6"
                >
                  <ShoppingCart className="w-6 h-6" />
                </motion.div>

                <motion.h3 
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } }
                  }}
                  className="text-2xl font-bold text-slate-900 mb-3"
                >
                  E-commerce Brands
                </motion.h3>

                <motion.p 
                  variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { duration: 0.5 } }
                  }}
                  className="text-gray-600 leading-relaxed mb-6"
                >
                  Convert comments directly into sales. Automatically handle pricing requests, product inquiries, and send instant checkout links inside DMs.
                </motion.p>

                {/* Key Benefits */}
                <div className="mb-8">
                  <motion.h4 
                    variants={{
                      hidden: { opacity: 0 },
                      visible: { opacity: 1 }
                    }}
                    className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4"
                  >
                    Key Benefits:
                  </motion.h4>
                  <ul className="grid grid-cols-2 gap-3">
                    {[
                      "Instant Product Link DMs",
                      "Automatic Discount Codes",
                      "Interactive Order Tracking",
                      "Cart Abandonment Recovery"
                    ].map((benefit, idx) => (
                      <motion.li
                        key={idx}
                        variants={{
                          hidden: { opacity: 0, x: -10 },
                          visible: { opacity: 1, x: 0, transition: { duration: 0.3 } }
                        }}
                        className="flex items-center gap-2 text-sm text-slate-700 font-medium"
                      >
                        <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span>{benefit}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Example block */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
                }}
                className="mt-auto bg-blue-50/40 rounded-2xl p-5 border border-blue-100/50 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block mb-2">Real-world Example:</span>
                <p className="text-sm italic text-slate-650 leading-relaxed">
                  "When a customer comments <strong className="text-blue-600 font-semibold">'how much?'</strong> on your product reel, Flowora immediately DMs them the checkout link and an exclusive 10% coupon code."
                </p>
              </motion.div>
            </motion.div>

            {/* Card 2: Coaches & Consultants */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={{
                hidden: { opacity: 0, y: 50 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.7,
                    ease: "easeOut",
                    staggerChildren: 0.08,
                    delay: 0.1
                  }
                }
              }}
              whileHover={{ y: -6, scale: 1.01, transition: { duration: 0.2 } }}
              className="bg-white rounded-3xl p-8 lg:p-10 border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:border-purple-100 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, scale: 0.8 },
                    visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 120 } }
                  }}
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20 mb-6"
                >
                  <GraduationCap className="w-6 h-6" />
                </motion.div>

                <motion.h3 
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } }
                  }}
                  className="text-2xl font-bold text-slate-900 mb-3"
                >
                  Coaches & Consultants
                </motion.h3>

                <motion.p 
                  variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { duration: 0.5 } }
                  }}
                  className="text-gray-600 leading-relaxed mb-6"
                >
                  Automate lead capture and qualification. Deliver resources, answer common questions, and book strategy sessions 24/7 on autopilot.
                </motion.p>

                {/* Key Benefits */}
                <div className="mb-8">
                  <motion.h4 
                    variants={{
                      hidden: { opacity: 0 },
                      visible: { opacity: 1 }
                    }}
                    className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4"
                  >
                    Key Benefits:
                  </motion.h4>
                  <ul className="grid grid-cols-2 gap-3">
                    {[
                      "Pre-qualifying Surveys",
                      "Direct Calendar Bookings",
                      "Free Resource Deliveries",
                      "Automated FAQ Responses"
                    ].map((benefit, idx) => (
                      <motion.li
                        key={idx}
                        variants={{
                          hidden: { opacity: 0, x: -10 },
                          visible: { opacity: 1, x: 0, transition: { duration: 0.3 } }
                        }}
                        className="flex items-center gap-2 text-sm text-slate-700 font-medium"
                      >
                        <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span>{benefit}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Example block */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
                }}
                className="mt-auto bg-purple-50/40 rounded-2xl p-5 border border-purple-100/50 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-purple-500" />
                <span className="text-xs font-bold text-purple-600 uppercase tracking-widest block mb-2">Real-world Example:</span>
                <p className="text-sm italic text-slate-650 leading-relaxed">
                  "When someone sends a DM saying <strong className="text-purple-600 font-semibold">'I want to book a session'</strong>, Flowora instantly replies with a brief intake questionnaire and your scheduler link."
                </p>
              </motion.div>
            </motion.div>

            {/* Card 3: Influencers & Creators */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={{
                hidden: { opacity: 0, y: 50 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.7,
                    ease: "easeOut",
                    staggerChildren: 0.08
                  }
                }
              }}
              whileHover={{ y: -6, scale: 1.01, transition: { duration: 0.2 } }}
              className="bg-white rounded-3xl p-8 lg:p-10 border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:border-purple-100 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, scale: 0.8 },
                    visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 120 } }
                  }}
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/20 mb-6"
                >
                  <Crown className="w-6 h-6" />
                </motion.div>

                <motion.h3 
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } }
                  }}
                  className="text-2xl font-bold text-slate-900 mb-3"
                >
                  Influencers & Creators
                </motion.h3>

                <motion.p 
                  variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { duration: 0.5 } }
                  }}
                  className="text-gray-600 leading-relaxed mb-6"
                >
                  Maximize engagement and brand partnership revenue. Automatically deliver affiliate links, YouTube videos, and newsletter links straight to DMs.
                </motion.p>

                {/* Key Benefits */}
                <div className="mb-8">
                  <motion.h4 
                    variants={{
                      hidden: { opacity: 0 },
                      visible: { opacity: 1 }
                    }}
                    className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4"
                  >
                    Key Benefits:
                  </motion.h4>
                  <ul className="grid grid-cols-2 gap-3">
                    {[
                      "Viral Reel Link Delivery",
                      "Newsletter Sign-up Prompts",
                      "Sponsor Click Tracking",
                      "Interactive Fan Greetings"
                    ].map((benefit, idx) => (
                      <motion.li
                        key={idx}
                        variants={{
                          hidden: { opacity: 0, x: -10 },
                          visible: { opacity: 1, x: 0, transition: { duration: 0.3 } }
                        }}
                        className="flex items-center gap-2 text-sm text-slate-700 font-medium"
                      >
                        <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span>{benefit}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Example block */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
                }}
                className="mt-auto bg-pink-50/40 rounded-2xl p-5 border border-pink-100/50 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-pink-500" />
                <span className="text-xs font-bold text-pink-600 uppercase tracking-widest block mb-2">Real-world Example:</span>
                <p className="text-sm italic text-slate-655 leading-relaxed">
                  "When fans comment <strong className="text-pink-600 font-semibold">'recap'</strong> or <strong className="text-pink-600 font-semibold">'link'</strong> on your viral reel, Flowora instantly DMs them the exact URL to your blog post or sponsored product."
                </p>
              </motion.div>
            </motion.div>

            {/* Card 4: Local Businesses */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={{
                hidden: { opacity: 0, y: 50 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.7,
                    ease: "easeOut",
                    staggerChildren: 0.08,
                    delay: 0.1
                  }
                }
              }}
              whileHover={{ y: -6, scale: 1.01, transition: { duration: 0.2 } }}
              className="bg-white rounded-3xl p-8 lg:p-10 border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:border-purple-100 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, scale: 0.8 },
                    visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 120 } }
                  }}
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-green-500/20 mb-6"
                >
                  <MapPin className="w-6 h-6" />
                </motion.div>

                <motion.h3 
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } }
                  }}
                  className="text-2xl font-bold text-slate-900 mb-3"
                >
                  Local Businesses
                </motion.h3>

                <motion.p 
                  variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { duration: 0.5 } }
                  }}
                  className="text-gray-600 leading-relaxed mb-6"
                >
                  Drive physical foot traffic and service bookings. Instantly answer questions about location, operational hours, and availability.
                </motion.p>

                {/* Key Benefits */}
                <div className="mb-8">
                  <motion.h4 
                    variants={{
                      hidden: { opacity: 0 },
                      visible: { opacity: 1 }
                    }}
                    className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4"
                  >
                    Key Benefits:
                  </motion.h4>
                  <ul className="grid grid-cols-2 gap-3">
                    {[
                      "Local Lead Capturing",
                      "Operational Hours FAQs",
                      "Service Quote Estimates",
                      "Direct Location Routing"
                    ].map((benefit, idx) => (
                      <motion.li
                        key={idx}
                        variants={{
                          hidden: { opacity: 0, x: -10 },
                          visible: { opacity: 1, x: 0, transition: { duration: 0.3 } }
                        }}
                        className="flex items-center gap-2 text-sm text-slate-700 font-medium"
                      >
                        <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span>{benefit}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Example block */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
                }}
                className="mt-auto bg-green-50/40 rounded-2xl p-5 border border-green-100/50 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
                <span className="text-xs font-bold text-green-600 uppercase tracking-widest block mb-2">Real-world Example:</span>
                <p className="text-sm italic text-slate-650 leading-relaxed">
                  "Automatically reply to a comment asking <strong className="text-green-600 font-semibold">'do you deliver to [area]?'</strong> with your operational service map, hours, and direct booking link."
                </p>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── INTERACTIVE DM FUNNEL SHOWCASE SECTION ── */}
      <section className="py-24 px-6 bg-slate-50/50 relative overflow-hidden border-t border-b border-gray-100">
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-300/10 to-purple-300/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-pink-300/10 to-indigo-300/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block px-3 py-1.5 rounded-full text-xs font-bold tracking-wider text-blue-600 bg-blue-50 border border-blue-100 uppercase mb-4"
            >
              Interactive Preview
            </motion.span>
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-none">
              Capture Leads & Deliver Products{" "}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent block mt-2">
                Completely on Autopilot
              </span>
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto mt-4 leading-relaxed">
              Watch how Flowora automates the entire funnel: from reels comments, to rich media links, lead segmentation, email collection, and instant discounts.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-16 items-center">
            
            {/* Left Column: Funnel Explanation Steps */}
            <div className="lg:col-span-6 space-y-6">
              {[
                {
                  step: 1,
                  title: "Send Rich Media Product Cards",
                  description: "Ditch plain text links. Deliver gorgeous product cards complete with high-res photos and direct shop buttons inside DMs.",
                  color: "from-blue-500 to-cyan-500",
                  activeRange: [1, 2],
                },
                {
                  step: 2,
                  title: "Tag & Segment Leads Automatically",
                  description: "Automatically segment prospects into follow-up marketing tags (like 'Hot Leads') based on comment context and clicks.",
                  color: "from-amber-500 to-orange-600",
                  activeRange: [3],
                },
                {
                  step: 3,
                  title: "Collect Verified Emails Natively",
                  description: "Prompt users for their contact info directly in DMs. Validate inputs and automatically sync them to your newsletter CRM.",
                  color: "from-purple-500 to-pink-600",
                  activeRange: [4, 5],
                },
                {
                  step: 4,
                  title: "Deliver Instant Promo Codes",
                  description: "Automatically issue custom checkout discounts or coupons to reward users and instantly boost your shop conversions.",
                  color: "from-emerald-500 to-green-600",
                  activeRange: [6, 7],
                }
              ].map((item, idx) => {
                const isActive = item.activeRange.includes(mockupStep);
                return (
                  <motion.div
                    key={idx}
                    animate={{
                      scale: isActive ? 1.02 : 0.98,
                      opacity: isActive ? 1 : 0.6,
                    }}
                    transition={{ duration: 0.3 }}
                    className={`p-6 rounded-2xl border transition-all ${
                      isActive 
                        ? "bg-white border-purple-100 shadow-[0_10px_30px_rgba(109,40,217,0.05)]" 
                        : "bg-transparent border-transparent"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white font-extrabold text-sm shadow-md`}>
                        {item.step}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-900 mb-1">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-500 font-semibold leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Right Column: High Fidelity DM Mockup Phone */}
            <div className="lg:col-span-6 flex justify-center relative">
              <div className="relative w-full max-w-[340px] mx-auto aspect-[9/18.5] bg-slate-950 rounded-[45px] p-2.5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] border-[4px] border-slate-800 ring-1 ring-white/10">
                {/* Left Side Buttons */}
                <div className="absolute -left-[3px] top-24 w-[3px] h-6 bg-slate-800 rounded-l" />
                <div className="absolute -left-[3px] top-36 w-[3px] h-10 bg-slate-800 rounded-l" />
                <div className="absolute -left-[3px] top-48 w-[3px] h-10 bg-slate-800 rounded-l" />
                {/* Right Power Button */}
                <div className="absolute -right-[3px] top-36 w-[3px] h-14 bg-slate-800 rounded-r" />
                
                {/* Screen Container */}
                <div className="relative w-full h-full bg-white rounded-[38px] overflow-hidden flex flex-col justify-between select-none">
                  
                  {/* Dynamic Island Notch */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-30 flex items-center justify-end px-3">
                    <div className="w-1.5 h-1.5 bg-slate-900 rounded-full" />
                  </div>

                  {/* Status Bar */}
                  <div className="h-9 px-6 pt-2 flex items-center justify-between text-black text-[9px] font-bold z-20">
                    <span>9:41</span>
                    <div className="flex items-center gap-1">
                      <svg className="w-2.5 h-2.5 text-black" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M2 11.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"/>
                      </svg>
                      <div className="w-4.5 h-2.5 border border-black rounded-sm p-0.5 flex items-center">
                        <div className="w-full h-full bg-black rounded-2xs" />
                      </div>
                    </div>
                  </div>

                  {/* Chat Header */}
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 z-10 bg-white/95 backdrop-blur">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                        <img src="/creator_indian_1.png" alt="Profile" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-[12px] text-gray-900 flex items-center gap-1">
                          My IG Page
                          <span className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center text-[7px] text-white flex-shrink-0">✓</span>
                        </h4>
                        <p className="text-[8px] text-green-500 font-semibold mt-0.2">Active Auto-flow</p>
                      </div>
                    </div>
                    <Video className="w-4 h-4 text-gray-700 cursor-pointer" />
                  </div>

                  {/* Chat Message Box Area */}
                  <div className="flex-1 px-3 py-3 overflow-y-auto space-y-3 scrollbar-none flex flex-col justify-end bg-slate-50/40">
                    <AnimatePresence>
                      {/* Bubble 1: Link Deliver */}
                      {mockupStep >= 1 && (
                        <motion.div
                          initial={{ opacity: 0, y: 15, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, transition: { duration: 0.2 } }}
                          transition={{ type: "spring", stiffness: 120 }}
                          className="bg-gray-100 rounded-2xl rounded-tl-none p-3 max-w-[85%] text-[10.5px] font-semibold text-gray-800 shadow-sm"
                        >
                          Hi there! Here is the link you requested 👇
                        </motion.div>
                      )}

                      {/* Product Card */}
                      {mockupStep >= 2 && (
                        <motion.div
                          initial={{ opacity: 0, y: 15, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, transition: { duration: 0.2 } }}
                          transition={{ type: "spring", stiffness: 120, delay: 0.1 }}
                          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden max-w-[80%] flex flex-col"
                        >
                          <div className="aspect-[4/3] w-full bg-slate-100 overflow-hidden relative">
                            <img 
                              src="/mockup_product_apparel.png" 
                              alt="Product Drop" 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                          <div className="p-3">
                            <h5 className="font-extrabold text-[12px] text-gray-900 leading-tight">Summer Drop '26</h5>
                            <p className="text-[9px] text-gray-400 font-semibold mt-0.5">Exclusive Early Access</p>
                            <button className="mt-2.5 w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[10px] py-1.5 rounded-lg shadow-sm">
                              Shop Now
                            </button>
                          </div>
                        </motion.div>
                      )}

                      {/* Badge 1: Lead Tagged */}
                      {mockupStep >= 3 && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, transition: { duration: 0.2 } }}
                          className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-100 rounded-full w-fit mx-auto text-[9px] text-amber-700 font-bold shadow-xs"
                        >
                          <Tag className="w-3 h-3 text-amber-500" />
                          <span>Added to sequence: <strong>Hot Leads 🔥</strong></span>
                        </motion.div>
                      )}

                      {/* Bubble 2: Email request */}
                      {mockupStep >= 4 && (
                        <motion.div
                          initial={{ opacity: 0, y: 15, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, transition: { duration: 0.2 } }}
                          transition={{ type: "spring", stiffness: 120 }}
                          className="bg-gray-100 rounded-2xl rounded-tl-none p-3 max-w-[85%] text-[10.5px] font-semibold text-gray-800 shadow-sm"
                        >
                          Share your email to get an extra 10% OFF! 🎁
                        </motion.div>
                      )}

                      {/* User response: email */}
                      {mockupStep >= 5 && (
                        <motion.div
                          initial={{ opacity: 0, x: 20, scale: 0.95 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          exit={{ opacity: 0, transition: { duration: 0.2 } }}
                          className="bg-blue-600 text-white rounded-2xl rounded-tr-none p-3 max-w-[85%] text-[10.5px] font-semibold ml-auto shadow-md"
                        >
                          alex@example.com
                        </motion.div>
                      )}

                      {/* Badge 2: Email Collected */}
                      {mockupStep >= 6 && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, transition: { duration: 0.2 } }}
                          className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full w-fit mx-auto text-[9px] text-blue-700 font-bold shadow-xs"
                        >
                          <Mail className="w-3 h-3 text-blue-500" />
                          <span>Email Collected: <strong>Email List ✅</strong></span>
                        </motion.div>
                      )}

                      {/* Bubble 3: Coupon Sent */}
                      {mockupStep >= 7 && (
                        <motion.div
                          initial={{ opacity: 0, y: 15, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, transition: { duration: 0.2 } }}
                          transition={{ type: "spring", stiffness: 120 }}
                          className="bg-blue-50 border border-blue-100 rounded-2xl rounded-tl-none p-3 max-w-[85%] text-[10.5px] font-bold text-blue-700 shadow-sm"
                        >
                          Awesome! Here is your code: <strong className="text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded ml-1 font-mono">WELCOME10</strong> 🎟️
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Chat Footer Mock */}
                  <div className="border-t border-gray-100 px-3 py-2 bg-white flex items-center justify-between">
                    <div className="flex-1 bg-gray-50 border border-gray-100 rounded-full h-8 px-3 flex items-center justify-between text-gray-400 text-[10.5px] font-semibold">
                      <span>Message...</span>
                      <Image className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-650" />
                    </div>
                    <svg className="w-5 h-5 text-gray-500 hover:text-red-500 cursor-pointer ml-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>

                  {/* Home Indicator Bar */}
                  <div className="h-5 flex items-center justify-center bg-white">
                    <div className="w-32 h-1 bg-gray-800 rounded-full" />
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS SECTION ── */}
      <section id="how-it-works" className="py-20 px-6 relative overflow-hidden bg-gray-50/50">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50/30" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
              Get Started in 3 Simple Steps
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Set up your Instagram automation in minutes, not hours. No coding or technical skills required.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {rs.map((step, i) => (
              <div key={i} className="relative">
                <motion.div
                  initial={{ opacity: 0, y: 40, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                  whileHover={{ y: -8 }}
                  className="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-lg h-full border border-white/50 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-md text-white">
                        <step.icon className="w-7 h-7" />
                      </div>
                      <span className="text-5xl font-black text-transparent bg-gradient-to-br from-blue-200 to-purple-200 bg-clip-text">
                        {step.step}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed font-semibold">
                      {step.description}
                    </p>
                  </div>
                </motion.div>

                {/* Connecting lines for desktop */}
                {i < rs.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-purple-400 to-blue-400 z-20 pointer-events-none" />
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── TESTIMONIALS REVIEWS ── */}
      <section id="testimonials" className="py-20 px-6 bg-white relative overflow-hidden">
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-200/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16 space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200/50 text-yellow-700 px-5 py-2.5 rounded-full shadow-sm"
            >
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-semibold">4.9/5 from 2,000+ Reviews</span>
            </motion.div>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
              Loved by Creators Worldwide
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Don't just take our word for it—see what successful creators are saying about Flowora.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {_d.map((review, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                whileHover={{ y: -4, scale: 1.01 }}
                className="bg-gradient-to-br from-white to-gray-50/50 border border-gray-200 rounded-3xl p-8 hover:shadow-xl transition-all relative group flex flex-col justify-between"
              >
                {/* Decorative background quote icon */}
                <div className="absolute top-6 right-6 pointer-events-none opacity-10 group-hover:opacity-20 transition-opacity">
                  <Quote className="w-16 h-16 text-purple-600" />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-0.5">
                    {[...Array(review.rating)].map((_, a) => (
                      <Star key={a} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 leading-relaxed font-semibold italic text-base relative z-10 pr-6">
                    "{review.text}"
                  </p>
                </div>

                <div className="flex items-center gap-4 mt-8 border-t border-gray-100 pt-4">
                  {review.avatarImage ? (
                    <img 
                      src={review.avatarImage} 
                      alt={review.name} 
                      className="w-12 h-12 rounded-full object-cover shadow-md border border-gray-200" 
                    />
                  ) : (
                    <div
                      className="w-12 h-12 rounded-full shadow-md flex items-center justify-center font-bold text-white text-xs"
                      style={{
                        background: `linear-gradient(135deg, hsl(${review.avatar * 90}, 75%, 65%), hsl(${review.avatar * 90 + 40}, 75%, 55%))`
                      }}
                    >
                      {review.name.split(" ").map(w => w[0]).join("")}
                    </div>
                  )}
                  <div>
                    <h4 className="font-extrabold text-gray-900 text-sm leading-snug">{review.name}</h4>
                    <p className="text-xs text-gray-400 font-bold leading-none mt-1">
                      {review.role} • {review.followers} followers
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ── PRICING SECTION ── */}
      <section id="pricing" className="py-20 px-6 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-200/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16 space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 200 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/50 text-purple-600 px-5 py-2.5 rounded-full shadow-sm"
            >
              <Crown className="w-4 h-4 text-purple-500 fill-purple-100" />
              <span className="text-sm font-semibold">Simple, transparent pricing</span>
            </motion.div>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900">
              Choose Your{" "}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Perfect Plan
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Start with a 14-day free trial. No credit card required. Cancel anytime.
            </p>

            {/* Currency Toggle */}
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setPricingCurrency("INR")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${pricingCurrency === "INR" ? "bg-purple-600 text-white shadow-sm" : "bg-gray-100 text-gray-500 hover:text-gray-700"}`}
              >
                ₹ INR
              </button>
              <button
                onClick={() => setPricingCurrency("USD")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${pricingCurrency === "USD" ? "bg-purple-600 text-white shadow-sm" : "bg-gray-100 text-gray-500 hover:text-gray-700"}`}
              >
                $ USD
              </button>
            </div>

            {/* Monthly / Yearly Toggle */}
            <div className="flex items-center justify-center gap-3 pt-4">
              <span className={`text-xs font-bold ${billingCycle === "monthly" ? "text-slate-950" : "text-gray-400"}`}>Monthly</span>
              <button
                onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
                className="w-12 h-6.5 bg-purple-600 rounded-full p-1 transition-colors relative cursor-pointer flex items-center"
              >
                <motion.div
                  className="w-4.5 h-4.5 bg-white rounded-full"
                  animate={{ x: billingCycle === "yearly" ? 22 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
              <span className={`text-xs font-bold flex items-center gap-1.5 ${billingCycle === "yearly" ? "text-purple-600" : "text-gray-400"}`}>
                Yearly
                <span className="bg-green-100 border border-green-200 text-green-700 font-extrabold text-[9px] px-2 py-0.5 rounded-full">
                  Save {pricingCurrency === "INR" ? "20%" : "17%"}
                </span>
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {Ud.map((plan, i) => {
              // Calculate pricing based on currency and billing cycle
              const price = plan.name === "Free" ? 0 :
                pricingCurrency === "INR"
                  ? (billingCycle === "yearly" ? plan.priceINR : plan.monthlyINR)
                  : (billingCycle === "yearly" ? plan.priceUSD : plan.monthlyUSD);
              const currencySymbol = pricingCurrency === "INR" ? "₹" : "$";
              const annualTotal = plan.name === "Free" ? 0 :
                pricingCurrency === "INR" ? (plan.priceINR! * 12) : (plan.priceUSD! * 12);
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className={`relative bg-white rounded-3xl p-8 shadow-xl border-2 transition-all flex flex-col justify-between min-h-[500px] ${
                    plan.popular ? "border-purple-600 shadow-purple-500/10" : "border-gray-200/80 hover:border-gray-300"
                  }`}
                >
                  {plan.popular && (
                    <motion.div
                      initial={{ scale: 0, rotate: -12 }}
                      whileInView={{ scale: 1, rotate: -12 }}
                      viewport={{ once: true }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.4 }}
                      className="absolute -top-4 -right-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full font-bold text-sm shadow-md flex items-center gap-1.5 z-10"
                    >
                      <Crown className="w-4 h-4 fill-white text-white" />
                      Most Popular
                    </motion.div>
                  )}

                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center text-white text-xl font-bold shadow-md`}>
                        {plan.name[0]}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900">{plan.name}</h3>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{plan.description}</p>
                      </div>
                    </div>

                    <div className="flex items-baseline gap-1 pt-2">
                      <span className="text-5xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        {plan.name === "Free" ? "Free" : `${currencySymbol}${price}`}
                      </span>
                      {plan.name !== "Free" && <span className="text-xs font-bold text-gray-400">/ month</span>}
                    </div>
                    {plan.name !== "Free" && billingCycle === "yearly" && (
                      <p className="text-[11px] text-gray-400 font-medium mt-1">
                        Billed as {currencySymbol}{annualTotal.toLocaleString()} per year
                      </p>
                    )}

                    <hr className="border-gray-100" />

                    <ul className="space-y-3.5 text-xs text-gray-600 font-semibold">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-2.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link to="/login" className="block pt-8 mt-auto">
                    <Button 
                      className={`w-full rounded-full h-12 text-xs font-extrabold transition-all cursor-pointer ${
                        plan.popular
                          ? "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:opacity-90 text-white shadow-md shadow-purple-500/20"
                          : "bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200"
                      }`}
                    >
                      Start Free Trial
                    </Button>
                  </Link>
                </motion.div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── FAQ SECTION ── */}
      <section id="faq" className="py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50/50 pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-purple-300/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg text-white">
              <HelpCircle className="w-7 h-7" />
            </div>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900">Frequently Asked Questions</h2>
            <p className="text-lg text-gray-600">Got questions? We've got answers. Can't find what you're looking for? Contact our support team.</p>
          </div>

          <div className="space-y-4">
            {Hd.map((item, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  className="bg-white/95 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full px-8 py-5.5 flex items-center justify-between text-left hover:bg-purple-50/20 transition-colors cursor-pointer select-none font-bold text-slate-900"
                  >
                    <span className="text-base sm:text-lg pr-4">{item.question}</span>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex-shrink-0"
                    >
                      <ChevronDown className="w-5 h-5 text-purple-600" />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-8 pb-6 text-sm text-gray-500 font-semibold leading-relaxed border-t border-gray-50/50 pt-3">
                          {item.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── WHY FLOWORA vs. MANUAL WORK ── */}
      <section className="py-20 px-6 bg-white relative overflow-hidden">
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-emerald-200/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-14 space-y-4">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
              Stop Wasting Hours on{" "}
              <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent line-through decoration-red-300">
                Manual Work
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              See how Flowora transforms your Instagram workflow from exhausting to effortless.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Without Flowora */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="rounded-3xl border-2 border-red-100 bg-gradient-to-br from-red-50/50 to-white p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                  <X className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">Without Flowora</h3>
              </div>
              <ul className="space-y-3.5">
                {[
                  "3+ hours daily replying to DMs manually",
                  "Missed comments = missed revenue",
                  "No lead capture from engagement",
                  "Can't scale beyond personal effort",
                  "Followers leave without converting",
                  "Zero analytics on DM performance",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm font-medium text-gray-600">
                    <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <X className="w-3 h-3 text-red-500" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* With Flowora */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="rounded-3xl border-2 border-emerald-100 bg-gradient-to-br from-emerald-50/50 to-white p-8 shadow-lg shadow-emerald-100/50"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Check className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">With Flowora</h3>
              </div>
              <ul className="space-y-3.5">
                {[
                  "100% automated replies 24/7 in seconds",
                  "Every comment triggers a personalized DM",
                  "Capture emails & phone numbers on autopilot",
                  "Scale to unlimited followers effortlessly",
                  "Convert followers into buyers instantly",
                  "Full analytics: open rates, clicks, revenue",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm font-medium text-gray-700">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-emerald-600" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Results highlight */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-10 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white text-center shadow-xl"
          >
            <p className="text-sm font-bold text-emerald-100 uppercase tracking-widest mb-2">Average Results After 30 Days</p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-3xl font-black">300%</p>
                <p className="text-xs font-semibold text-emerald-200">More Engagement</p>
              </div>
              <div>
                <p className="text-3xl font-black">5x</p>
                <p className="text-xs font-semibold text-emerald-200">More Leads Captured</p>
              </div>
              <div>
                <p className="text-3xl font-black">10hrs</p>
                <p className="text-xs font-semibold text-emerald-200">Saved Per Week</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── LIMITED TIME CTA PANEL ── */}
      <section className="py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600" />
        
        {/* Floating background particles */}
        <FloatingParticles />

        {/* Decorative blur blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white/10 backdrop-blur-2xl rounded-3xl p-12 md:p-16 border border-white/20 shadow-2xl text-center text-white space-y-6"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-8 h-8 text-yellow-300 fill-yellow-300" />
              </motion.div>
              <span className="text-white/90 font-semibold tracking-wider text-sm">Limited Time Offer</span>
            </div>

            <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight max-w-3xl mx-auto">
              Ready to 10x Your Instagram Growth?
            </h2>
            
            <p className="text-base sm:text-lg text-white/95 max-w-xl mx-auto leading-relaxed font-semibold">
              Join 60,000+ creators who are already automating their Instagram engagement and converting followers into customers on autopilot.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/login" className="w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.04, boxShadow: "0 20px 40px rgba(255,255,255,0.25)" }}
                  whileTap={{ scale: 0.96 }}
                  className="w-full sm:w-auto bg-white text-purple-600 px-10 py-4.5 rounded-full font-extrabold text-base shadow-xl flex items-center justify-center gap-2 cursor-pointer"
                >
                  Start Your Free Trial
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="w-5 h-5 text-purple-600" />
                  </motion.div>
                </motion.button>
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-[11px] font-bold text-white/80 uppercase tracking-widest pt-2">
              <span>Setup in 5 minutes</span>
              <span>•</span>
              <span>Cancel anytime</span>
              <span>•</span>
              <span>14 Days Free!</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── TRUST FOOTER STRIP ── */}
      <section className="relative overflow-hidden bg-[#121d2c] px-6 py-10">
        <div className="absolute inset-x-0 top-0 h-px bg-white/8" />
        <div className="absolute -left-20 top-1/2 h-52 w-52 -translate-y-1/2 rounded-full bg-purple-500/18 blur-3xl" />
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-center gap-6 sm:flex-row sm:gap-12">
          {[
            { label: "Meta Verified Partner", color: "text-blue-400" },
            { label: "GDPR Compliant", color: "text-emerald-400" },
            { label: "SSL Encrypted", color: "text-yellow-400" },
            { label: "7-Day Money-Back", color: "text-pink-400" },
          ].map((badge, index) => (
            <motion.div
              key={badge.label}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.1 }}
              className="inline-flex items-center gap-3 text-lg font-medium text-white"
            >
              <ShieldCheck className={`h-6 w-6 ${badge.color}`} />
              {badge.label}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Embedded CSS animation for text shine effect */}
      <style>{`
        @keyframes shine {
          to { background-position: 200% center; }
        }
        .animate-shine {
          animation: shine 4s linear infinite;
        }
      `}</style>
    </PageLayout>
  );
}
