import { Link, Outlet, useLocation } from "react-router-dom";
import {
  Bell,
  BookOpen,
  Camera,
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


function Sidebar({ onClose, user, removeUser }: { onClose?: () => void; user: any; removeUser: () => Promise<void> }) {
  const location = useLocation();
  const navigate = useNavigate();
  const userName = user?.profile?.name || user?.profile?.email || "Creator";
  const userInitial = userName.charAt(0).toUpperCase();

  const { stats } = useOverview();
  const dmCount = stats.deliveries;
  const contactCount = stats.leads;
  const dmPercent = Math.min((dmCount / 1000) * 100, 100);
  const contactPercent = Math.min((contactCount / 1000) * 100, 100);

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
            <p className="text-xs text-amber-700">● IG not connected</p>
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
          onClick={() => { if (onClose) onClose(); navigate("/dashboard/checkout"); }}
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
        <Sidebar user={user} removeUser={removeUser} />
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="w-[282px]">
            <Sidebar onClose={() => setMobileOpen(false)} user={user} removeUser={removeUser} />
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
          <button onClick={() => navigate("/dashboard/checkout")} className="hidden items-center gap-1.5 text-sm font-semibold text-[#ff5a2f] sm:flex">
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
    </div>
  );
}
