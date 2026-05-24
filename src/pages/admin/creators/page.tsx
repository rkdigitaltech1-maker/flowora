import { useState } from "react";
import { useAdminCreators } from "@/lib/supabase-hooks.ts";
import { useAdminAuth } from "@/hooks/use-admin-auth.ts";
import { toast } from "sonner";
import { cn } from "@/lib/utils.ts";
import { useDebounce } from "@/hooks/use-debounce.ts";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog.tsx";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select.tsx";
import { Avatar, AvatarFallback } from "@/components/ui/avatar.tsx";
import {
  Search, Eye, Edit2, ShieldAlert, Package, Mail,
  Phone, CheckCircle2, Ban, TrendingUp, Calendar,
  GitBranch, ShieldCheck
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
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { MoreHorizontal } from "lucide-react";

type Creator = {
  userId: string;
  workspaceId: string;
  name: string;
  email: string;
  phone: string;
  companyName: string;
  plan: string;
  status: string;
  createdAt: string;
  igCount: number;
  igHandles: string;
  campaignCount: number;
  productCount: number;
  leadCount: number;
  totalRevenue: number;
};

const PLAN_COLORS: Record<string, string> = {
  free: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  creator: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
  pro: "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800",
  agency: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
  suspended: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
};

function PlanBadge({ plan }: { plan: string }) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border capitalize", PLAN_COLORS[plan] || PLAN_COLORS.free)}>
      {plan}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border capitalize", STATUS_COLORS[status] || STATUS_COLORS.active)}>
      {status}
    </span>
  );
}

