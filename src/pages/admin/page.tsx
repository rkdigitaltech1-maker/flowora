import { useState } from "react";
import { useAdminStats, useAdminCreators } from "@/lib/supabase-hooks.ts";
import { useAdminAuth } from "@/hooks/use-admin-auth.ts";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Avatar, AvatarFallback } from "@/components/ui/avatar.tsx";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import {
  Users, TrendingUp, AlertTriangle, ShieldCheck, CheckCircle2,
  Search, Eye, Edit2, Ban, ChevronDown, MessageSquare,
  GitBranch, ArrowUpRight, ArrowDownRight, IndianRupee, Bell,
  Sparkles, ShieldAlert, Check, X, Filter
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, ComposedChart
} from "recharts";

/* ── Custom Tooltip ────────────────────────────────────────── */
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-xl text-white text-xs">
      <p className="font-semibold mb-1 text-slate-400">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2 mt-1">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span>{p.name}: <span className="font-bold">{p.value}</span></span>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const { token } = useAdminAuth();
  
  // States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [dismissedFlags, setDismissedFlags] = useState<string[]>([]);

  const { stats, loading: statsLoading } = useAdminStats();
  const { creators, loading: creatorsLoading, updateCreatorStatus } = useAdminCreators({
    status: statusFilter,
    search: searchTerm,
  });

  const updateStatus = async (args: { adminToken: string; workspaceId: string; status: string }) => {
    await updateCreatorStatus(args.workspaceId, args.status);
  };

  if (statsLoading || !stats) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-80 col-span-2 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  // Handle Suspend/Activate directly from Flagged Widget
  const handleToggleStatus = async (workspaceId: string, currentStatus: string, name: string) => {
    const nextStatus = currentStatus === "suspended" ? "active" : "suspended";
    const confirmed = confirm(
      `Are you sure you want to ${nextStatus === "active" ? "activate" : "suspend"} creator "${name}"?`
    );
    if (!confirmed) return;

    try {
      await updateStatus({
        adminToken: token ?? "",
        workspaceId: workspaceId as any,
        status: nextStatus,
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  // Handle local dismissal of flagged row
  const handleDismissFlag = (flagId: string) => {
    setDismissedFlags((prev) => [...prev, flagId]);
    toast.success("Flag notification dismissed");
  };

  // Filtered flagged items
  const activeFlags = stats.flaggedList.filter(
    (item: any) => !dismissedFlags.includes(item.id)
  );

  const filteredCreators = (creators ?? []).filter((c) => {
    if (planFilter !== "all" && c.plan !== planFilter) return false;
    return true;
  });

  const planData = [
    { name: "Free", value: stats.planDistribution.free, fill: "#6366f1" },
    { name: "Starter", value: stats.planDistribution.creator, fill: "#3b82f6" },
    { name: "Pro", value: stats.planDistribution.pro, fill: "#a855f7" },
    { name: "Enterprise", value: stats.planDistribution.agency, fill: "#f59e0b" },
  ];

  const totalPlans = planData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* ── Top Header Info ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Operations Control Center</h1>
          <p className="text-xs text-slate-500 mt-0.5">Real-time status sync, risk mitigation, and creator insights.</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-900/40">
            System Live & Connected
          </span>
        </div>
      </div>

      {/* ── KPI Grid (5 Cards) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: MRR */}
        <Card className="border-0 shadow-sm bg-white dark:bg-slate-900 rounded-2xl relative overflow-hidden">
          <CardContent className="p-5 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">MRR</p>
                <p className="text-2xl font-black text-slate-950 dark:text-white mt-1 leading-none">
                  ${stats.mrr.toLocaleString()}
                </p>
              </div>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <IndianRupee className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-4 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="h-3 w-3" />
              <span>+12.4% vs last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Creators */}
        <Card className="border-0 shadow-sm bg-white dark:bg-slate-900 rounded-2xl relative overflow-hidden">
          <CardContent className="p-5 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Creators</p>
                <p className="text-2xl font-black text-slate-950 dark:text-white mt-1 leading-none">
                  {(stats.totalCreators / 1000).toFixed(1)}k
                </p>
              </div>
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-4 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="h-3 w-3" />
              <span>+4.2% vs last week</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: DM Sends */}
        <Card className="border-0 shadow-sm bg-white dark:bg-slate-900 rounded-2xl relative overflow-hidden">
          <CardContent className="p-5 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">DM Sends (24h)</p>
                <p className="text-2xl font-black text-slate-950 dark:text-white mt-1 leading-none">1.24M</p>
              </div>
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <MessageSquare className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-4 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="h-3 w-3" />
              <span>+18.1% vs yesterday</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Active Rules */}
        <Card className="border-0 shadow-sm bg-white dark:bg-slate-900 rounded-2xl relative overflow-hidden">
          <CardContent className="p-5 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Rules</p>
                <p className="text-2xl font-black text-slate-950 dark:text-white mt-1 leading-none">98.7k</p>
              </div>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <GitBranch className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-4 text-[11px] font-semibold text-slate-500">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              <span>Auto-sync active</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 5: Flagged Accounts (Yellow Accent) */}
        <Card className="border-0 shadow-sm bg-amber-500/10 dark:bg-amber-950/20 border-l-4 border-amber-500 rounded-2xl relative overflow-hidden">
          <CardContent className="p-5 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Flagged Risk</p>
                <p className="text-2xl font-black text-amber-950 dark:text-amber-300 mt-1 leading-none">
                  {stats.flaggedCount}
                </p>
              </div>
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-700 dark:text-amber-400">
                <AlertTriangle className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-4 text-[11px] font-bold text-amber-700 dark:text-amber-400">
              <span>Requires immediate review</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Platform DM Volume Chart */}
        <Card className="border-0 shadow-sm bg-white dark:bg-slate-900 rounded-2xl lg:col-span-2">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-100">Platform DM Volume</CardTitle>
              <p className="text-[11px] text-slate-400">Comparing active message deliveries (Millions) with new signups.</p>
            </div>
            <div className="flex gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-violet-600" /> DM Sends</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-orange-400" /> Signups</span>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={stats.dailyStats} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="purpleArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  
                  {/* Left Y Axis for DM sends (Millions) */}
                  <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} unit="M" />
                  
                  {/* Right Y Axis for New Creators (absolute) */}
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  
                  <Tooltip content={<ChartTooltip />} />
                  
                  {/* DM Sends Area Chart */}
                  <Area yAxisId="left" type="monotone" dataKey="dmSends" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#purpleArea)" name="DM Sends" />
                  
                  {/* New Creators Line Chart */}
                  <Line yAxisId="right" type="monotone" dataKey="newCreators" stroke="#f97316" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3, fill: "#f97316", strokeWidth: 0 }} name="New Creators" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Right: Plan Distribution Donut */}
        <Card className="border-0 shadow-sm bg-white dark:bg-slate-900 rounded-2xl flex flex-col justify-between">
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-100">Subscription Plans</CardTitle>
            <p className="text-[11px] text-slate-400">Live share of creators across premium levels.</p>
          </CardHeader>
          <CardContent className="pt-2 flex-1 flex flex-col justify-center">
            <div className="relative h-[160px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={planData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value" strokeWidth={2} stroke="#fff">
                    {planData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {totalPlans.toLocaleString()}
                </span>
                <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Total users</span>
              </div>
            </div>

            {/* Custom progress bars legended underneath */}
            <div className="mt-4 space-y-2 text-xs">
              {planData.map((plan, idx) => {
                const percentage = totalPlans > 0 ? ((plan.value / totalPlans) * 100).toFixed(1) : "0";
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between font-medium text-slate-600 dark:text-slate-400 text-[11px]">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: plan.fill }} />
                        {plan.name}
                      </span>
                      <span>{plan.value.toLocaleString()} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%`, backgroundColor: plan.fill }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Flagged Accounts Action Panel ── */}
      <Card className="border-0 shadow-sm bg-white dark:bg-slate-900 rounded-2xl">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Immediate Action Required (Risk Audit)
              </CardTitle>
              <p className="text-[11px] text-slate-400">Suspicious activities or automated quota violations flags.</p>
            </div>
            <Badge className="bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold border-amber-200">
              {activeFlags.length} Flagged Events
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <AnimatePresence>
            {activeFlags.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                No flagged accounts found. All risk audits cleared!
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {activeFlags.map((item: any) => {
                  const isSuspended = item.status === "suspended";
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-slate-100 dark:border-slate-800">
                          <AvatarFallback className="bg-slate-100 text-slate-700 text-xs font-bold capitalize">
                            {item.name.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.name}</span>
                            <span className="text-[10px] text-slate-400 font-medium">@{item.username}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border capitalize ${
                              item.risk.toLowerCase().includes("high")
                                ? "bg-red-50 text-red-600 border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900"
                                : "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900"
                            }`}>
                              {item.risk}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">{item.reason}</p>
                          <span className="text-[9px] text-slate-400 block mt-1">{item.time}</span>
                        </div>
                      </div>

                      {/* Immediate actions */}
                      <div className="flex items-center gap-2">
                        {item.workspaceId ? (
                          <Button
                            size="sm"
                            variant={isSuspended ? "outline" : "destructive"}
                            className="h-8 text-xs font-bold rounded-lg cursor-pointer"
                            onClick={() => handleToggleStatus(item.workspaceId!, item.status, item.name)}
                          >
                            {isSuspended ? "Activate Account" : "Suspend Account"}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-8 text-xs font-bold rounded-lg cursor-pointer"
                            onClick={() => toast.error("No real database workspace linked to this demo account.")}
                          >
                            Suspend Account
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 text-xs text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer"
                          onClick={() => handleDismissFlag(item.id)}
                        >
                          Dismiss
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* ── Bottom Searchable Creator Table ── */}
      <Card className="border-0 shadow-sm bg-white dark:bg-slate-900 rounded-2xl">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-100">Registered Creator Accounts</CardTitle>
              <p className="text-[11px] text-slate-400">A searchable and filterable database list of registered creators.</p>
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <Input
                  placeholder="Search creator, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8.5 h-8 text-xs w-48 rounded-xl bg-slate-50/50 border-slate-200"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                {["all", "active", "suspended"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold capitalize transition-all cursor-pointer ${
                      statusFilter === st
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Plan Filter */}
              <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                {["all", "free", "creator", "pro", "agency"].map((pl) => (
                  <button
                    key={pl}
                    onClick={() => setPlanFilter(pl)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold capitalize transition-all cursor-pointer ${
                      planFilter === pl
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {pl}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/40 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4 w-4">
                    <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5" />
                  </th>
                  <th className="py-3 px-4">Creator Profile</th>
                  <th className="py-3 px-4">Plan</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">DM Quota</th>
                  <th className="py-3 px-4 text-center">Active Rules</th>
                  <th className="py-3 px-4 text-center">Subscribers</th>
                  <th className="py-3 px-4 text-right">Revenue</th>
                  <th className="py-3 px-4 text-center">Joined</th>
                </tr>
              </thead>
              <tbody>
                {filteredCreators.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-xs text-slate-400">
                      No creators found matching active search filters.
                    </td>
                  </tr>
                ) : (
                  filteredCreators.map((c) => {
                    const isSuspended = c.status === "suspended";
                    // Quota bar logic (simulated by workspace details)
                    const quotaPercent = isSuspended ? 0 : (c.campaignCount * 12 + 15) % 95;
                    return (
                      <tr
                        key={c.workspaceId}
                        className="border-b border-slate-50 dark:border-slate-800/40 hover:bg-slate-50/30 dark:hover:bg-slate-800/10 transition-colors text-xs"
                      >
                        <td className="py-3 px-4">
                          <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5" />
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-7 w-7">
                              <AvatarFallback className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400 text-[10px] font-bold">
                                {c.name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-slate-850 dark:text-slate-200">{c.name}</p>
                              <p className="text-[10px] text-slate-400">{c.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border capitalize ${
                            c.plan === "pro"
                              ? "bg-violet-50 text-violet-600 border-violet-100 dark:bg-violet-950/20 dark:text-violet-400 dark:border-violet-850"
                              : c.plan === "agency"
                              ? "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-850"
                              : c.plan === "creator"
                              ? "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-850"
                              : "bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-850"
                          }`}>
                            {c.plan}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${isSuspended ? "bg-red-500" : "bg-emerald-500"}`} />
                            <span className="font-medium capitalize text-slate-600 dark:text-slate-400">
                              {c.status}
                            </span>
                          </span>
                        </td>
                        <td className="py-3 px-4 min-w-[90px]">
                          <div className="space-y-1">
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  quotaPercent > 80
                                    ? "bg-red-500"
                                    : quotaPercent > 50
                                    ? "bg-amber-500"
                                    : "bg-indigo-500"
                                }`}
                                style={{ width: `${quotaPercent}%` }}
                              />
                            </div>
                            <span className="text-[9px] text-slate-400 font-bold block">{quotaPercent}% Used</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center font-semibold text-slate-700 dark:text-slate-350">
                          {c.campaignCount}
                        </td>
                        <td className="py-3 px-4 text-center font-semibold text-slate-700 dark:text-slate-350">
                          {c.leadCount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                          ₹{c.totalRevenue.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center text-slate-400 font-medium">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
