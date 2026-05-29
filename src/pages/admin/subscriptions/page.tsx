import { useState } from "react";
import { useAdminSubscriptions } from "@/lib/supabase-hooks.ts";
import { useDebounce } from "@/hooks/use-debounce.ts";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog.tsx";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select.tsx";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { toast } from "sonner";
import {
  Search, Users, Crown, RefreshCw, MoreVertical, Eye,
  Ban, ArrowUpRight, TrendingUp, CalendarClock, AlertTriangle,
  IndianRupee, Sparkles, UserCheck, XCircle, Edit2
} from "lucide-react";

const PLAN_BADGES: Record<string, { label: string; color: string }> = {
  free: { label: "Free", color: "bg-slate-100 text-slate-600 border-slate-200" },
  pro: { label: "Pro Monthly", color: "bg-violet-100 text-violet-700 border-violet-200" },
  pro_annual: { label: "Pro Annual", color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
};

const STATUS_BADGES: Record<string, { label: string; color: string }> = {
  active: { label: "Active", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  inactive: { label: "Inactive", color: "bg-slate-100 text-slate-600 border-slate-200" },
  canceled: { label: "Canceled", color: "bg-red-100 text-red-700 border-red-200" },
  past_due: { label: "Past Due", color: "bg-amber-100 text-amber-700 border-amber-200" },
  trialing: { label: "Trial", color: "bg-blue-100 text-blue-700 border-blue-200" },
  expired: { label: "Expired", color: "bg-slate-100 text-slate-500 border-slate-200" },
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric"
  });
}

