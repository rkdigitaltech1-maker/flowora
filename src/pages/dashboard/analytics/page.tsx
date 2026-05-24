import { BarChart3, MessageCircle, MousePointerClick, ShoppingBag, Users, Loader2 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useAnalytics } from "@/lib/supabase-hooks.ts";
import { CountUp } from "@/components/ui/count-up.tsx";

export default function AnalyticsPage() {
  const { analytics: analyticsData, loading } = useAnalytics();

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-120px)] flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-[#6d48ff]" />
        <p className="text-sm font-semibold text-[#82799b]">Syncing with real stats...</p>
      </div>
    );
  }

  const funnel = analyticsData?.funnel || { comments: 0, dms: 0, clicks: 0, leads: 0, sales: 0 };
  const chartData = analyticsData?.chartData || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Analytics</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-950">Campaign performance funnel</h1>
        <p className="mt-1 text-sm text-slate-500">Track the full path from Instagram comment to DM, click, lead, and sale.</p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          [funnel.comments, "Comments matched", MessageCircle],
          [funnel.dms, "DMs delivered", MessageCircle],
          [funnel.clicks, "Clicks", MousePointerClick],
          [funnel.leads, "Leads", Users],
          [funnel.sales, "Sales", ShoppingBag],
        ].map(([value, label, Icon]) => (
          <div key={label as string} className="rounded-lg border border-slate-200 bg-white p-5">
            <Icon className="h-5 w-5 text-slate-500" />
            <p className="mt-4 text-2xl font-semibold text-slate-950">
              <CountUp end={value as number} triggerImmediately={true} />
            </p>
            <p className="text-sm text-slate-500">{label as string}</p>
          </div>
        ))}
      </div>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-5 w-5 text-slate-600" />
          <div>
            <h2 className="font-semibold text-slate-950">Weekly automation volume</h2>
            <p className="text-sm text-slate-500">Comments, DMs, and captured leads.</p>
          </div>
        </div>
        <div className="mt-5 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="comments" fill="#0f172a" radius={[4, 4, 0, 0]} />
              <Bar dataKey="dms" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="leads" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
