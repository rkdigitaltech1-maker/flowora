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
  AlertTriangle, ShieldAlert, CheckCircle, Ban,
  Search, RefreshCw, Check, X, ShieldCheck
} from "lucide-react";

export default function AdminFlaggedAccountsPage() {
  const { token } = useAdminAuth();
  const { stats, loading: statsLoading } = useAdminStats();
  const { updateCreatorStatus } = useAdminCreators();
  const updateStatus = async (args: { adminToken: string; workspaceId: string; status: string }) => {
    await updateCreatorStatus(args.workspaceId, args.status);
  };

  // States
  const [searchTerm, setSearchTerm] = useState("");
  const [riskTab, setRiskTab] = useState<"all" | "high" | "medium" | "low">("all");
  const [dismissedList, setDismissedList] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  if (statsLoading || !stats) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-60" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  // Filter flaggedList
  const allFlags = stats.flaggedList.filter((f) => !dismissedList.includes(f.id));

  const filteredFlags = allFlags.filter((f) => {
    // Search filter
    const matchesSearch =
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.reason.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    // Risk level tab filter
    if (riskTab === "all") return true;
    return f.risk.toLowerCase().includes(riskTab);
  });

  // Action: toggle status (suspend/activate)
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
      toast.success(`Creator "${name}" status updated to ${nextStatus}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  // Action: dismiss flag
  const handleDismiss = (id: string) => {
    setDismissedList((prev) => [...prev, id]);
    setSelectedIds((prev) => prev.filter((item) => item !== id));
    toast.success("Flag dismissed successfully");
  };

  // Bulk Suspend Selected
  const handleBulkSuspend = async () => {
    const selectedFlags = allFlags.filter((f) => selectedIds.includes(f.id));
    const targetWorkspaces = selectedFlags.filter((f) => f.workspaceId && f.status !== "suspended");
    
    if (targetWorkspaces.length === 0) {
      toast.error("No active real workspaces selected for suspension.");
      return;
    }

    const confirmed = confirm(`Are you sure you want to suspend the ${targetWorkspaces.length} selected active creators?`);
    if (!confirmed) return;

    let successCount = 0;
    for (const workspace of targetWorkspaces) {
      try {
        await updateStatus({
          adminToken: token ?? "",
          workspaceId: workspace.workspaceId as any,
          status: "suspended",
        });
        successCount++;
      } catch (err: any) {
        toast.error(`Failed to suspend ${workspace.name}: ${err.message}`);
      }
    }

    if (successCount > 0) {
      toast.success(`Successfully suspended ${successCount} accounts.`);
      setSelectedIds([]);
    }
  };

  // Bulk Dismiss Selected
  const handleBulkDismiss = () => {
    if (selectedIds.length === 0) return;
    setDismissedList((prev) => [...prev, ...selectedIds]);
    setSelectedIds([]);
    toast.success("Selected flags dismissed");
  };

  // Selection handlers
  const handleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const currentlyFilteredIds = filteredFlags.map((f) => f.id);
    const allSelected = currentlyFilteredIds.every((id) => selectedIds.includes(id));

    if (allSelected) {
      // Unselect only the currently filtered ones
      setSelectedIds((prev) => prev.filter((id) => !currentlyFilteredIds.includes(id)));
    } else {
      // Add all currently filtered ones (avoid duplicates)
      setSelectedIds((prev) => Array.from(new Set([...prev, ...currentlyFilteredIds])));
    }
  };

  // Compute stat counters
  const highRiskCount = allFlags.filter((f) => f.risk.toLowerCase().includes("high")).length;
  const mediumRiskCount = allFlags.filter((f) => f.risk.toLowerCase().includes("medium")).length;
  const lowRiskCount = allFlags.filter((f) => f.risk.toLowerCase().includes("low")).length;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-500" />
            Security & Risk Auditing
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit automatic platform alerts, check violations, and manage creator suspension statuses.
          </p>
        </div>
      </div>

      {/* Overview Stat Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-white dark:bg-slate-900 rounded-2xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Alerts</p>
              <p className="text-xl font-black text-slate-900 dark:text-white leading-none mt-1">
                {allFlags.length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white dark:bg-slate-900 rounded-2xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/20 flex items-center justify-center text-red-650">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider">High Risk</p>
              <p className="text-xl font-black text-red-650 leading-none mt-1">{highRiskCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white dark:bg-slate-900 rounded-2xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center text-amber-650">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Medium Risk</p>
              <p className="text-xl font-black text-amber-650 leading-none mt-1">{mediumRiskCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white dark:bg-slate-900 rounded-2xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center text-blue-650">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Low Risk</p>
              <p className="text-xl font-black text-blue-650 leading-none mt-1">{lowRiskCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Audit List Section */}
      <Card className="border-0 shadow-sm bg-white dark:bg-slate-900 rounded-2xl">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Risk Filters Tabs */}
            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
              {(["all", "high", "medium", "low"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRiskTab(r)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                    riskTab === r
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {r} Alerts
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <Input
                  placeholder="Search alert detail..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8.5 h-8 text-xs w-48 rounded-xl bg-slate-50/50 border-slate-200"
                />
              </div>

              {/* Bulk Actions */}
              {selectedIds.length > 0 && (
                <div className="flex items-center gap-1.5 transition-all">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleBulkSuspend}
                    className="h-8 text-[11px] font-bold rounded-lg cursor-pointer"
                  >
                    Bulk Suspend ({selectedIds.length})
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleBulkDismiss}
                    className="h-8 text-[11px] font-bold rounded-lg cursor-pointer"
                  >
                    Bulk Dismiss
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/40 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4 w-4">
                    <input
                      type="checkbox"
                      className="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                      checked={
                        filteredFlags.length > 0 &&
                        filteredFlags.every((f) => selectedIds.includes(f.id))
                      }
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="py-3 px-4">Creator</th>
                  <th className="py-3 px-4">Risk Level</th>
                  <th className="py-3 px-4">Trigger Violation Details</th>
                  <th className="py-3 px-4">Workspace Status</th>
                  <th className="py-3 px-4 text-right">Review Action</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {filteredFlags.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-xs text-slate-400">
                        No alerts matching active filters.
                      </td>
                    </tr>
                  ) : (
                    filteredFlags.map((item) => {
                      const isSuspended = item.status === "suspended";
                      const isRowSelected = selectedIds.includes(item.id);

                      return (
                        <tr
                          key={item.id}
                          className={`border-b border-slate-50 dark:border-slate-800/40 hover:bg-slate-50/30 dark:hover:bg-slate-800/10 transition-colors text-xs ${
                            isRowSelected ? "bg-indigo-50/20 dark:bg-indigo-950/10" : ""
                          }`}
                        >
                          <td className="py-3.5 px-4">
                            <input
                              type="checkbox"
                              className="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                              checked={isRowSelected}
                              onChange={() => handleSelectRow(item.id)}
                            />
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <Avatar className="h-7 w-7">
                                <AvatarFallback className="bg-slate-100 text-slate-700 text-[10px] font-bold">
                                  {item.name.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <span className="font-semibold block text-slate-800 dark:text-slate-200">
                                  {item.name}
                                </span>
                                <span className="text-[10px] text-slate-400">@{item.username}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border capitalize ${
                              item.risk.toLowerCase().includes("high")
                                ? "bg-red-50 text-red-600 border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900"
                                : "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900"
                            }`}>
                              {item.risk}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 max-w-sm">
                            <div className="space-y-0.5">
                              <span className="font-medium text-slate-700 dark:text-slate-350 block">
                                {item.reason}
                              </span>
                              <span className="text-[9px] text-slate-400 block">{item.time}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="flex items-center gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${isSuspended ? "bg-red-500" : "bg-emerald-500"}`} />
                              <span className="font-medium capitalize text-slate-500 dark:text-slate-400">
                                {item.status}
                              </span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-1.5">
                            {item.workspaceId ? (
                              <Button
                                size="sm"
                                variant={isSuspended ? "outline" : "destructive"}
                                className="h-7 text-[10px] font-bold rounded-lg cursor-pointer"
                                onClick={() => handleToggleStatus(item.workspaceId!, item.status, item.name)}
                              >
                                {isSuspended ? "Activate" : "Suspend"}
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-7 text-[10px] font-bold rounded-lg cursor-pointer"
                                onClick={() => toast.error("No real workspace ID associated with this row.")}
                              >
                                Suspend
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-[10px] text-slate-400 hover:text-slate-750 hover:bg-slate-50 rounded-lg cursor-pointer"
                              onClick={() => handleDismiss(item.id)}
                            >
                              Dismiss
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