export default function AdminSubscriptionsPage() {
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch] = useDebounce(searchQuery, 300);
  const [selectedSub, setSelectedSub] = useState<any>(null);
  const [editPlanOpen, setEditPlanOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any>(null);
  const [newPlan, setNewPlan] = useState("");

  const { subscriptions, loading, stats, updateSubscription, cancelSubscription, refetch } = useAdminSubscriptions({
    plan: planFilter,
    status: statusFilter,
    search: debouncedSearch,
  });

  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
    toast.success("Subscriptions refreshed");
  };

  const handleEditPlan = (sub: any) => {
    setEditTarget(sub);
    setNewPlan(sub.plan);
    setEditPlanOpen(true);
  };

  const handleSavePlan = async () => {
    if (!editTarget || !newPlan) return;
    await updateSubscription(editTarget.workspaceId, {
      plan: newPlan,
      subscription_status: newPlan === "free" ? "inactive" : "active",
    });
    setEditPlanOpen(false);
    setEditTarget(null);
  };

  const handleCancel = async (sub: any) => {
    if (!confirm(`Cancel subscription for ${sub.userName}? This will downgrade them to Free.`)) return;
    await cancelSubscription(sub.workspaceId);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Subscriptions</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage creator subscriptions, plan changes, and renewals</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-slate-200/80">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-violet-100 flex items-center justify-center">
                  <Crown className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900">{stats.proCount}</p>
                  <p className="text-xs text-slate-500 font-medium">Pro Subscribers</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-black text-emerald-700">₹{stats.mrr?.toLocaleString("en-IN")}</p>
                  <p className="text-xs text-slate-500 font-medium">Monthly MRR</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <CalendarClock className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-black text-amber-700">{stats.expiringIn7Days}</p>
                  <p className="text-xs text-slate-500 font-medium">Expiring in 7 days</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-black text-red-700">{stats.canceledCount}</p>
                  <p className="text-xs text-slate-500 font-medium">Canceled</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
        <Tabs value={planFilter} onValueChange={setPlanFilter} className="w-full sm:w-auto">
          <TabsList className="bg-slate-100 h-9">
            <TabsTrigger value="all" className="text-xs font-bold">All Plans</TabsTrigger>
            <TabsTrigger value="free" className="text-xs font-bold">Free</TabsTrigger>
            <TabsTrigger value="pro" className="text-xs font-bold">Pro</TabsTrigger>
            <TabsTrigger value="pro_annual" className="text-xs font-bold">Pro Annual</TabsTrigger>
          </TabsList>
        </Tabs>

        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full sm:w-auto">
          <TabsList className="bg-slate-100 h-9">
            <TabsTrigger value="all" className="text-xs font-bold">All Status</TabsTrigger>
            <TabsTrigger value="active" className="text-xs font-bold">Active</TabsTrigger>
            <TabsTrigger value="canceled" className="text-xs font-bold">Canceled</TabsTrigger>
            <TabsTrigger value="inactive" className="text-xs font-bold">Inactive</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name, email, payment ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs rounded-lg"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      ) : subscriptions.length === 0 ? (
        <Card className="border-slate-200/80">
          <CardContent className="py-16 text-center">
            <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-600">No subscriptions found</p>
            <p className="text-xs text-slate-400 mt-1">Adjust your filters or wait for users to subscribe.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-sm">
          {/* Table header */}
          <div className="grid grid-cols-[1.2fr_100px_100px_120px_120px_70px] gap-3 px-4 py-3 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            <span>Creator</span>
            <span>Plan</span>
            <span>Status</span>
            <span>Started</span>
            <span>Renews / Expires</span>
            <span className="text-right">Actions</span>
          </div>

          {/* Table rows */}
          <div className="divide-y divide-slate-100">
            {subscriptions.map((sub: any) => {
              const planConf = PLAN_BADGES[sub.plan] || PLAN_BADGES.free;
              const statusConf = STATUS_BADGES[sub.subscriptionStatus] || STATUS_BADGES.inactive;

              return (
                <div
                  key={sub.workspaceId}
                  className="grid grid-cols-[1.2fr_100px_100px_120px_120px_70px] gap-3 px-4 py-3 items-center hover:bg-slate-50/50 transition-colors"
                >
                  {/* Creator */}
                  <div className="min-w-0 flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-violet-100 flex items-center justify-center text-xs font-bold text-violet-700 shrink-0">
                      {(sub.userName || "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{sub.userName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{sub.userEmail}</p>
                    </div>
                  </div>

                  {/* Plan */}
                  <div>
                    <Badge className={`${planConf.color} border text-[10px] font-bold`}>
                      {planConf.label}
                    </Badge>
                  </div>

                  {/* Status */}
                  <div>
                    <Badge className={`${statusConf.color} border text-[10px] font-bold`}>
                      {statusConf.label}
                    </Badge>
                  </div>

                  {/* Started */}
                  <div>
                    <p className="text-[11px] text-slate-600">{formatDate(sub.subscriptionStart)}</p>
                  </div>

                  {/* Renews/Expires */}
                  <div>
                    <p className="text-[11px] text-slate-600">{formatDate(sub.subscriptionEnd)}</p>
                    {sub.daysUntilRenewal !== null && sub.daysUntilRenewal > 0 && sub.daysUntilRenewal <= 7 && (
                      <p className="text-[10px] font-bold text-amber-600 flex items-center gap-0.5 mt-0.5">
                        <AlertTriangle className="h-3 w-3" />
                        {sub.daysUntilRenewal}d left
                      </p>
                    )}
                    {sub.isExpired && (
                      <p className="text-[10px] font-bold text-red-600 mt-0.5">Expired</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                          <MoreVertical className="h-4 w-4 text-slate-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={() => setSelectedSub(sub)}>
                          <Eye className="h-3.5 w-3.5 mr-2" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditPlan(sub)}>
                          <Edit2 className="h-3.5 w-3.5 mr-2" /> Change Plan
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {sub.subscriptionStatus === "active" && (
                          <DropdownMenuItem onClick={() => handleCancel(sub)} className="text-red-600">
                            <Ban className="h-3.5 w-3.5 mr-2" /> Cancel Subscription
                          </DropdownMenuItem>
                        )}
                        {sub.subscriptionStatus === "canceled" && (
                          <DropdownMenuItem onClick={() => updateSubscription(sub.workspaceId, { plan: "pro", subscription_status: "active" })}>
                            <Sparkles className="h-3.5 w-3.5 mr-2" /> Reactivate Pro
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Subscription Detail Dialog */}
      <Dialog open={!!selectedSub} onOpenChange={() => setSelectedSub(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-violet-600" />
              Subscription Details
            </DialogTitle>
          </DialogHeader>
          {selectedSub && (
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="h-12 w-12 rounded-full bg-violet-100 flex items-center justify-center text-lg font-bold text-violet-700">
                  {(selectedSub.userName || "?").charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-slate-900">{selectedSub.userName}</p>
                  <p className="text-xs text-slate-500">{selectedSub.userEmail}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Plan</p>
                  <Badge className={`${PLAN_BADGES[selectedSub.plan]?.color || ""} border text-xs font-bold`}>
                    {PLAN_BADGES[selectedSub.plan]?.label || selectedSub.plan}
                  </Badge>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Status</p>
                  <Badge className={`${STATUS_BADGES[selectedSub.subscriptionStatus]?.color || ""} border text-xs font-bold`}>
                    {STATUS_BADGES[selectedSub.subscriptionStatus]?.label || selectedSub.subscriptionStatus}
                  </Badge>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Period Start</p>
                  <p className="text-xs font-semibold text-slate-800">{formatDate(selectedSub.subscriptionStart)}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Period End</p>
                  <p className="text-xs font-semibold text-slate-800">{formatDate(selectedSub.subscriptionEnd)}</p>
                  {selectedSub.daysUntilRenewal !== null && selectedSub.daysUntilRenewal > 0 && (
                    <p className="text-[10px] text-amber-600 font-bold mt-0.5">{selectedSub.daysUntilRenewal} days remaining</p>
                  )}
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Workspace ID</p>
                  <p className="text-[11px] font-mono text-slate-600 break-all">{selectedSub.workspaceId}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Last Payment ID</p>
                  <p className="text-[11px] font-mono text-slate-600 break-all">{selectedSub.razorpayPaymentId || "—"}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Plan Dialog */}
      <Dialog open={editPlanOpen} onOpenChange={setEditPlanOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Change Plan</DialogTitle>
          </DialogHeader>
          {editTarget && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Change plan for <span className="font-bold text-slate-900">{editTarget.userName}</span>
              </p>
              <Select value={newPlan} onValueChange={setNewPlan}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="pro">Pro (Monthly)</SelectItem>
                  <SelectItem value="pro_annual">Pro (Annual)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditPlanOpen(false)}>Cancel</Button>
            <Button onClick={handleSavePlan} className="bg-violet-600 hover:bg-violet-700 text-white">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
