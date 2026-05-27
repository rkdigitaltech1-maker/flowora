import { Outlet, NavLink, useNavigate, useLocation, Navigate } from "react-router-dom";
import { useState } from "react";
import { useAdminAuth } from "@/hooks/use-admin-auth.ts";
import { cn } from "@/lib/utils.ts";
import {
  LayoutDashboard, Users, Package, Wallet, BarChart3, Settings,
  Bell, ChevronDown, Menu, X, LogOut, Truck, ShieldCheck, Globe,
  ChevronRight, HeadphonesIcon, FileText, Calculator, MapPin,
  CreditCard, GitBranch, Scale, AlertOctagon, UserCog, Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { Avatar, AvatarFallback } from "@/components/ui/avatar.tsx";

type Child = { label: string; href: string };
type NavItem = {
  label: string;
  icon: React.ReactNode;
  href?: string;
  children?: Child[];
};

type NavSection = {
  heading?: string;
  items: NavItem[];
};

const NAV_SECTIONS: NavSection[] = [
  {
    heading: "Admin Tools",
    items: [
      { label: "Overview", icon: <LayoutDashboard size={16} />, href: "/_sys/ctrl-panel" },
      { label: "Creators", icon: <Users size={16} />, href: "/_sys/ctrl-panel/creators" },
      { label: "Flagged Accounts", icon: <AlertOctagon size={16} />, href: "/_sys/ctrl-panel/flagged" },
      { label: "Settings", icon: <Settings size={16} />, href: "/_sys/ctrl-panel/settings" },
    ],
  },
  {
    heading: "Operations",
    items: [
      { label: "Digital Products", icon: <Package size={16} />, href: "/_sys/ctrl-panel/products" },
      { label: "Automations", icon: <GitBranch size={16} />, href: "/_sys/ctrl-panel/campaigns" },
      { label: "Affiliates", icon: <Scale size={16} />, href: "/_sys/ctrl-panel/affiliates" },
      { label: "Support", icon: <HeadphonesIcon size={16} />, href: "/_sys/ctrl-panel/support" },
    ],
  },
];

function SidebarItem({ item, onNav }: { item: NavItem; onNav?: () => void }) {
  const location = useLocation();
  const anyChildActive = item.children?.some((c) => location.pathname.startsWith(c.href)) ?? false;
  const [open, setOpen] = useState(anyChildActive);

  if (item.children) {
    return (
      <div>
        <button
          onClick={() => setOpen((o) => !o)}
          className={cn(
            "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer",
            anyChildActive
              ? "text-white bg-white/10"
              : "text-slate-300 hover:bg-white/10 hover:text-white"
          )}
        >
          <span className="text-slate-400">{item.icon}</span>
          <span className="flex-1 text-left">{item.label}</span>
          <ChevronRight size={14} className={cn("transition-transform", open && "rotate-90")} />
        </button>
        {open && (
          <div className="ml-6 mt-0.5 space-y-0.5">
            {item.children.map((child) => (
              <NavLink
                key={child.href}
                to={child.href}
                onClick={onNav}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-colors",
                    isActive
                      ? "text-white font-medium"
                      : "text-slate-400 hover:text-white hover:bg-white/10"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={cn("w-1.5 h-1.5 rounded-full border flex-shrink-0", isActive ? "bg-white border-white" : "border-slate-500")} />
                    {child.label}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={item.href!}
      end={item.href === "/_sys/ctrl-panel"}
      onClick={onNav}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
          isActive
            ? "bg-white/15 text-white font-medium"
            : "text-slate-300 hover:bg-white/10 hover:text-white"
        )
      }
    >
      <span className="text-slate-400">{item.icon}</span>
      {item.label}
    </NavLink>
  );
}

function AdminSidebar({ onNav }: { onNav?: () => void }) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-lg px-3 py-1.5 text-white font-extrabold text-xs tracking-wider shadow-sm">
            CREATOR DM
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.heading ?? "default"}>
            {section.heading && (
              <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                {section.heading}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <SidebarItem key={item.label} item={item} onNav={onNav} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-white/10 flex-shrink-0">
        <NavLink
          to="/dashboard"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Globe size={16} />
          Go to App
        </NavLink>
      </div>
    </div>
  );
}

function AdminLayoutInner() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAdminAuth();
  const navigate = useNavigate();

  const formattedDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-56 flex-col bg-[#1a1f3c] flex-shrink-0">
        <AdminSidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-56 h-full bg-[#1a1f3c] flex flex-col">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-white cursor-pointer"
            >
              <X size={18} />
            </button>
            <AdminSidebar onNav={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <header className="h-14 border-b bg-white dark:bg-slate-900 dark:border-slate-800 flex items-center px-4 gap-3 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-slate-500 hover:text-slate-700 cursor-pointer"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-3 text-sm">
            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">Platform Operations</span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="text-xs text-slate-500 font-medium">{formattedDate}</span>
          </div>

          <div className="flex-1" />

          <Button variant="ghost" size="icon" className="relative h-8 w-8">
            <Bell size={16} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 cursor-pointer">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-violet-600 text-white text-[10px]">
                    AD
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200 hidden sm:block">
                  Admin
                </span>
                <ChevronDown size={14} className="text-slate-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                <Globe size={14} className="mr-2" /> Go to App
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { logout(); navigate("/_sys/ctrl-panel/login"); }} className="text-red-600">
                <LogOut size={14} className="mr-2" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const { isAuthenticated } = useAdminAuth();

  if (!isAuthenticated) {
    return <Navigate to="/_sys/ctrl-panel/login" replace />;
  }

  return <AdminLayoutInner />;
}
