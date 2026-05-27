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
import { motion } from "motion/react";
import {
  Users, TrendingUp, AlertTriangle, ShieldCheck,
  Search, MessageSquare, IndianRupee, Package,
  GitBranch, ArrowUpRight, ArrowDownRight, HeadphonesIcon,
  RefreshCw, Sparkles, UserCheck, UserX
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar
} from "recharts";

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-xl text-white text-xs">
      <p className="font-semibold mb-1 text-slate-400">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2 mt-1">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span>{p.name}: <span className="font-bold">{p.value?.toLocaleString()}</span></span>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const { token } = useAdminAuth();
  const { stats, loading: statsLoading, refetch } = useAdminStats();
  const { creators, loading: creatorsLoading } = useAdminCreators({});
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
    toast.success("Dashboard refreshed");
  };

  if (statsLoading || !stats) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
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

  const planData = [
    { name: "Free", value: stats.planDistribution.free, fill: "#6366f1" },
    { name: "Starter", value: stats.planDistribution.starter, fill: "#3b82f6" },
    { name: "Pro", value: stats.planDistribution.pro, fill: "#a855f7" },
    { name: "Enterprise", value: stats.planDistribution.enterprise, fill: "#f59e0b" },
  ];
  const totalPlans = planData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Operations Control Center</h1>
          <p className="text-xs text-slate-500 mt-0.5">Real-time platform data from Supabase.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-xs gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              Live
            </span>
          </div>
        </div>
      </div>

      {/* ── KPI Cards Row 1 ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="w-5 h-5" />}
          label="Total Creators"
          value={stats.totalCreators}
          sublabel={`${stats.activeCreators} active, ${stats.suspendedCreators} suspended`}
          color="from-blue-500 to-indigo-600"
        />
        <StatCard
          icon={<IndianRupee className="w-5 h-5" />}
          label="Monthly Revenue (MRR)"
          value={`\u20B9${stats.mrr.toLocaleString()}`}
          sublabel={`${stats.totalOrders} paid orders`}
          color="from-emerald-500 to-teal-600"
        />
        <StatCard
          icon={<MessageSquare className="w-5 h-5" />}
          label="DM Deliveries"
          value={stats.totalDeliveries.toLocaleString()}
          sublabel="Total messages sent"
          color="from-purple-500 to-pink-600"
        />
        <StatCard
          icon={<AlertTriangle className="w-5 h-5" />}
          label="Flagged Accounts"
          value={stats.flaggedCount}
          sublabel={stats.flaggedCount > 0 ? "Requires review" : "All clear"}
          color="from-red-500 to-orange-600"
          alert={stats.flaggedCount > 0}
        />
      </div>

      {/* ── KPI Cards Row 2 ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<GitBranch className="w-5 h-5" />}
          label="Active Campaigns"
          value={stats.activeCampaigns}
          sublabel={`${stats.totalCampaigns} total`}
          color="from-cyan-500 to-blue-600"
        />
        <StatCard
          icon={<Sparkles className="w-5 h-5" />}
          label="Total Leads"
          value={stats.totalLeads.toLocaleString()}
          sublabel="Collected via automations"
          color="from-amber-500 to-orange-600"
        />
        <StatCard
          icon={<Package className="w-5 h-5" />}
          label="Digital Products"
          value={stats.totalProducts}
          sublabel="Published by creators"
          color="from-rose-500 to-pink-600"
        />
        <StatCard
          icon={<HeadphonesIcon className="w-5 h-5" />}
          label="Support Tickets"
          value={stats.openTickets}
          sublabel={`${stats.resolvedTickets} resolved`}
          color="from-violet-500 to-purple-600"
        />
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <Card className="col-span-2 border-0 shadow-md bg-white dark:bg-slate-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Platform Activity (Last 14 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="dmSends"
                    name="DM Sends"
                    stroke="#8b5cf6"
                    fill="url(#dmGradient)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="newCreators"
                    name="New Signups"
                    stroke="#06b6d4"
                    fill="url(#creatorsGradient)"
                    strokeWidth={2}
                  />
                  <defs>
                    <linearGradient id="dmGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="creatorsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Plan Distribution */}
        <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Subscription Plans
            </CardTitle>
            <p className="text-xs text-slate-400">{totalPlans} total users</p>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={planData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {planData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2">
              {planData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                    <span className="text-slate-600 dark:text-slate-400">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {item.value.toLocaleString()} ({totalPlans > 0 ? ((item.value / totalPlans) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Flagged Accounts & Recent Orders ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Flagged Accounts */}
        <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                Flagged Accounts
              </CardTitle>
              <Badge variant="destructive" className="text-[10px]">
                {stats.flaggedList.length} flagged
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {stats.flaggedList.length === 0 ? (
              <div className="text-center py-8 text-sm text-slate-400">
                <ShieldCheck className="w-10 h-10 mx-auto mb-2 text-emerald-400" />
                <p className="font-medium">No flagged accounts</p>
                <p className="text-xs mt-1">All creators are in good standing.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {stats.flaggedList.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-red-50/50 dark:bg-red-950/10 rounded-xl border border-red-100 dark:border-red-900/30">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-red-100 text-red-600 text-xs font-bold">
                          {(item.name || "?")[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.name}</p>
                        <p className="text-[10px] text-slate-500">{item.reason}</p>
                      </div>
                    </div>
                    <Badge variant="destructive" className="text-[9px]">{item.risk}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-emerald-500" />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentOrders.length === 0 ? (
              <div className="text-center py-8 text-sm text-slate-400">
                <Package className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="font-medium">No orders yet</p>
                <p className="text-xs mt-1">Orders will appear here when creators make sales.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-64 overflow-y-auto">
                {stats.recentOrders.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{order.customerName}</p>
                      <p className="text-[10px] text-slate-500">{order.productTitle} &middot; {order.workspaceName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-emerald-600">
                        {order.currency === "INR" ? "\u20B9" : "$"}{Number(order.amount).toLocaleString()}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "—"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Recent Creators ── */}
      <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              Registered Creator Accounts
            </CardTitle>
            <Badge variant="secondary" className="text-[10px]">
              {stats.totalCreators} total
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {creatorsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-xl" />
              ))}
            </div>
          ) : (creators ?? []).length === 0 ? (
            <div className="text-center py-8 text-sm text-slate-400">
              <Users className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="font-medium">No creators registered yet</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {(creators ?? []).slice(0, 20).map((creator: any) => (
                <div key={creator.userId} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-9 h-9">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-bold">
                        {(creator.name || "?")[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{creator.name}</p>
                      <p className="text-[10px] text-slate-500">{creator.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={creator.status === "active" ? "default" : "destructive"}
                      className="text-[9px]"
                    >
                      {creator.status}
                    </Badge>
                    <Badge variant="outline" className="text-[9px]">
                      {creator.plan || "free"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Reusable Stat Card Component ── */
function StatCard({ icon, label, value, sublabel, color, alert }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sublabel: string;
  color: string;
  alert?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden bg-white dark:bg-slate-900 rounded-2xl p-5 border shadow-sm ${
        alert ? "border-red-200 dark:border-red-900/50" : "border-slate-100 dark:border-slate-800"
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{value}</p>
          <p className="text-[10px] text-slate-400 mt-1">{sublabel}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-md`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}
