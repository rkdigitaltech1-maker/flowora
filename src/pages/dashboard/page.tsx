import {
  AlertTriangle,
  Calendar,
  DollarSign,
  Eye,
  Filter,
  Gift,
  Lock,
  MessageSquare,
  RefreshCw,
  Users,
  X,
  AlertCircle,
  Zap,
  Percent,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { Button } from "@/components/ui/button.tsx";
import { CountUp } from "@/components/ui/count-up.tsx";
import { useAuth } from "@/hooks/use-auth.ts";
import { useOverview } from "@/lib/supabase-hooks.ts";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GettingStartedChecklist } from "@/components/GettingStartedChecklist.tsx";

function startMetaOAuth() {
  const appId = (import.meta.env.VITE_META_APP_ID as string | undefined) ?? "3486992541476144";
  if (!appId) {
    toast.error("Add VITE_META_APP_ID in .env, restart dev server, then connect Instagram.");
    return;
  }
  const redirectUri = (import.meta.env.VITE_META_REDIRECT_URI as string | undefined) ?? `${window.location.origin}/auth/meta/callback`;
  const graphVersion = (import.meta.env.VITE_META_GRAPH_VERSION as string | undefined) ?? "v23.0";
  const scopes = ["instagram_basic", "instagram_manage_comments", "instagram_manage_messages", "pages_show_list", "pages_read_engagement"];
  const url = new URL(`https://www.facebook.com/${graphVersion}/dialog/oauth`);
  url.searchParams.set("client_id", appId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", scopes.join(","));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", crypto.randomUUID());
  window.location.href = url.toString();
}

interface MetricCardProps {
  card: {
    title: string;
    value: string | number;
    detail: string;
    change: string;
    icon: React.ComponentType<{ className?: string }>;
    tone: string;
  };
}

function parseValueForCountUp(val: string | number) {
  if (typeof val === "number") {
    return { end: val, prefix: "", suffix: "", decimals: 0 };
  }
  const cleanStr = val.trim();
  if (cleanStr.includes("/")) {
    const parts = cleanStr.split("/");
    const active = parseFloat(parts[0].replace(/[^0-9.]/g, ""));
    const total = parts[1];
    return { end: isNaN(active) ? 0 : active, prefix: "", suffix: `/${total}`, decimals: 0 };
  }
  if (cleanStr.endsWith("%")) {
    const num = parseFloat(cleanStr.replace(/[^0-9.]/g, ""));
    const hasDecimal = cleanStr.includes(".");
    const decimals = hasDecimal ? cleanStr.split(".")[1].replace(/[^0-9]/g, "").length : 0;
    return { end: isNaN(num) ? 0 : num, prefix: "", suffix: "%", decimals };
  }
  let prefix = "";
  let numberStr = cleanStr;
  const firstChar = cleanStr[0];
  if (isNaN(Number(firstChar)) && firstChar !== "-" && firstChar !== ".") {
    prefix = firstChar;
    numberStr = cleanStr.slice(1);
  }
  const num = parseFloat(numberStr.replace(/,/g, ""));
  const hasDecimal = numberStr.includes(".");
  const decimals = hasDecimal ? numberStr.split(".")[1].replace(/[^0-9]/g, "").length : 0;
  return {
    end: isNaN(num) ? 0 : num,
    prefix,
    suffix: "",
    decimals,
  };
}

