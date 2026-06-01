import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Archive,
  Zap,
  Play,
  Pause,
  Trash2,
  MoreVertical,
  MessageCircle,
  Clock,
  Users,
  TrendingUp,
  Filter,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils.ts";
import { Button } from "@/components/ui/button.tsx";
import { useWorkflows } from "@/lib/supabase-hooks.ts";
import { toast } from "sonner";

type TabType = "active" | "archived";

export default function AutomationsListPage() {
  const navigate = useNavigate();
  const { workflows, loading, deleteWorkflow, updateWorkflowStatus } = useWorkflows();
  const [activeTab, setActiveTab] = useState<TabType>("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [triggerFilter, setTriggerFilter] = useState("all");

  const filteredWorkflows = (workflows || []).filter((wf: any) => {
    const matchesTab = activeTab === "active"
      ? wf.status === "active" || wf.status === "draft"
      : wf.status === "archived";
    const matchesSearch = !searchQuery || wf.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTrigger = triggerFilter === "all" || wf.triggerType === triggerFilter;
    return matchesTab && matchesSearch && matchesTrigger;
  });

  const activeCount = (workflows || []).filter((wf: any) => wf.status === "active" || wf.status === "draft").length;
  const archivedCount = (workflows || []).filter((wf: any) => wf.status === "archived").length;
  const totalLimit = 1000; // Plan limit

  const handleToggleStatus = async (wfId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "paused" : "active";
    await updateWorkflowStatus(wfId, newStatus);
    toast.success(`Automation ${newStatus === "active" ? "activated" : "paused"}`);
  };

  const handleArchive = async (wfId: string) => {
    await updateWorkflowStatus(wfId, "archived");
    toast.success("Automation archived");
  };

  const handleDelete = async (wfId: string) => {
    await deleteWorkflow(wfId);
    toast.success("Automation deleted");
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-120px)] flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-[#6d48ff]" />
        <p className="text-sm font-semibold text-gray-500">Loading automations...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-6 lg:px-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Zap className="h-5 w-5 text-purple-600" />
          Automations
        </h1>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 font-medium">
            {activeCount} / {totalLimit.toLocaleString()}
          </span>
          <Button
            onClick={() => navigate("/dashboard/automations/create?type=comment")}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg px-4 py-2.5 flex items-center gap-2"
          >
            <Plus className="h-3.5 w-3.5" />
            New Automation
          </Button>
        </div>
      </div>

      {/* Tabs + Search + Filter Row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab("active")}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all",
              activeTab === "active"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "text-gray-500 hover:text-gray-700 border border-transparent"
            )}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Active
          </button>
          <button
            onClick={() => setActiveTab("archived")}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all",
              activeTab === "archived"
                ? "bg-gray-100 text-gray-700 border border-gray-200"
                : "text-gray-500 hover:text-gray-700 border border-transparent"
            )}
          >
            <Archive className="h-3.5 w-3.5" />
            Archived
          </button>
          <button
            onClick={() => setTriggerFilter(triggerFilter === "all" ? "instagram_comment" : "all")}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all",
              triggerFilter !== "all"
                ? "bg-purple-50 text-purple-700 border border-purple-200"
                : "text-gray-500 hover:text-gray-700 border border-transparent"
            )}
          >
            <Filter className="h-3.5 w-3.5" />
            All Triggers
          </button>
        </div>

        <div className="flex-1 sm:max-w-xs">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search automations"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      {filteredWorkflows.length === 0 ? (
        /* Empty State */
        <div className="rounded-2xl border border-gray-200 bg-white p-12 shadow-sm">
          <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
            {/* DM Preview Mockup */}
            <div className="mb-8 w-full max-w-sm">
              <div className="rounded-2xl bg-gray-50 border border-gray-100 p-6 shadow-sm">
                <p className="text-[11px] text-gray-400 text-center mb-4">
                  @flowora messaged you about a comment you made in their post
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shrink-0 mt-0.5" />
                    <div className="bg-white rounded-2xl rounded-tl-sm border border-gray-100 p-3 shadow-sm max-w-[80%]">
                      <p className="text-sm text-gray-800">Hey!! 👋</p>
                      <p className="text-sm text-gray-800">Here's the link — let's grow together! 🚀</p>
                      <div className="mt-2 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs font-semibold text-gray-700">
                        Get Guide
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-blue-500 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[70%]">
                      <p className="text-sm font-medium">Thanks that was fast!!</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-xl font-bold text-slate-900">Launch your first automation</h2>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              Automate conversations and watch your DMs do the work for you
            </p>
            <Button
              onClick={() => navigate("/dashboard/automations/create?type=comment")}
              className="mt-6 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-lg px-6 py-3 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Start Automating
            </Button>

            {/* Progress indicator */}
            <div className="mt-8 flex items-center gap-2 text-xs text-gray-400">
              <span>{activeCount} / 3</span>
            </div>
          </div>
        </div>
      ) : (
        /* Automation Cards List */
        <div className="space-y-3">
          {filteredWorkflows.map((wf: any) => (
            <div
              key={wf.id || wf._id}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-gray-300 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Status indicator */}
                  <div className={cn(
                    "h-9 w-9 rounded-xl flex items-center justify-center",
                    wf.status === "active" ? "bg-emerald-50" : wf.status === "paused" ? "bg-amber-50" : "bg-gray-50"
                  )}>
                    {wf.status === "active" ? (
                      <Play className="h-4 w-4 text-emerald-600 fill-emerald-600" />
                    ) : wf.status === "paused" ? (
                      <Pause className="h-4 w-4 text-amber-600" />
                    ) : (
                      <Clock className="h-4 w-4 text-gray-400" />
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{wf.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {(wf.triggerType || "manual").replace(/_/g, " ")}
                      </span>
                      {wf.lastRunAt && (
                        <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Last run: {new Date(wf.lastRunAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleToggleStatus(wf.id || wf._id, wf.status)}
                    className="text-xs font-semibold text-gray-500 hover:text-purple-600 border border-gray-200 hover:border-purple-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {wf.status === "active" ? "Pause" : "Activate"}
                  </button>
                  <button
                    onClick={() => handleArchive(wf.id || wf._id)}
                    className="text-xs font-semibold text-gray-500 hover:text-amber-600 border border-gray-200 hover:border-amber-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Archive
                  </button>
                  <button
                    onClick={() => handleDelete(wf.id || wf._id)}
                    className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
