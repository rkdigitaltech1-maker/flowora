import { Link } from "react-router-dom";
import { useState } from "react";
import { PageLayout } from "@/components/PageLayout.tsx";
import { motion } from "motion/react";
import {
  ArrowRight, DollarSign, Users, TrendingUp, Gift, Clock,
  CheckCircle2, ChevronDown, ChevronUp, Repeat, CreditCard,
  Globe, Video, Camera, Mail, Share2, Shield, Zap,
  Percent, Calendar, Award, BarChart3, Wallet, FileText
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";


const benefits = [
  {
    icon: Percent,
    title: "25% Recurring Commission",
    description: "Earn a flat 25% commission on all referrals, including recurring subscriptions for the first 11 months.",
    gradient: "from-violet-500 to-purple-600"
  },
  {
    icon: Repeat,
    title: "11 Months of Passive Income",
    description: "Get paid every month your referral stays subscribed. That's up to 11 months of recurring revenue per customer.",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    icon: Clock,
    title: "30-Day Cookie Window",
    description: "Your referral link stays active for 30 days. If someone signs up within that window, you get credited.",
    gradient: "from-emerald-500 to-green-600"
  },
  {
    icon: Wallet,
    title: "Multiple Payment Options",
    description: "We pay via UPI, PayPal, or bank transfer. Choose what works best for you, payments processed monthly.",
    gradient: "from-orange-500 to-amber-500"
  },
  {
    icon: BarChart3,
    title: "Real-Time Dashboard",
    description: "Track clicks, signups, conversions, and earnings in real-time with your personalized affiliate dashboard.",
    gradient: "from-pink-500 to-rose-500"
  },
  {
    icon: FileText,
    title: "Marketing Materials",
    description: "Access ready-made banners, email templates, social posts, and video scripts to promote effectively.",
    gradient: "from-indigo-500 to-blue-600"
  }
];


const howItWorks = [
  {
    step: "01",
    title: "Sign Up & Get Approved",
    description: "Fill out a quick application form. Once approved, you'll get your unique affiliate link and access to your dashboard.",
    icon: Award
  },
  {
    step: "02",
    title: "Share Your Unique Link",
    description: "Promote Flowora on social media, email, blogs, YouTube, or any channel. Use your custom link or affiliate code.",
    icon: Share2
  },
  {
    step: "03",
    title: "Earn Commission on Every Sale",
    description: "When someone signs up through your link and subscribes, you earn 25% of their subscription — every month for 11 months.",
    icon: DollarSign
  },
  {
    step: "04",
    title: "Get Paid Monthly",
    description: "Track your earnings in real-time and withdraw via UPI, PayPal, or bank transfer once you hit the minimum threshold.",
    icon: CreditCard
  }
];


const earningsExamples = [
  { referrals: 5, plan: "Pro Monthly (₹499)", monthly: "₹624", annual: "₹6,864" },
  { referrals: 15, plan: "Pro Monthly (₹499)", monthly: "₹1,873", annual: "₹20,603" },
  { referrals: 50, plan: "Pro Monthly (₹499)", monthly: "₹6,238", annual: "₹68,618" },
  { referrals: 100, plan: "Pro Monthly (₹499)", monthly: "₹12,475", annual: "₹1,37,225" },
];

const faqs = [
  {
    question: "How do I get paid?",
    answer: "We pay via UPI, PayPal, or bank transfer. Payments are processed monthly once your balance reaches the minimum payout threshold of ₹500. You can choose your preferred payment method in your affiliate dashboard."
  },
  {
    question: "What is the commission structure?",
    answer: "You earn a flat 25% commission on all referrals, including recurring subscriptions for the first 11 months. This means if someone you refer stays subscribed, you earn commission on every payment they make for 11 consecutive months."
  },
  {
    question: "Can I promote on social media?",
    answer: "Yes! We encourage promotion on all channels including social media, email, blogs, and YouTube. You'll get access to ready-made content for each platform including banners, post templates, email swipes, and video scripts."
  },
  {
    question: "How long does the cookie last?",
    answer: "Our tracking cookie lasts for 30 days. If someone clicks your link and signs up within 30 days, you'll receive credit for that referral even if they don't sign up immediately."
  },
  {
    question: "Is there a minimum payout threshold?",
    answer: "Yes, the minimum payout amount is ₹500 (or $10 USD). Once your pending balance reaches this threshold, you can request a payout which will be processed in the next payment cycle."
  },
  {
    question: "Can I refer myself or use fake accounts?",
    answer: "No. Self-referrals and fraudulent signups are strictly prohibited and will result in immediate account termination. We monitor all referrals for suspicious activity to maintain program integrity."
  },
  {
    question: "Do I need to be a Flowora customer to be an affiliate?",
    answer: "While not mandatory, we recommend being a Flowora user so you can authentically share your experience. Active users typically earn 3x more because they can provide genuine testimonials and use cases."
  },
  {
    question: "When do I start earning after someone signs up?",
    answer: "You start earning as soon as your referred user makes their first paid subscription payment. Commissions are tracked in real-time and you can see them instantly in your dashboard."
  }
];


const promotionChannels = [
  { icon: Camera, label: "Instagram", color: "text-pink-500" },
  { icon: Video, label: "YouTube", color: "text-red-500" },
  { icon: Mail, label: "Email", color: "text-blue-500" },
  { icon: Globe, label: "Blog/Website", color: "text-emerald-500" },
];

function FAQItem({ question, answer, isOpen, onToggle }: {
  question: string; answer: string; isOpen: boolean; onToggle: () => void;
}) {
  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden transition-all hover:border-purple-200 hover:shadow-sm">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 md:p-6 text-left cursor-pointer"
      >
        <span className="font-bold text-slate-800 text-sm md:text-base pr-4">{question}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-purple-500 shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="px-5 md:px-6 pb-5 md:pb-6 -mt-1">
          <p className="text-gray-600 text-sm leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}


export default function AffiliatePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <PageLayout>
      {/* ── HERO SECTION ── */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-purple-50" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl" />

        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full mb-6"
          >
            <Gift className="w-4 h-4" />
            <span className="text-sm font-bold">Affiliate Program</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight mb-6"
          >
            Earn{" "}
            <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              25% Commission
            </span>
            <br />
            <span className="text-slate-800">Every Month, For 11 Months</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Join our affiliate program and earn recurring commissions for every
            customer you refer. Share your unique link, and get paid when they subscribe.
          </motion.p>


          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/affiliate/apply">
              <Button className="rounded-full bg-gradient-to-r from-violet-600 to-purple-600 hover:opacity-90 text-white px-8 py-6 text-base font-bold shadow-xl shadow-purple-500/20 cursor-pointer">
                Join the Program
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="outline" className="rounded-full px-8 py-6 text-base font-bold border-2 cursor-pointer">
                Learn How It Works
              </Button>
            </a>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
          >
            {[
              { value: "25%", label: "Commission Rate", icon: Percent },
              { value: "11", label: "Months Recurring", icon: Calendar },
              { value: "30", label: "Day Cookie Window", icon: Clock },
              { value: "₹500", label: "Min. Payout", icon: Wallet },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <stat.icon className="w-5 h-5 text-purple-500 mb-2" />
                <p className="text-2xl md:text-3xl font-black text-slate-900">{stat.value}</p>
                <p className="text-xs text-gray-500 font-medium mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>


      {/* ── BENEFITS SECTION ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-bold mb-4">
              <Zap className="w-3.5 h-3.5" /> WHY JOIN
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">
              Why Creators <span className="text-purple-600">Love</span> Our Program
            </h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              Everything you need to earn passive income by recommending the tool you already love.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="group relative bg-gray-50 hover:bg-white border border-gray-100 hover:border-purple-200 rounded-2xl p-6 transition-all hover:shadow-lg hover:shadow-purple-100/50"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${b.gradient} flex items-center justify-center mb-4`}>
                  <b.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-2">{b.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{b.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-20 px-6 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-bold mb-4">
              <TrendingUp className="w-3.5 h-3.5" /> HOW IT WORKS
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">
              Start Earning in <span className="text-blue-600">4 Simple Steps</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.15 }}
                className="relative bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
              >
                <div className="text-5xl font-black text-purple-100 mb-3">{item.step}</div>
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mb-3">
                  <item.icon className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="font-bold text-slate-800 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
                {i < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-6">
                    <ArrowRight className="w-5 h-5 text-purple-300" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* ── EARNINGS CALCULATOR ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-xs font-bold mb-4">
              <DollarSign className="w-3.5 h-3.5" /> EARNINGS POTENTIAL
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">
              See How Much You Can <span className="text-amber-600">Earn</span>
            </h2>
            <p className="text-gray-500 mt-3 max-w-lg mx-auto">
              Based on 25% commission rate on Pro plan subscriptions (₹499/month) over 11 months.
            </p>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl">
            <div className="grid grid-cols-4 gap-4 text-center mb-4">
              <div className="text-xs font-bold text-slate-400 uppercase">Referrals</div>
              <div className="text-xs font-bold text-slate-400 uppercase">Plan</div>
              <div className="text-xs font-bold text-slate-400 uppercase">Monthly</div>
              <div className="text-xs font-bold text-slate-400 uppercase">11-Month Total</div>
            </div>
            {earningsExamples.map((row, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                className="grid grid-cols-4 gap-4 text-center py-4 border-t border-slate-700/50"
              >
                <div className="text-white font-bold">{row.referrals}</div>
                <div className="text-slate-300 text-xs md:text-sm">{row.plan}</div>
                <div className="text-emerald-400 font-bold">{row.monthly}</div>
                <div className="text-amber-400 font-black text-lg">{row.annual}</div>
              </motion.div>
            ))}
            <div className="mt-6 p-4 bg-purple-600/20 rounded-xl border border-purple-500/30 text-center">
              <p className="text-purple-200 text-sm font-medium">
                <span className="text-white font-bold">Top affiliates</span> earn over ₹1,00,000/month
                by referring just 100 active users
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* ── PROMOTION CHANNELS ── */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 bg-pink-50 text-pink-700 px-3 py-1.5 rounded-full text-xs font-bold mb-4">
            <Globe className="w-3.5 h-3.5" /> PROMOTE ANYWHERE
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
            Promote on <span className="text-pink-600">Any Channel</span>
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto mb-10">
            We encourage promotion on all channels. You'll get access to ready-made content for each platform.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {promotionChannels.map((ch) => (
              <div key={ch.label} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <ch.icon className={`w-8 h-8 mx-auto mb-3 ${ch.color}`} />
                <p className="font-bold text-slate-800 text-sm">{ch.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 grid md:grid-cols-3 gap-4">
            {[
              { title: "Banner Ads", desc: "High-converting banners in multiple sizes" },
              { title: "Email Swipes", desc: "Ready-to-send email templates" },
              { title: "Video Scripts", desc: "YouTube & Reels scripts that convert" },
            ].map((mat) => (
              <div key={mat.title} className="bg-white rounded-xl p-5 border border-gray-100 text-left">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 mb-2" />
                <h4 className="font-bold text-slate-800 text-sm">{mat.title}</h4>
                <p className="text-gray-500 text-xs mt-1">{mat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ── FAQ SECTION ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-[1fr_1.5fr] gap-12 items-start">
            <div>
              <span className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-xs font-bold mb-4">
                FAQS
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900">
                All Questions{" "}
                <span className="text-blue-600">Answered</span>
              </h2>
              <p className="text-gray-500 mt-3 text-sm">
                Everything you need to know about our affiliate program.
              </p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <FAQItem
                  key={i}
                  question={faq.question}
                  answer={faq.answer}
                  isOpen={openFaq === i}
                  onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* ── CTA SECTION ── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 rounded-3xl p-10 md:p-16 text-center overflow-hidden">
            {/* Decorative */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full mb-6">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-medium">Free to join · No hidden fees</span>
              </div>

              <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
                Ready to Start Earning?
              </h2>
              <p className="text-white/80 max-w-lg mx-auto mb-8 text-lg">
                Join 500+ affiliates already earning recurring commissions with Flowora.
                It takes less than 2 minutes to get started.
              </p>

              <Link to="/affiliate/apply">
                <Button className="rounded-full bg-white text-purple-700 hover:bg-gray-100 px-10 py-6 text-base font-bold shadow-2xl cursor-pointer">
                  Apply Now — It's Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>

              <p className="text-white/50 text-xs mt-4">
                Applications reviewed within 24 hours
              </p>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