// ── Edit Creator Dialog ──────────────────────────────────────────────────────
function EditCreatorDialog({
  creator,
  onClose,
  updatePlan,
  updateStatus,
}: {
  creator: Creator | null;
  onClose: () => void;
  updatePlan: (workspaceId: string, plan: string) => Promise<void>;
  updateStatus: (workspaceId: string, status: string) => Promise<void>;
}) {
  const [plan, setPlan] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [saving, setSaving] = useState(false);

  // Sync state
  useState(() => {
    if (creator) {
      setPlan(creator.plan);
      setStatus(creator.status);
    }
  });

  if (!creator) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      if (plan !== creator.plan) {
        await updatePlan(creator.workspaceId, plan);
      }
      if (status !== creator.status) {
        await updateStatus(creator.workspaceId, status);
      }
      toast.success("Creator account updated successfully");
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to update creator");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={!!creator} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle>Edit Creator Plan & Status</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-3">
          <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-violet-600 text-white font-bold">
                {creator.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold">{creator.name}</p>
              <p className="text-xs text-muted-foreground">{creator.email}</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Subscription Plan</label>
            <Select value={plan} onValueChange={setPlan}>
              <SelectTrigger>
                <SelectValue placeholder="Select plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="creator">Creator</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="agency">Agency</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Account Status</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Creator Details Dialog ──────────────────────────────────────────────────────
function CreatorDetailsDialog({
  creator,
  onClose,
  onEdit,
}: {
  creator: Creator | null;
  onClose: () => void;
  onEdit: (c: Creator) => void;
}) {
  if (!creator) return null;

  return (
    <Dialog open={!!creator} onOpenChange={onClose}>
      <DialogContent className="max-w-xl bg-white dark:bg-slate-900 max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-violet-600 text-white font-bold text-sm">
                {creator.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-lg">{creator.name}</DialogTitle>
              <p className="text-xs text-muted-foreground">{creator.companyName || "No Company Specified"}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-3">
          <div className="flex gap-2">
            <StatusBadge status={creator.status} />
            <PlanBadge plan={creator.plan} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: <Mail size={13} />, label: "Email", value: creator.email },
              { icon: <Phone size={13} />, label: "Phone", value: creator.phone },
              { icon: <Calendar size={13} />, label: "Joined", value: new Date(creator.createdAt).toLocaleDateString() },
              { icon: <Instagram size={13} />, label: "IG Profiles", value: creator.igHandles || "None linked" },
            ].map((item, idx) => (
              <div key={idx} className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  {item.icon}
                  <span className="text-[10px] font-semibold uppercase tracking-wider">{item.label}</span>
                </div>
                <p className="text-sm font-medium truncate">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
            {[
              { label: "IG Accounts", value: creator.igCount, icon: <Instagram size={14} className="text-indigo-500" /> },
              { label: "Campaigns", value: creator.campaignCount, icon: <GitBranch size={14} className="text-purple-500" /> },
              { label: "Products", value: creator.productCount, icon: <Package size={14} className="text-blue-500" /> },
              { label: "Total Leads", value: creator.leadCount, icon: <TrendingUp size={14} className="text-emerald-500" /> },
            ].map((stat, i) => (
              <div key={i} className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-3 text-center">
                <div className="flex justify-center mb-1">{stat.icon}</div>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                <p className="text-lg font-bold text-slate-800 dark:text-white mt-1">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl p-4 text-white">
            <p className="text-xs text-white/70 font-semibold uppercase tracking-wider">All-Time Platform Sales Revenue</p>
            <p className="text-3xl font-black mt-1">₹{creator.totalRevenue.toLocaleString()}</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Close</Button>
          <Button onClick={() => { onClose(); onEdit(creator); }} className="gap-1.5">
            <Edit2 size={13} /> Edit Account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page Component ────────────────────────────────────────────────────────
export default function AdminCreatorsPage() {
  const { token } = useAdminAuth();
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 300);

  const [selectedDetails, setSelectedDetails] = useState<Creator | null>(null);
  const [selectedEdit, setSelectedEdit] = useState<Creator | null>(null);

  const { creators, loading, updateCreatorStatus, updateCreatorPlan } = useAdminCreators({
    status: tab,
    search: debouncedSearch,
  });

  const handleStatusToggle = async (creator: Creator) => {
    const nextStatus = creator.status === "active" ? "suspended" : "active";
    const confirmed = confirm(
      `Are you sure you want to ${nextStatus === "active" ? "activate" : "suspend"} creator "${creator.name}"?`
    );
    if (!confirmed) return;

    try {
      await updateCreatorStatus(creator.workspaceId, nextStatus);
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">Platform Creators</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage registered creator workspaces, Connected Instagrams, products, and plan subscriptions.
          </p>
        </div>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <Tabs value={tab} onValueChange={setTab} className="w-auto">
          <TabsList className="grid w-full grid-cols-3 max-w-[320px]">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            <TabsTrigger value="active" className="text-xs">Active</TabsTrigger>
            <TabsTrigger value="suspended" className="text-xs">Suspended</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name, email, IG handle..."
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
                <th className="py-3.5 px-4">Creator / Company</th>
                <th className="py-3.5 px-4">Instagram</th>
                <th className="py-3.5 px-4">Plan</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Products</th>
                <th className="py-3.5 px-4 text-right">Leads</th>
                <th className="py-3.5 px-4 text-right">Revenue</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!creators || loading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx} className="border-b border-slate-50 dark:border-slate-800/40">
                    <td className="py-4 px-4"><Skeleton className="h-5 w-32" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-5 w-24" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-5 w-16" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-5 w-16" /></td>
                    <td className="py-4 px-4 text-right"><Skeleton className="h-5 w-12 ml-auto" /></td>
                    <td className="py-4 px-4 text-right"><Skeleton className="h-5 w-12 ml-auto" /></td>
                    <td className="py-4 px-4 text-right"><Skeleton className="h-5 w-16 ml-auto" /></td>
                    <td className="py-4 px-4 text-right"><Skeleton className="h-5 w-8 ml-auto" /></td>
                  </tr>
                ))
              ) : creators.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-sm text-slate-400">
                    No creators found matching criteria.
                  </td>
                </tr>
              ) : (
                creators.map((c) => (
                  <tr key={c.workspaceId} className="border-b border-slate-50 dark:border-slate-800/40 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-violet-600/10 text-violet-700 dark:text-violet-300 text-xs font-semibold">
                            {c.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate text-slate-800 dark:text-slate-100">{c.name}</p>
                          <p className="text-xs text-slate-400 truncate">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        {c.igHandles ? `@${c.igHandles}` : "—"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <PlanBadge plan={c.plan} />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="py-3 px-4 text-right text-xs font-semibold">
                      {c.productCount}
                    </td>
                    <td className="py-3 px-4 text-right text-xs font-semibold">
                      {c.leadCount}
                    </td>
                    <td className="py-3 px-4 text-right text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{c.totalRevenue.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreHorizontal size={14} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                          <DropdownMenuItem onClick={() => setSelectedDetails(c)} className="gap-2">
                            <Eye size={13} /> View Detail
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setSelectedEdit(c)} className="gap-2">
                            <Edit2 size={13} /> Edit Account
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                          <DropdownMenuItem
                            onClick={() => handleStatusToggle(c)}
                            className={cn("gap-2 font-semibold", c.status === "active" ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400")}
                          >
                            {c.status === "active" ? (
                              <>
                                <Ban size={13} /> Suspend Account
                              </>
                            ) : (
                              <>
                                <ShieldCheck size={13} /> Activate Account
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Dialogs */}
      {selectedEdit && (
        <EditCreatorDialog
          creator={selectedEdit}
          onClose={() => setSelectedEdit(null)}
          updatePlan={updateCreatorPlan}
          updateStatus={updateCreatorStatus}
        />
      )}

      {selectedDetails && (
        <CreatorDetailsDialog
          creator={selectedDetails}
          onClose={() => setSelectedDetails(null)}
          onEdit={(c) => setSelectedEdit(c)}
        />
      )}
    </div>
  );
}
