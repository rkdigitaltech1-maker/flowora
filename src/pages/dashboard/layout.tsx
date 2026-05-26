import { Link, Outlet, useLocation } from "react-router-dom";
import {
  Bell,
  BookOpen,
  Camera,
  Check,
  ChevronDown,
  CircleHelp,
  CreditCard,
  Gift,
  Home,
  Link2,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  Search,
  Settings,
  Sparkles,
  Users,
  Workflow,
  X,
  Zap,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils.ts";
import { useAuth } from "@/hooks/use-auth.ts";
import { useNavigate } from "react-router-dom";
import { PLANS, formatPrice, getAnnualSavingsPercent, type Currency } from "@/lib/pricing.ts";
import { usePricing } from "@/hooks/use-pricing.ts";

import { useOverview } from "@/lib/supabase-hooks.ts";

const navGroups = [
  {
    title: "Overview",
    items: [
      { label: "Home", href: "/dashboard", icon: Home },
      { label: "Learn", href: "/dashboard/learn", icon: BookOpen, badge: "NEW" },
    ]
  },
  {
    title: "Engagement",
    items: [
      { label: "Workflows", href: "/dashboard/workflows", icon: Workflow, badge: "NEW" },
      { label: "Active Rules", href: "/dashboard/automations", icon: Zap, badge: "3" },
      { label: "DM Campaigns", href: "/dashboard/campaigns", icon: MessageSquare },
      { label: "Link-in-Bio", href: "/dashboard/settings", icon: Link2 },
    ]
  },
  {
    title: "Store & Growth",
    items: [
      { label: "Products", href: "/dashboard/products", icon: Package },
      { label: "Contacts", href: "/dashboard/contacts", icon: Users, badge: "12" },
      { label: "Orders", href: "/dashboard/orders", icon: CreditCard },
      { label: "Refer and Earn", href: "/dashboard/refer", icon: Gift },
    ]
  }
];


function Sidebar({ onClose, user, removeUser, onUpgrade }: { onClose?: () => void; user: any; removeUser: () => Promise<void>; onUpgrade: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const userName = user?.profile?.name || user?.profile?.email || "Creator";
  const userInitial = userName.charAt(0).toUpperCase();

  const { stats, accounts } = useOverview();
  const dmCount = stats.deliveries;
  const contactCount = stats.leads;
  const dmPercent = Math.min((dmCount / 1000) * 100, 100);
  const contactPercent = Math.min((contactCount / 1000) * 100, 100);

  // Get connected IG username from accounts
  const igAccount = (accounts as any[])?.find((a: any) => a.type === "instagram" || a.username);
  const igUsername = igAccount?.username || null;

  return (
    <aside className="flex h-full flex-col border-r border-[#dfdbea] bg-white text-[#171126]">
      <div className="flex h-[76px] items-center justify-between px-7">
        <Link to="/" className="flex items-center gap-3" onClick={onClose}>
          <img src="/logo.png" alt="Flowora Logo" className="h-9 w-auto object-contain" />
        </Link>
        {onClose && (
          <button className="rounded-lg p-2 text-[#82799b] hover:bg-[#f3f0fa]" onClick={onClose}>
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="px-5">
        <div className="flex items-center gap-3 rounded-2xl bg-[#f0edf8] p-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#d9d2ff] text-sm font-bold text-[#4c32d9]">{userInitial}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{userName}</p>
            {igUsername ? (
              <p className="text-xs text-emerald-600">● @{igUsername}</p>
            ) : (
              <p className="text-xs text-amber-700">● IG not connected</p>
            )}
          </div>
          <ChevronDown className="h-4 w-4 text-[#82799b]" />
        </div>
      </div>

      <nav className="mt-6 flex-1 px-5 space-y-5 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            <p className="px-1 text-[10px] font-black uppercase tracking-wider text-stripe-gray/60">
              {group.title}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-2.5 py-2 text-xs font-semibold transition-colors",
                      active
                        ? "bg-stripe-brand/10 text-stripe-brand"
                        : "text-stripe-gray hover:bg-stripe-gray-bg hover:text-stripe-brand-dark"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span
                        className={cn(
                          "grid min-w-5 place-items-center px-1 text-[9px] font-black",
                          item.badge === "NEW"
                            ? "h-4 rounded bg-amber-50 text-amber-800 border border-amber-200"
                            : "h-4 rounded-full bg-stripe-brand text-white"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        <div className="pt-2 border-t border-slate-100">
          <Link
            to="/dashboard/settings"
            onClick={onClose}
            className="flex items-center gap-3 rounded-lg px-2.5 py-2 text-xs font-semibold text-stripe-gray hover:bg-stripe-gray-bg hover:text-stripe-brand-dark"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </div>
      </nav>


      <div className="space-y-3.5 border-t border-slate-100 p-4">
        {/* DM progress */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-stripe-brand-dark">
            <span className="flex items-center gap-1.5">
              <Zap className="h-3 w-3 text-stripe-brand" /> DM Sends
            </span>
            <span className="text-stripe-gray">{dmCount}/1,000</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full rounded-full bg-stripe-brand transition-all" style={{ width: `${dmPercent}%` }} />
          </div>
        </div>

        {/* Contacts progress */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-stripe-brand-dark">
            <span className="flex items-center gap-1.5">
              <Users className="h-3 w-3 text-stripe-success" /> Contacts
            </span>
            <span className="text-stripe-gray">{contactCount}/1,000</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full rounded-full bg-stripe-success transition-all" style={{ width: `${contactPercent}%` }} />
          </div>
        </div>

        {/* Upgrade Button */}
        <button
          onClick={() => { if (onClose) onClose(); onUpgrade(); }}
          className="w-full bg-stripe-brand hover:bg-stripe-brand-hover text-white text-xs font-bold py-2.5 rounded-[4px] shadow-stripe-button transition-all cursor-pointer flex items-center justify-center gap-1.5 mt-2"
        >
          <Gift className="h-3.5 w-3.5" />
          Upgrade to Pro
        </button>

        {/* Actions list */}
        <div className="space-y-0.5 pt-1">
          <button className="w-full flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-stripe-gray hover:bg-stripe-gray-bg hover:text-stripe-brand-dark transition-colors">
            <Bell className="h-3.5 w-3.5" />
            Notifications
            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-stripe-danger animate-pulse" />
          </button>
          <button className="w-full flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-stripe-gray hover:bg-stripe-gray-bg hover:text-stripe-brand-dark transition-colors">
            <CircleHelp className="h-3.5 w-3.5" />
            Help & Support
          </button>
          <button
            onClick={() => removeUser()}
            className="w-full flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-stripe-danger hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </div>

    </aside>
  );
}

export default function DashboardLayout() {
  const { isAuthenticated, isLoading, signinRedirect, user, removeUser } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const { currency, setCurrency, billingInterval, setBillingInterval } = usePricing();

  const proPlan = PLANS.find(p => p.id === "pro")!;
  const savingsPercent = getAnnualSavingsPercent(proPlan, currency);
  const priceMonthly = proPlan.pricing[currency].monthly;
  const priceAnnual = proPlan.pricing[currency].annual;
  const displayPrice = billingInterval === "annual" ? priceAnnual : priceMonthly;
  const currSymbol = currency === "INR" ? "₹" : "$";

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f4f1fb]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#dfdbea] border-t-[#6d48ff]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f1fb] text-[#171126]">
      <div className="hidden w-[250px] shrink-0 md:block">
        <Sidebar user={user} removeUser={removeUser} onUpgrade={() => setUpgradeModalOpen(true)} />
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="w-[282px]">
            <Sidebar onClose={() => setMobileOpen(false)} user={user} removeUser={removeUser} onUpgrade={() => setUpgradeModalOpen(true)} />
          </div>
          <button className="flex-1 bg-[#171126]/40" onClick={() => setMobileOpen(false)} aria-label="Close menu" />
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[58px] shrink-0 items-center gap-3 border-b border-[#dfdbea] bg-white px-5">
          <button className="rounded-lg p-2 hover:bg-[#f4f1fb] md:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-semibold leading-tight">Flowora</p>
            <p className="text-xs text-[#82799b]">Instagram automation and creator commerce</p>
          </div>
          <div className="hidden h-9 w-60 items-center gap-2 rounded-xl bg-[#f2eff8] px-3 md:flex">
            <Search className="h-4 w-4 text-[#82799b]" />
            <input className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#9a91b0]" placeholder="Search anything..." />
          </div>
          <button onClick={() => setUpgradeModalOpen(true)} className="hidden items-center gap-1.5 text-sm font-semibold text-[#ff5a2f] sm:flex">
            <Sparkles className="h-4 w-4" />
            Upgrade
          </button>
          <button className="relative rounded-lg p-2 text-[#665d82] hover:bg-[#f4f1fb]">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#ff5a2f]" />
          </button>
          <button className="grid h-9 w-9 place-items-center rounded-full bg-[#6d48ff] text-sm font-semibold text-white">
            {(user?.profile?.name || user?.profile?.email || "U").charAt(0).toUpperCase()}
          </button>
          <ChevronDown className="h-4 w-4 text-[#82799b]" />
          <button className="hidden rounded-lg bg-[#ff5a2f] px-4 py-2 text-sm font-semibold text-white lg:block">Launch</button>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Upgrade Modal */}
      {upgradeModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setUpgradeModalOpen(false)}>
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="bg-gradient-to-br from-[#6d48ff] to-[#8b63f6] p-6 text-white text-center relative">
              <button onClick={() => setUpgradeModalOpen(false)} className="absolute top-4 right-4 text-white/70 hover:text-white">
                <X className="h-5 w-5" />
              </button>
              <Sparkles className="h-8 w-8 mx-auto mb-2 fill-white/20" />
              <h2 className="text-xl font-black">Upgrade to Flowora Pro</h2>
              <p className="text-sm text-white/80 mt-1">Unlock unlimited automations & grow faster</p>
            </div>

            {/* Currency Selector */}
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Select Currency</span>
                <div className="bg-slate-100 p-1 rounded-lg flex gap-1 border border-slate-200 select-none">
                  <button
                    onClick={() => setCurrency("USD")}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${currency === "USD" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                  >
                    🇺🇸 USD
                  </button>
                  <button
                    onClick={() => setCurrency("INR")}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${currency === "INR" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                  >
                    🇮🇳 INR
                  </button>
                </div>
              </div>

              {/* Billing Interval */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Billing</span>
                <div className="bg-slate-100 p-1 rounded-lg flex gap-1 border border-slate-200 select-none">
                  <button
                    onClick={() => setBillingInterval("monthly")}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${billingInterval === "monthly" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingInterval("annual")}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${billingInterval === "annual" ? "bg-white text-[#6d48ff] shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                  >
                    Annual
                    <span className="bg-emerald-100 text-emerald-700 text-[9px] px-1 py-0.5 rounded font-black">-{savingsPercent}%</span>
                  </button>
                </div>
              </div>

              {/* Price Display */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-center">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-black text-slate-900">{currSymbol}{displayPrice}</span>
                  <span className="text-sm text-slate-500 font-medium">/month</span>
                </div>
                {billingInterval === "annual" && (
                  <p className="text-xs text-slate-400 mt-1">Billed as {currSymbol}{(priceAnnual * 12).toFixed(currency === "USD" ? 2 : 0)}/year</p>
                )}
              </div>

              {/* Key Features */}
              <div className="space-y-2">
                {["Unlimited DMs & campaigns", "10 Instagram accounts", "All automations unlocked", "Advanced analytics (90 days)", "Priority support"].map(f => (
                  <div key={f} className="flex items-center gap-2.5 text-xs text-slate-700">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span className="font-medium">{f}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button
                onClick={() => { setUpgradeModalOpen(false); navigate("/dashboard/checkout"); }}
                className="w-full bg-[#6d48ff] hover:bg-[#5b3ce3] text-white font-bold py-3 rounded-xl shadow-lg shadow-[#6d48ff]/15 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Sparkles className="h-4 w-4" />
                Continue to Checkout
              </button>

              <p className="text-[10px] text-center text-slate-400">7-day money-back guarantee · Cancel anytime</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
