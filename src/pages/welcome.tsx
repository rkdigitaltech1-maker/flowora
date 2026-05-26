import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth.ts";
import { motion } from "motion/react";
import { Sparkles, ArrowRight, MessageSquare, Users, Zap, ShoppingCart, TrendingUp, Shield } from "lucide-react";

export default function WelcomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const firstName = user?.profile?.name?.split(" ")[0] || user?.profile?.email?.split("@")[0] || "Creator";
  const avatarUrl = user?.profile?.photoURL;

  const handleGetStarted = () => {
    navigate("/onboarding", { replace: true });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f8f6ff] via-white to-[#f0f7ff] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-gradient-to-br from-violet-200/20 to-indigo-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-gradient-to-tr from-pink-200/15 to-purple-200/15 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Main Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-[28px] shadow-[0_20px_60px_rgba(109,72,255,0.08)] border border-white/60 p-8 sm:p-10 text-center relative overflow-hidden">
          {/* Subtle gradient border effect */}
          <div className="absolute inset-0 rounded-[28px] border border-gradient-to-br from-violet-200/30 to-pink-200/30 pointer-events-none" />

          {/* Flowora Logo */}
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex items-center justify-center gap-2 mb-6"
          >
            <img src="/logo.png" alt="Flowora" className="h-7 w-auto object-contain" />
          </motion.div>

          {/* Avatar + Greeting */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="space-y-4 mb-7"
          >
            {avatarUrl && (
              <div className="mx-auto w-16 h-16 rounded-full overflow-hidden ring-3 ring-violet-100 shadow-lg">
                <img src={avatarUrl} alt={firstName} className="w-full h-full object-cover" />
              </div>
            )}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Hey, {firstName}! <span className="inline-block animate-bounce">👋</span>
              </h1>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed max-w-xs mx-auto font-medium">
                Welcome to Flowora. Let's set up your Instagram automation in under 2 minutes.
              </p>
            </div>
          </motion.div>

          {/* What you'll unlock */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5 }}
            className="space-y-2.5 mb-8"
          >
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">What you'll unlock</p>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { icon: MessageSquare, label: "Auto-DM replies", color: "from-violet-500 to-indigo-500" },
                { icon: Users, label: "Lead capture", color: "from-emerald-500 to-teal-500" },
                { icon: TrendingUp, label: "Growth analytics", color: "from-blue-500 to-cyan-500" },
                { icon: ShoppingCart, label: "Product storefront", color: "from-orange-500 to-rose-500" },
              ].map(({ icon: Icon, label, color }) => (
                <div key={label} className="flex items-center gap-2.5 bg-slate-50/80 rounded-xl p-2.5 border border-slate-100/80">
                  <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center shrink-0`}>
                    <Icon className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-700 leading-tight">{label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <button
              onClick={handleGetStarted}
              className="w-full h-13 rounded-2xl bg-gradient-to-r from-[#6d48ff] to-[#9b59ff] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20 hover:shadow-xl hover:shadow-violet-500/30 hover:from-[#5a38e0] hover:to-[#8b49ef] hover:scale-[1.02] transition-all duration-200 cursor-pointer"
            >
              Get Started
              <ArrowRight className="w-4.5 h-4.5" />
            </button>
            <p className="mt-3 text-[11px] text-slate-400 font-medium flex items-center justify-center gap-1.5">
              <Shield className="w-3 h-3" />
              Takes less than 2 minutes · No credit card needed
            </p>
          </motion.div>
        </div>
      </motion.div>
    </main>
  );
}
