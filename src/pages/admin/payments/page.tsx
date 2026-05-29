import { useState, useEffect } from "react";
import { useAdminPaymentOrders, useAdminSubscriptions } from "@/lib/supabase-hooks.ts";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { toast } from "sonner";
import {
  CreditCard, CheckCircle2, XCircle, TrendingUp, IndianRupee,
  DollarSign, RefreshCw, ArrowUpRight, ShieldCheck, AlertTriangle,
  Zap, Globe, PieChart as PieChartIcon, BarChart3, Settings,
  ExternalLink, Clock
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

const PIE_COLORS = ["#6d48ff", "#10b981", "#f59e0b", "#ef4444", "#64748b"];

export default function AdminPaymentGatewayPage() {
  const { orders, loading: ordersLoading, stats: orderStats, refetch: refetchOrders } = useAdminPaymentOrders({});
  const { stats: subStats, loading: subsLoading } = useAdminSubscriptions({});
  const [refreshing, setRefreshing] = useState(false);

  const loading = ordersLoading || subsLoading;

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetchOrders();
    setRefreshing(false);
    toast.success("Payment data refreshed");
  };

  // Compute chart data from orders
  const dailyRevenue = (() => {
    if (!orders.length) return [];
    const now = new Date();
    return Array.from({ length: 14 }, (_, i) => {
      const date = new Date(now.getTime() - (13 - i) * 86400000);
      const dateKey = date.toISOString().slice(0, 10);
      const dayLabel = date.toLocaleDateString("en-US", { month: "short", day: "2-digit" });

      const dayOrders = orders.filter((o: any) => o.created_at?.startsWith(dateKey));
      const paidOrders = dayOrders.filter((o: any) => o.status === "paid");
      const revenue = paidOrders.reduce((sum: number, o: any) => sum + (o.amount || 0) / 100, 0);
      const count = paidOrders.length;

      return { day: dayLabel, revenue: Math.round(revenue), orders: count };
    });
  })();

  const statusDistribution = (() => {
    if (!orderStats) return [];
    return [
      { name: "Paid", value: orderStats.paidCount, color: "#10b981" },
      { name: "Pending", value: orderStats.pendingCount, color: "#f59e0b" },
      { name: "Failed", value: orderStats.failedCount, color: "#ef4444" },
      { name: "Refunded", value: orderStats.refundedCount, color: "#64748b" },
    ].filter(d => d.value > 0);
  })();

  const planDistribution = (() => {
    if (!subStats) return [];
    return [
      { name: "Free", value: subStats.freeCount, color: "#94a3b8" },
      { name: "Pro", value: subStats.proCount, color: "#6d48ff" },
    ].filter(d => d.value > 0);
  })();

  // Gateway health check
  const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const gatewayChecks = [
    { label: "Razorpay Key ID", status: !!razorpayKeyId, value: razorpayKeyId ? `${razorpayKeyId.slice(0, 12)}...` : "Not configured" },
    { label: "Supabase URL", status: !!supabaseUrl, value: supabaseUrl ? "Connected" : "Not configured" },
    { label: "Create Order API", status: true, value: "/api/razorpay/create-order" },
    { label: "Verify Payment API", status: true, value: "/api/razorpay/verify-payment" },
  ];

  const successRate = orderStats ? (orderStats.paidCount / Math.max(orderStats.totalOrders, 1) * 100).toFixed(1) : "0";

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Payment Gateway</h1>
          <p className="text-sm text-slate-500 mt-0.5">Razorpay integration status, revenue analytics, and gateway health</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            variant="outline" size="sm"
            onClick={() => window.open("https://dashboard.razorpay.com", "_blank")}
          >
            <ExternalLink className="h-4 w-4 mr-1.5" />
            Razorpay Dashboard
          </Button>
        </div>
      </div>

      {/* Gateway Health Status */}
      <Card className="border-slate-200/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Gateway Configuration Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {gatewayChecks.map(check => (
              <div key={check.label} className="flex items-center gap-3 bg-slate-50 rounded-lg p-3 border border-slate-100">
                {check.status ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-bold text-slate-400">{check.label}</p>
                  <p className="text-xs font-semibold text-slate-700 truncate">{check.value}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Revenue KPIs */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="border-slate-200/80">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-lg bg-violet-100 flex items-center justify-center">
                  <CreditCard className="h-4 w-4 text-violet-600" />
                </div>
              </div>
              <p className="text-xl font-black text-slate-900">{orderStats?.totalOrders || 0}</p>
              <p className="text-[10px] text-slate-500 font-medium uppercase mt-0.5">Total Transactions</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-emerald-600" />
                </div>
              </div>
              <p className="text-xl font-black text-emerald-700">{successRate}%</p>
              <p className="text-[10px] text-slate-500 font-medium uppercase mt-0.5">Success Rate</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <IndianRupee className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <p className="text-xl font-black text-slate-900">₹{(orderStats?.totalRevenueINR || 0).toLocaleString("en-IN")}</p>
              <p className="text-[10px] text-slate-500 font-medium uppercase mt-0.5">INR Collected</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <p className="text-xl font-black text-slate-900">${(orderStats?.totalRevenueUSD || 0).toLocaleString("en-US")}</p>
              <p className="text-[10px] text-slate-500 font-medium uppercase mt-0.5">USD Collected</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-amber-600" />
                </div>
              </div>
              <p className="text-xl font-black text-slate-900">₹{(subStats?.mrr || 0).toLocaleString("en-IN")}</p>
              <p className="text-[10px] text-slate-500 font-medium uppercase mt-0.5">Monthly MRR</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Chart */}
        <Card className="border-slate-200/80 lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-slate-400" />
              Revenue Trend (Last 14 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-56 rounded-lg" />
            ) : dailyRevenue.length > 0 && dailyRevenue.some(d => d.revenue > 0) ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={dailyRevenue} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6d48ff" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#6d48ff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue (₹)"
                    stroke="#6d48ff"
                    strokeWidth={2}
                    fill="url(#revenueGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-56 flex items-center justify-center text-slate-400 text-xs">
                <div className="text-center">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                  <p>No revenue data yet</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Distribution Pie */}
        <Card className="border-slate-200/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <PieChartIcon className="h-4 w-4 text-slate-400" />
              Payment Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-56 rounded-lg" />
            ) : statusDistribution.length > 0 ? (
              <div>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {statusDistribution.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-3 justify-center mt-2">
                  {statusDistribution.map(d => (
                    <div key={d.name} className="flex items-center gap-1.5 text-[11px]">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-slate-600 font-medium">{d.name}: {d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-56 flex items-center justify-center text-slate-400 text-xs">
                <div className="text-center">
                  <PieChartIcon className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                  <p>No payment data yet</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Plan Distribution + Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plan Distribution */}
        <Card className="border-slate-200/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <PieChartIcon className="h-4 w-4 text-slate-400" />
              Plan Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-40 rounded-lg" />
            ) : planDistribution.length > 0 ? (
              <div className="flex items-center gap-8">
                <ResponsiveContainer width={140} height={140}>
                  <PieChart>
                    <Pie
                      data={planDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={60}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {planDistribution.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3 flex-1">
                  {planDistribution.map(d => (
                    <div key={d.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                        <span className="text-xs font-semibold text-slate-700">{d.name}</span>
                      </div>
                      <span className="text-sm font-black text-slate-900">{d.value}</span>
                    </div>
                  ))}
                  <div className="border-t border-slate-100 pt-2 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Total</span>
                    <span className="text-sm font-black text-slate-900">
                      {planDistribution.reduce((sum, d) => sum + d.value, 0)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-slate-400 text-xs">
                No workspace data
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Links & Config */}
        <Card className="border-slate-200/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Settings className="h-4 w-4 text-slate-400" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <a
              href="https://dashboard.razorpay.com/app/payments"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100 transition-colors"
            >
              <div className="h-9 w-9 rounded-lg bg-blue-100 flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-800">View All Payments</p>
                <p className="text-[10px] text-slate-500">Open Razorpay payments dashboard</p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-400" />
            </a>

            <a
              href="https://dashboard.razorpay.com/app/refunds"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100 transition-colors"
            >
              <div className="h-9 w-9 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock className="h-4 w-4 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-800">Process Refunds</p>
                <p className="text-[10px] text-slate-500">Manage refund requests</p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-400" />
            </a>

            <a
              href="https://dashboard.razorpay.com/app/settlements"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100 transition-colors"
            >
              <div className="h-9 w-9 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Globe className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-800">Settlements</p>
                <p className="text-[10px] text-slate-500">View bank settlement reports</p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-400" />
            </a>

            <a
              href="https://dashboard.razorpay.com/app/keys"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100 transition-colors"
            >
              <div className="h-9 w-9 rounded-lg bg-violet-100 flex items-center justify-center">
                <ShieldCheck className="h-4 w-4 text-violet-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-800">API Keys & Webhooks</p>
                <p className="text-[10px] text-slate-500">Manage Razorpay API credentials</p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-400" />
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
