import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth.ts";
import { Sparkles, ArrowRight, MessageSquare, Users, Zap, DollarSign } from "lucide-react";

export default function WelcomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const firstName = user?.profile?.name?.split(" ")[0] || user?.profile?.email?.split("@")[0] || "Creator";

  const handleGetStarted = () => {
    navigate("/onboarding", { replace: true });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-10 text-center relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl pointer-events-none" />

          {/* Logo / Icon */}
          <div className="relative mx-auto w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#6d48ff] to-[#ec149e] flex items-center justify-center shadow-lg shadow-purple-500/20 mb-6">
            <Sparkles className="w-10 h-10 text-white" />
          </div>

          {/* Welcome Text */}
          <div className="relative space-y-3 mb-8">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Welcome, {firstName}!
            </h1>
            <p className="text-base text-slate-500 leading-relaxed max-w-sm mx-auto">
              You're just a few steps away from automating your Instagram growth and turning followers into customers.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {[
              { icon: MessageSquare, label: "Auto-reply to DMs & comments" },
              { icon: Users, label: "Capture leads automatically" },
              { icon: Zap, label: "Build automation workflows" },
              { icon: DollarSign, label: "Sell digital products" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2.5 bg-slate-50 rounded-xl p-3 border border-slate-100 text-left">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#6d48ff] to-[#ec149e] flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs font-semibold text-slate-700 leading-tight">{label}</span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <button
            onClick={handleGetStarted}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#6d48ff] to-[#ec149e] text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 hover:scale-[1.02] transition-all duration-200 cursor-pointer"
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </button>

          <p className="mt-4 text-xs text-slate-400">
            Takes less than 2 minutes to set up
          </p>
        </div>
      </div>
    </main>
  );
}
