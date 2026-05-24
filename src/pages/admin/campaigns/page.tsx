import { useState } from "react";
import { useAdminCampaigns } from "@/lib/supabase-hooks.ts";
import { useAdminAuth } from "@/hooks/use-admin-auth.ts";
import { useDebounce } from "@/hooks/use-debounce.ts";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search, GitBranch, MessageSquare, ShieldAlert,
  Play, Pause, Calendar
} from "lucide-react";

interface InstagramProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

const Instagram = ({ size = 24, ...props }: InstagramProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

type Campaign = {
  _id: string;
  workspaceId: string;
  instagramAccountId: string;
  name: string;
  status: string; // "active" | "paused" | "archived"
  triggerType: string;
  keywords: string[];
  createdAt: string;
  workspaceName: string;
  igUsername: string;
  deliveryCount: number;
};

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive"> = {
  active: "default",
  paused: "secondary",
  archived: "destructive",
};

export default function AdminCampaignsPage() {
  const { token } = useAdminAuth();
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 300);

  const { campaigns, loading } = useAdminCampaigns({
    status: tab,
    search: debouncedSearch,
  });

  const totalCount = campaigns?.length ?? 0;
  const activeCount = campaigns?.filter((c) => c.status === "active").length ?? 0;
  const pausedCount = campaigns?.filter((c) => c.status === "paused").length ?? 0;
  const totalDeliveries = campaigns?.reduce((sum, c) => sum + (c.deliveryCount || 0), 0) ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">Platform Automations</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Monitor Instagram DM automation campaigns and trigger metrics active across all creator channels.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Campaigns", value: totalCount, icon: <GitBranch size={16} />, color: "from-indigo-600 to-violet-600" },
          { label: "Active Automations", value: activeCount, icon: <Play size={16} />, color: "from-emerald-600 to-teal-600" },
          { label: "Paused Automations", value: pausedCount, icon: <Pause size={16} />, color: "from-amber-600 to-orange-600" },
          { label: "Auto-Deliveries Sent", value: totalDeliveries.toLocaleString(), icon: <MessageSquare size={16} />, color: "from-blue-600 to-cyan-600" },
        ].map((stat, i) => (
          <Card key={i} className="border-0 shadow-sm overflow-hidden bg-gradient-to-r text-white" style={{ background: `linear-gradient(135deg, var(--tw-gradient-stops))` }}>
            <div className={`p-4 bg-gradient-to-br ${stat.color} flex items-center justify-between`}>
              <div>
                <p className="text-[10px] uppercase font-bold text-white/70 tracking-wider">{stat.label}</p>
                <p className="text-2xl font-extrabold mt-1">{campaigns ? stat.value : <Skeleton className="h-7 w-16 bg-white/20" />}</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                {stat.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <Tabs value={tab} onValueChange={setTab} className="w-auto">
          <TabsList className="grid w-full grid-cols-3 max-w-[320px]">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            <TabsTrigger value="active" className="text-xs">Active</TabsTrigger>
            <TabsTrigger value="paused" className="text-xs">Paused</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search campaign, keyword, creator name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      {/* Table Card */}
      <Card className="border-0 shadow-md overflow-hidden bg-white dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Campaign Name</th>
                <th className="py-3.5 px-4">Creator / Workspace</th>
                <th className="py-3.5 px-4">Instagram Profile</th>
                <th className="py-3.5 px-4">Trigger Type</th>
                <th className="py-3.5 px-4">Keywords</th>
                <th className="py-3.5 px-4 text-right">Deliveries Sent</th>
                <th className="py-3.5 px-4 text-right">Status</th>
                <th className="py-3.5 px-4 text-right">Created At</th>
              </tr>
            </thead>
            <tbody>
              {!campaigns || loading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx} className="border-b border-slate-50 dark:border-slate-800/40">
                    <td className="py-4 px-4"><Skeleton className="h-5 w-48" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-5 w-24" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-5 w-20" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-5 w-28" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-5 w-32" /></td>
                    <td className="py-4 px-4 text-right"><Skeleton className="h-5 w-12 ml-auto" /></td>
                    <td className="py-4 px-4 text-right"><Skeleton className="h-5 w-14 ml-auto" /></td>
                    <td className="py-4 px-4 text-right"><Skeleton className="h-5 w-20 ml-auto" /></td>
                  </tr>
                ))
              ) : campaigns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-sm text-slate-400">
                    No campaigns found matching criteria.
                  </td>
                </tr>
              ) : (
                campaigns.map((c) => (
                  <tr key={c._id} className="border-b border-slate-50 dark:border-slate-800/40 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-950/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
                          <GitBranch size={15} />
                        </div>
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{c.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                      {c.workspaceName}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <div className="flex items-center gap-1.5 text-pink-600 dark:text-pink-400 font-semibold">
                        <Instagram size={13} />
                        <span>@{c.igUsername}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs font-semibold capitalize text-slate-500">
                      {c.triggerType.replace(/_/g, " ")}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {c.keywords.length === 0 ? (
                          <span className="text-xs text-slate-400 italic">No keywords</span>
                        ) : (
                          c.keywords.map((kw: any, i: number) => (
                            <Badge key={i} variant="outline" className="text-[10px] py-0 px-1.5 font-normal">
                              {kw}
                            </Badge>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-xs font-bold text-slate-800 dark:text-white">
                      {c.deliveryCount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Badge variant={STATUS_VARIANTS[c.status] || "secondary"} className="text-[10px] capitalize">
                        {c.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right text-xs text-slate-400">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