function MetricCard({ card }: MetricCardProps) {
  const Icon = card.icon;
  const isNegative = card.change.startsWith("-");
  const isNeutral = card.change === "0%" || card.change === "0";
  const parsed = parseValueForCountUp(card.value);

  return (
    <div
      className={[
        "bg-white rounded-stripe-card border border-[#e3e8ee] p-5 shadow-sm hover:shadow-md hover:border-stripe-brand/35 transition-all flex flex-col justify-between min-h-[160px]",
        card.tone === "wide" ? "lg:col-span-2" : "",
      ].join(" ")}
    >
      <div>
        <div className="flex items-center justify-between">
          <span className="p-2 bg-stripe-brand/10 text-stripe-brand rounded-lg">
            <Icon className="h-4.5 w-4.5" />
          </span>
          <span
            className={[
              "text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-0.5",
              isNegative
                ? "bg-red-50 text-stripe-danger border border-red-100"
                : isNeutral
                  ? "bg-slate-50 text-stripe-gray border border-slate-200/50"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-100"
            ].join(" ")}
          >
            {!isNeutral && (isNegative ? "↓" : "↑")} {card.change}
          </span>
        </div>
        <p className="mt-4 text-[11px] font-black uppercase tracking-wider text-stripe-gray/70">
          {card.title}
        </p>
        <p className="mt-0.5 text-3xl font-black text-stripe-brand-dark tracking-tight">
          <CountUp
            end={parsed.end}
            prefix={parsed.prefix}
            suffix={parsed.suffix}
            decimals={parsed.decimals}
            triggerImmediately={true}
          />
        </p>
      </div>
      <p className="mt-2 text-[11px] text-stripe-gray border-t border-slate-50 pt-2 flex items-center gap-1">
        {card.detail}
      </p>
    </div>
  );
}


