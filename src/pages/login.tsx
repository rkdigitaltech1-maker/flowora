import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Eye, EyeOff, MessageSquare, Users, Package, BarChart3, Zap, ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase.ts";
import { useAuth } from "@/hooks/use-auth.ts";
import { useAdminAuth } from "@/hooks/use-admin-auth.ts";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import CloudflareTurnstile from "@/components/CloudflareTurnstile.tsx";

const GoogleIcon = () => (
  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
  </svg>
);

const InstagramIcon = () => (
  <svg className="h-4 w-4 mr-2 text-[#E1306C]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

export default function LoginPage() {
  const { isAuthenticated: isUserAuthenticated } = useAuth();
  const { isAuthenticated: isAdminAuthenticated } = useAdminAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const googlePopupRef = useRef<Window | null>(null);
  const googleAuthTimerRef = useRef<number | null>(null);

  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  const handleTurnstileExpire = useCallback(() => {
    setTurnstileToken(null);
  }, []);

  useEffect(() => {
    const errorCode = searchParams.get("error_code");
    const errorDesc = searchParams.get("error_description");
    const errorMsg = searchParams.get("error");
    if (errorCode || errorMsg) {
      toast.error(`Authentication failed: ${errorDesc || errorMsg || errorCode}`);
      navigate("/login", { replace: true });
    }
  }, [searchParams, navigate]);

  useEffect(() => {
    if (isUserAuthenticated) {
      // Returning users who haven't completed onboarding go there first
      const onboardingDone = localStorage.getItem("cs_onboarding_done");
      if (!onboardingDone) {
        navigate("/welcome");
      } else {
        navigate("/dashboard");
      }
    } else if (isAdminAuthenticated) {
      navigate("/_sys/ctrl-panel");
    }
  }, [isUserAuthenticated, isAdminAuthenticated, navigate]);

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type !== "supabase-auth-success") return;
      if (googlePopupRef.current && event.source !== googlePopupRef.current) return;
      if (event.origin !== window.location.origin) return;

      if (googleAuthTimerRef.current) {
        window.clearInterval(googleAuthTimerRef.current);
        googleAuthTimerRef.current = null;
      }

      if (googlePopupRef.current && !googlePopupRef.current.closed) {
        googlePopupRef.current.close();
      }

      setGoogleLoading(false);
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        toast.success("Signed in with Google!");
        const onboardingDone = localStorage.getItem("cs_onboarding_done");
        navigate(onboardingDone ? "/dashboard" : "/welcome", { replace: true });
      } else {
        toast.error("Signed in, but session was not detected. Please refresh and try again.");
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [navigate]);

  // ── Supabase Google OAuth (Popup) ─────────────────────────────────────────
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      // Get the OAuth URL from Supabase
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          skipBrowserRedirect: true, // prevent full-page redirect
        },
      });

      if (error) {
        if (error.message.includes("provider is not enabled") || error.message.includes("not configured")) {
          toast.error("Google OAuth is not enabled yet. Enable it in Supabase → Authentication → Providers → Google.");
        } else {
          toast.error(error.message);
        }
        setGoogleLoading(false);
        return;
      }

      if (!data?.url) {
        toast.error("Failed to get Google sign-in URL.");
        setGoogleLoading(false);
        return;
      }

      // Open Google login in a popup window
      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        data.url,
        "GoogleSignIn",
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
      );

      if (!popup) {
        // Popup blocked — fallback to redirect
        toast.info("Popup blocked. Redirecting...");
        window.location.href = data.url;
        return;
      }

      googlePopupRef.current = popup;

      // Poll for popup close and session as a fallback when no message is received.
      const timer = window.setInterval(async () => {
        if (popup.closed) {
          window.clearInterval(timer);
          googleAuthTimerRef.current = null;

          // Give a short delay for the session to propagate from popup to parent via localStorage
          await new Promise((resolve) => setTimeout(resolve, 800));

          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData?.session) {
            toast.success("Signed in with Google!");
            const onboardingDone = localStorage.getItem("cs_onboarding_done");
            navigate(onboardingDone ? "/dashboard" : "/welcome", { replace: true });
          } else {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            const { data: retryData } = await supabase.auth.getSession();
            if (retryData?.session) {
              toast.success("Signed in with Google!");
              const onboardingDone = localStorage.getItem("cs_onboarding_done");
              navigate(onboardingDone ? "/dashboard" : "/welcome", { replace: true });
            } else {
              setGoogleLoading(false);
              toast.error("Sign-in session not detected. Please try again.");
            }
          }
        }
      }, 500);

      googleAuthTimerRef.current = timer;

    } catch (err: any) {
      toast.error(err.message ?? "Google sign-in failed.");
      setGoogleLoading(false);
    }
  };

  // ── Instagram placeholder ─────────────────────────────────────────────────
  const handleInstagramLogin = () => {
    toast.info("Instagram login requires Meta OAuth setup. Use email/password or Google for now.");
  };

  // ── Email/Password (Supabase + demo accounts) ─────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error("Please fill in all fields."); return; }

    // Require Turnstile verification for signups (skip for demo accounts)
    if (mode === "signup" && !turnstileToken && email !== "aisha@createwith.co") {
      toast.error("Please complete the security verification.");
      return;
    }

    setLoading(true);

    try {
      // Creator demo account (bypasses Supabase, runs local auth)
      if (email === "aisha@createwith.co" && password === "creator_demo_2026") {
        localStorage.setItem("local_auth_authenticated", "true");
        toast.success("Signed in as demo creator!");
        window.location.href = "/dashboard";
        return;
      }

      if (mode === "signup") {
        // Supabase sign up
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name || email.split("@")[0] } },
        });
        toast.success("Account created! Check your email to confirm, then sign in to continue.");
        navigate("/onboarding");
      } else {
        // Supabase sign in
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          // Demo creator fallback
          if (email === "aisha@createwith.co") {
            localStorage.setItem("local_auth_authenticated", "true");
            toast.success("Signed in as demo creator!");
            window.location.href = "/dashboard";
            return;
          }
          throw error;
        }
        toast.success("Welcome back!");
        navigate("/dashboard");
      }
    } catch (err: any) {
      toast.error(err.message ?? "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const autofillDemo = (role: "creator" | "admin") => {
    if (role === "creator") {
      setEmail("aisha@createwith.co"); setPassword("creator_demo_2026"); setMode("signin");
      toast.success("Creator credentials autofilled!");
    } else {
      setEmail("admin@flowora.tech"); setPassword("admin_demo_2026"); setMode("signin");
      toast.success("Admin credentials autofilled!");
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-900 select-none">
      {/* ── LEFT PANEL (Live Brand Showcase) ── */}
      <div className="w-full lg:w-[38%] xl:w-[35%] bg-gradient-to-br from-[#0c0d19] via-[#14122d] to-[#080516] p-8 lg:p-12 flex flex-col justify-between text-white shrink-0 relative overflow-hidden border-b lg:border-b-0 lg:border-r border-white/5">
        {/* Glow Effects */}
        <div className="absolute top-[-10%] left-[-10%] w-[90%] h-[40%] bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[90%] h-[40%] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#080516_100%)] pointer-events-none" />
        {/* Abstract Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)] pointer-events-none" />

        {/* Top Logo branding */}
        <div className="flex items-center gap-3 relative z-10 w-fit">
          <img src="/logo.png" alt="Flowora Logo" className="h-8 w-auto object-contain brightness-0 invert" />
        </div>

        {/* Middle Value Proposition & Stats Mockup */}
        <div className="my-10 lg:my-0 space-y-8 relative z-10 max-w-lg">
          <div className="space-y-4">
            <h1 className="text-3xl lg:text-[40px] font-extrabold tracking-tight leading-[1.1] text-white">
              Your entire creator business,<br />in one place.
            </h1>
            <p className="text-slate-300/90 text-sm leading-relaxed max-w-sm font-medium">
              DM automation, digital products, lead capture, and analytics — built for creators who are serious about scaling.
            </p>
          </div>

          {/* Interactive Live Metrics Widget */}
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 backdrop-blur-lg shadow-2xl relative overflow-hidden group hover:border-white/15 transition-all duration-300">
            <div className="absolute top-0 right-0 w-28 h-28 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Active DM Automation</span>
              </div>
              <span className="text-[9px] font-extrabold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">LIVE MONITOR</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Replies Sent</span>
                <span className="text-2xl font-black text-white tracking-tight mt-0.5 block">14,285</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Conversion Rate</span>
                <span className="text-2xl font-black text-emerald-400 tracking-tight mt-0.5 block">94.8%</span>
              </div>
            </div>

            {/* Sparkline chart bar mock */}
            <div className="mt-5 flex gap-1 items-end h-7">
              {[45, 65, 50, 75, 90, 55, 98, 80, 100, 85, 92].map((h, i) => (
                <div 
                  key={i} 
                  className="flex-1 bg-gradient-to-t from-purple-600 to-pink-500 rounded-t-xs opacity-80 hover:opacity-100 transition-opacity" 
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Testimonial Slide */}
        <div className="space-y-4 relative z-10">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">What creators are saying</p>
          <div className="grid gap-3">
            {[
              { text: "I went from 0 to 2,400 email subscribers in 6 weeks using Flowora's comment automation.", author: "Priya Sharma", handle: "@priya.creates", initial: "P", gradient: "from-purple-500 to-indigo-500" },
              { text: "The DM automation alone paid for 3 years of the Pro plan in the first month.", author: "Carlos Vega", handle: "@carlos.vega", initial: "C", gradient: "from-pink-500 to-rose-500" }
            ].map((t, idx) => (
              <div key={idx} className="bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-xl p-4 text-xs space-y-3 transition-all relative group">
                <p className="text-slate-200/90 italic leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-2.5">
                  <div className={`w-6 h-6 rounded-full bg-gradient-to-tr ${t.gradient} flex items-center justify-center text-[10px] font-black text-white`}>
                    {t.initial}
                  </div>
                  <div>
                    <span className="font-semibold block text-slate-200">{t.author}</span>
                    <span className="text-[10px] text-slate-500 block">{t.handle}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL (Auth Card Container) ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-slate-50 relative overflow-y-auto min-h-screen">
        {/* Glow decorations for light background */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-200/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-200/10 rounded-full blur-3xl pointer-events-none" />

        {/* Premium Form Card */}
        <div className="w-full max-w-[450px] bg-white border border-slate-200/60 shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[32px] p-8 lg:p-10 relative z-10 flex flex-col gap-6 my-8">
          
          {/* Header */}
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
              {mode === "signin" ? "Welcome back" : "Get Started"}
            </h2>
            <p className="text-xs text-slate-400 font-semibold leading-normal">
              {mode === "signin" ? "Enter your credentials to manage your automations." : "Create your account and automate your business today."}
            </p>
          </div>

          {/* Tab Slider Mode Switcher */}
          <div className="bg-slate-100 p-1 rounded-xl flex gap-1 w-full border border-slate-200/30">
            {(["signup", "signin"] as const).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`flex-1 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mode === m 
                    ? "bg-white text-slate-900 shadow-sm border border-slate-200/50" 
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {m === "signin" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleGoogleLogin} 
              disabled={googleLoading}
              className="border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-800 rounded-xl h-11 text-xs font-bold cursor-pointer transition-all shadow-xs flex items-center justify-center disabled:opacity-60"
            >
              {googleLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
              ) : (
                <GoogleIcon />
              )}
              <span>Google</span>
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleInstagramLogin}
              className="border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-800 rounded-xl h-11 text-xs font-bold cursor-pointer transition-all shadow-xs flex items-center justify-center"
            >
              <InstagramIcon />
              <span>Instagram</span>
            </Button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center py-1">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100" /></div>
            <span className="relative bg-white px-3 text-[10px] font-bold text-slate-400 tracking-widest uppercase">
              or use email
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label className="text-slate-700 text-xs font-extrabold">Full name</Label>
                <Input 
                  type="text" 
                  placeholder="Your name" 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  className="bg-slate-50/50 border-slate-200/80 rounded-xl h-11 focus-visible:ring-2 focus-visible:ring-purple-600/10 focus-visible:border-purple-600 hover:bg-slate-50 transition-all text-sm font-medium" 
                />
              </div>
            )}
            
            <div className="space-y-1.5">
              <Label className="text-slate-700 text-xs font-extrabold">Email address</Label>
              <Input 
                type="email" 
                placeholder="you@example.com" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required
                className="bg-slate-50/50 border-slate-200/80 rounded-xl h-11 focus-visible:ring-2 focus-visible:ring-purple-600/10 focus-visible:border-purple-600 hover:bg-slate-50 transition-all text-sm font-medium" 
              />
            </div>
            
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-slate-700 text-xs font-extrabold">Password</Label>
                {mode === "signin" && (
                  <button 
                    type="button" 
                    onClick={() => toast.info("Use demo account below, or reset via Supabase.")}
                    className="text-xs text-purple-600 hover:text-purple-700 hover:underline font-bold cursor-pointer transition-colors"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Enter your password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required
                  className="bg-slate-50/50 border-slate-200/80 rounded-xl h-11 pr-10 focus-visible:ring-2 focus-visible:ring-purple-600/10 focus-visible:border-purple-600 hover:bg-slate-50 transition-all text-sm font-medium" 
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {mode === "signin" && (
              <div className="flex items-center gap-2 pt-1">
                <input 
                  type="checkbox" 
                  id="remember" 
                  defaultChecked 
                  className="rounded border-slate-300 text-purple-600 focus:ring-purple-500/20 h-4 w-4 transition-all" 
                />
                <label htmlFor="remember" className="text-xs text-slate-500 font-semibold select-none cursor-pointer">
                  Keep me signed in for 30 days
                </label>
              </div>
            )}

            {/* Cloudflare Turnstile — only shown on signup */}
            {mode === "signup" && (
              <div className="flex justify-center pt-1">
                <CloudflareTurnstile
                  onVerify={handleTurnstileVerify}
                  onExpire={handleTurnstileExpire}
                  theme="light"
                  size="normal"
                />
              </div>
            )}

            <Button 
              type="submit" 
              disabled={loading || (mode === "signup" && !turnstileToken)}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold h-11 rounded-xl shadow-lg shadow-purple-600/20 hover:shadow-purple-700/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-3 text-sm"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  <span>{mode === "signin" ? "Sign In" : "Create Account"}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Mode Switcher Bottom Help Link */}
          <div className="text-center pt-1">
            <button 
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="text-xs text-slate-400 font-bold hover:text-purple-600 transition-colors cursor-pointer"
            >
              {mode === "signin" ? (
                <>Don't have an account? <span className="text-purple-600 hover:underline">Create one free</span></>
              ) : (
                <>Already have an account? <span className="text-purple-600 hover:underline">Sign in</span></>
              )}
            </button>
          </div>

          {/* Quick Demo Access Widget */}
          <div className="mt-2 bg-slate-50/80 border border-slate-100 rounded-2xl p-4">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quick Demo Access</h4>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {[
                { role: "creator" as const, label: "Creator", color: "purple", email: "aisha@createwith.co" },
                { role: "admin" as const, label: "Admin", color: "slate", email: "admin@flowora.tech" },
              ].map(({ role, label, color, email: demoEmail }) => (
                <button 
                  key={role} 
                  type="button"
                  onClick={() => autofillDemo(role)}
                  className="text-left p-2.5 rounded-xl bg-white border border-slate-200/50 hover:border-purple-500/40 hover:shadow-sm hover:scale-[1.02] transition-all group cursor-pointer"
                >
                  <span className="text-[9px] font-extrabold text-purple-600 bg-purple-50 border border-purple-100 px-1.5 py-0.5 rounded uppercase tracking-wider block w-fit mb-1">
                    {label}
                  </span>
                  <span className="text-[10.5px] font-bold block text-slate-700 truncate">{demoEmail}</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5 font-semibold group-hover:text-purple-600 transition-colors">Autofill credentials</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