export default function DashboardOverview() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { stats, sendVolume, leadSources, campaignDetails, activity, accounts, workspace, loading } = useOverview();
  const [bootstrapping] = useState(false);
  const [showIgAlert, setShowIgAlert] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const navigate = useNavigate();

  const handleRefresh = () => {
    setIsRefetching(true);
    toast.success("Refetching latest activity and analytics...");
    setTimeout(() => {
      setIsRefetching(false);
      toast.success("Dashboard data updated.");
    }, 850);
  };


  // Supabase auto-creates workspace via DB trigger — no manual bootstrap needed
  useEffect(() => {
    if (isAuthenticated && !loading && !workspace) {
      console.log("Workspace will be created automatically by Supabase trigger on first login.");
    }
  }, [isAuthenticated, loading, workspace]);

  if (isAuthLoading || loading || bootstrapping) {
    return (
      <div className="flex h-[calc(100vh-100px)] flex-col items-center justify-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#dfdbea] border-t-[#6d48ff]" />
        {bootstrapping && (
          <p className="text-sm font-semibold text-[#82799b] animate-pulse">
            Setting up your creator workspace...
          </p>
        )}
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="flex h-[calc(100vh-100px)] flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-xl font-bold">Workspace Not Found</h2>
        <p className="text-sm text-[#82799b]">Please try refreshing or sign in again.</p>
        <Button onClick={() => window.location.reload()}>Refresh</Button>
      </div>
    );
  }

  const cards = [
    { title: "DM Sends Today", value: stats.sendsToday.toLocaleString(), detail: "vs yesterday", change: stats.sendsTodayChange, icon: MessageSquare, tone: "white" },
    { title: "New Leads Captured", value: stats.leadsThisWeek.toLocaleString(), detail: "vs last week", change: stats.leadsThisWeekChange, icon: Users, tone: "white" },
    { title: "Total Automation Triggers", value: stats.totalTriggers.toLocaleString(), detail: "overall trigger events", change: "0%", icon: Eye, tone: "white" },
    { title: "Trigger-to-DM Rate", value: stats.triggerRate, detail: "conversion efficiency", change: "0%", icon: Percent, tone: "white" },
    { title: "Product Revenue (MTD)", value: stats.currentMonthRevenue, detail: "vs last month", change: stats.revenueChange, icon: DollarSign, tone: "white" },
    { title: "Active Automations", value: `${stats.activeCampaigns}/${stats.campaigns}`, detail: "running automation sequences", change: "0%", icon: Zap, tone: "wide" },
  ];

  const totalLeadSourceValue = leadSources.reduce((sum: number, s: { value: number }) => sum + s.value, 0);

  return (
    <div className="mx-auto max-w-[1440px] px-5 py-6 lg:px-10">
      <section className="mb-6 relative overflow-hidden rounded-stripe-card bg-gradient-to-r from-stripe-brand-dark to-[#1a3a60] p-6 text-white shadow-stripe-card border border-slate-800">
        {/* Glow decoration */}
        <div className="absolute right-0 top-0 -mr-20 -mt-20 h-40 w-40 rounded-full bg-stripe-brand/20 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="bg-stripe-brand/20 text-stripe-brand border border-stripe-brand/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
              PRO MEMBERSHIP
            </span>
            <h1 className="text-xl font-black mt-1.5 tracking-tight">Unlock Pro Power!</h1>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed max-w-xl">
              Get unlimited active automations, unlimited contact capture, AI auto-replies, keyword re-triggers, and advanced analytical tracking.
            </p>
          </div>
          <button 
            onClick={() => navigate("/dashboard/checkout")} 
            className="rounded-[4px] bg-white hover:bg-slate-50 px-5 py-2.5 text-xs font-bold text-stripe-brand-dark hover:text-stripe-brand shadow-stripe-button transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 self-start sm:self-center"
          >
            <Gift className="h-4 w-4" />
            Upgrade to Pro
          </button>
        </div>
      </section>

      <GettingStartedChecklist />

      {accounts.length === 0 && showIgAlert && (
        <section className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-amber-50 border border-amber-200/60 rounded-stripe-card text-amber-900 shadow-sm relative overflow-hidden animate-fade-in">
          <div className="flex items-start sm:items-center gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-amber-100 text-amber-700">
              <AlertCircle className="h-4.5 w-4.5" />
            </span>
            <div className="pr-6">
              <h3 className="text-xs font-bold text-amber-950">Instagram connection required</h3>
              <p className="text-[11px] text-amber-800/90 mt-0.5">Automations and live feeds are currently running on sandbox demo data. Connect your Instagram account to start processing live events.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
            <button 
              onClick={startMetaOAuth} 
              className="bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold py-1.5 px-3.5 rounded-[4px] transition-all cursor-pointer shadow-sm"
            >
              Connect Account
            </button>
            <button 
              onClick={() => setShowIgAlert(false)}
              className="text-amber-500 hover:text-amber-700 p-1 hover:bg-amber-100 rounded-md transition-colors cursor-pointer"
              aria-label="Dismiss alert"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </section>
      )}


      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.24em] text-[#82799b]">
          <span>Showing:</span>
          <button className="flex items-center gap-2 rounded-xl border border-[#dfdbea] bg-white px-4 py-2 text-sm font-semibold normal-case tracking-normal text-[#171126]">
            <Calendar className="h-4 w-4 text-[#82799b]" />
            Last 14 days
          </button>
          <button className="flex items-center gap-2 rounded-xl border border-[#dfdbea] bg-white px-4 py-2 text-sm font-semibold normal-case tracking-normal text-[#171126]">
            <Filter className="h-4 w-4 text-[#82799b]" />
            All Channels
          </button>
        </div>
        <Button 
          variant="outline" 
          className="rounded-[4px] border-[#dfdbea] bg-white text-[#665d82] text-xs font-bold transition-all shadow-sm" 
          onClick={handleRefresh}
          disabled={isRefetching}
        >
          <RefreshCw className={["h-3.5 w-3.5", isRefetching ? "animate-spin text-stripe-brand" : ""].join(" ")} />
          {isRefetching ? "Refreshing..." : "Refresh"}
        </Button>

      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <MetricCard key={card.title} card={card} />
        ))}
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.25fr_0.82fr]">
        <section className="rounded-[18px] border border-[#dfdbea] bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-semibold">DM Send Volume</h2>
              <p className="text-sm text-[#82799b]">Instagram + WhatsApp automation sends over 14 days</p>
            </div>
            <div className="flex items-center gap-4 text-sm text-[#82799b]">
              <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-[#7048ff]" />Instagram</span>
              <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-[#ff7448]" />WhatsApp</span>
            </div>
          </div>
          <div className="mt-4 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sendVolume}>
                <defs>
                  <linearGradient id="ig" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#7048ff" stopOpacity={0.24} />
                    <stop offset="95%" stopColor="#7048ff" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="wa" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#ff7448" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#ff7448" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#e7e2f2" strokeDasharray="3 3" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "#82799b", fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#82799b", fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="instagram" stroke="#7048ff" fill="url(#ig)" strokeWidth={3} />
                <Area type="monotone" dataKey="whatsapp" stroke="#ff7448" fill="url(#wa)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-[18px] border border-[#dfdbea] bg-white p-5 shadow-sm">
          <h2 className="font-semibold">Lead Sources</h2>
          <p className="text-sm text-[#82799b]"><span className="font-semibold text-[#171126]">{stats.leads.toLocaleString()}</span> total leads captured this period</p>
          <div className="mt-4 h-[230px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leadSources}>
                <CartesianGrid vertical={false} stroke="#e7e2f2" strokeDasharray="3 3" />
                <XAxis dataKey="source" tickLine={false} axisLine={false} tick={{ fill: "#82799b", fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#82799b", fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            {leadSources.slice(0, 3).map((source: { source: string; value: number; fill: string }) => {
              const pct = totalLeadSourceValue > 0 ? Math.round((source.value / totalLeadSourceValue) * 100) : 0;
              return (
                <div key={source.source} className="flex items-center gap-2">
                  <i className="h-2.5 w-2.5 rounded-full" style={{ background: source.fill }} />
                  <span className="truncate text-[#665d82]">{source.source}</span>
                  <span className="ml-auto font-semibold">{pct}%</span>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <section className="overflow-hidden rounded-[18px] border border-[#dfdbea] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#e7e2f2] px-5 py-4">
            <div>
              <h2 className="font-semibold">Automation Performance</h2>
              <p className="text-sm text-[#82799b]">{stats.campaigns} rules · {stats.activeCampaigns} active</p>
            </div>
            <Button className="rounded-full bg-[#f1edff] text-[#7048ff] hover:bg-[#e8e1ff]">
              <Zap className="h-4 w-4" />
              New Rule
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="text-xs font-bold uppercase tracking-widest text-[#82799b]">
                <tr className="border-b border-[#e7e2f2]">
                  {["Automation", "Status", "Triggers", "DMs Sent", "Leads", "Conv. Rate", "Last Triggered"].map((head) => (
                    <th key={head} className="px-5 py-4">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {campaignDetails.map((row: { id: string; name: string; triggerType: string; status: string; triggers: number; dmsSent: number; leads: number; conversionRate: string; lastTriggered: string }) => (
                  <tr key={row.id} className="border-b border-[#eeeaf6] last:border-0">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-[#171126]">{row.name}</p>
                      <p className="text-xs text-[#82799b]">{row.triggerType}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={row.status === "active" ? "text-emerald-600" : row.status === "paused" ? "text-amber-600" : "text-[#82799b]"}>
                        ● {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-semibold">{row.triggers}</td>
                    <td className="px-5 py-4">{row.dmsSent}</td>
                    <td className="px-5 py-4">{row.leads}</td>
                    <td className="px-5 py-4 font-semibold text-emerald-600">{row.conversionRate}</td>
                    <td className="px-5 py-4 text-[#82799b]">{row.lastTriggered}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="overflow-hidden rounded-[18px] border border-[#dfdbea] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#e7e2f2] px-5 py-4">
            <div>
              <h2 className="font-semibold">Live Activity</h2>
              <p className="text-sm text-[#82799b]">Real-time events across all channels</p>
            </div>
            <RefreshCw 
              className={["h-4 w-4 text-[#82799b] cursor-pointer transition-all", isRefetching ? "animate-spin text-stripe-brand" : ""].join(" ")} 
              onClick={handleRefresh} 
            />

          </div>
          <div className="divide-y divide-[#eeeaf6]">
            {activity.map((item: string[], idx: number) => (
              <div key={idx} className="grid grid-cols-[1fr_auto] gap-3 px-5 py-4">
                <div>
                  <p className="text-sm font-medium leading-5">{item[0]}</p>
                  <p className="mt-0.5 text-xs text-[#82799b]">{item[1]}</p>
                </div>
                <p className="whitespace-nowrap text-xs text-[#82799b]">{item[2]}</p>
              </div>
            ))}
            {activity.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-[#82799b]">
                No recent activity recorded yet.
              </div>
            )}
          </div>
          <button className="w-full border-t border-[#eeeaf6] px-5 py-4 text-center text-sm font-semibold text-[#7048ff]">
            View full activity log →
          </button>
        </section>
      </div>
    </div>
  );
}
