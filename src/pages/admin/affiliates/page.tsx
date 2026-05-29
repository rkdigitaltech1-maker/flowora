import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  Users, DollarSign, TrendingUp, Eye, CheckCircle2, XCircle,
  Clock, Search, MoreVertical, Download,
  Wallet, Settings, AlertTriangle, Ban, UserCheck,
  Mail, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { supabase } from "@/lib/supabase.ts";

// Hook to fetch real affiliate data from Supabase
function useAdminAffiliates() {
  const [affiliates, setAffiliates] = useState<any[]>([]);
  const [pendingPayouts, setPendingPayouts] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAffiliates = useCallback(async () => {
    try {
      const [affRes, payoutRes] = await Promise.all([
        supabase.from("affiliates").select("*").order("created_at", { ascending: false }),
        supabase.from("affiliate_payouts").select("*").eq("status", "pending").order("created_at", { ascending: false }),
      ]);

      const affData = affRes.data ?? [];
      const payoutData = payoutRes.data ?? [];

      setAffiliates(affData.map((a: any) => ({
        id: a.id,
        fullName: a.full_name || a.name || "Unknown",
        email: a.email || "—",
        affiliateCode: a.affiliate_code || a.code || "—",
        status: a.status || "pending",
        totalReferrals: a.total_referrals || 0,
        totalConversions: a.total_conversions || 0,
        totalEarnings: a.total_earnings || 0,
        pendingBalance: a.pending_balance || 0,
        paymentMethod: a.payment_method || "upi",
        createdAt: a.created_at,
        channels: a.channels || [],
      })));

      setPendingPayouts(payoutData.map((p: any) => ({
        id: p.id,
        affiliateName: p.affiliate_name || "Unknown",
        email: p.affiliate_email || "—",
        amount: p.amount || 0,
        method: p.method || "UPI",
        requestedAt: p.created_at?.slice(0, 10) || "—",
      })));

      // Compute stats from real data
      const activeAffiliates = affData.filter((a: any) => a.status === "active").length;
      const pendingApplications = affData.filter((a: any) => a.status === "pending").length;
      const totalEarnings = affData.reduce((sum: number, a: any) => sum + (a.total_earnings || 0), 0);
      const totalCommissionsPaid = affData.reduce((sum: number, a: any) => sum + ((a.total_earnings || 0) - (a.pending_balance || 0)), 0);
      const pendingPayoutsTotal = affData.reduce((sum: number, a: any) => sum + (a.pending_balance || 0), 0);
      const totalReferrals = affData.reduce((sum: number, a: any) => sum + (a.total_referrals || 0), 0);
      const totalConversions = affData.reduce((sum: number, a: any) => sum + (a.total_conversions || 0), 0);
      const conversionRate = totalReferrals > 0 ? ((totalConversions / totalReferrals) * 100).toFixed(1) : "0";

      setStats({
        totalAffiliates: affData.length,
        activeAffiliates,
        pendingApplications,
        totalRevenue: totalEarnings,
        totalCommissionsPaid,
        pendingPayouts: pendingPayoutsTotal,
        totalReferrals,
        conversionRate: parseFloat(conversionRate as string),
      });

      setLoading(false);
    } catch (err) {
      console.error("Error fetching affiliates:", err);
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAffiliates(); }, [fetchAffiliates]);

  const updateAffiliateStatus = async (id: string, status: string) => {
    try {
      await supabase.from("affiliates").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
      fetchAffiliates();
    } catch (err: any) {
      toast.error(err.message || "Failed to update affiliate");
    }
  };

  const processPayoutAction = async (id: string) => {
    try {
      await supabase.from("affiliate_payouts").update({ status: "processing", updated_at: new Date().toISOString() }).eq("id", id);
      fetchAffiliates();
    } catch (err: any) {
      toast.error(err.message || "Failed to process payout");
    }
  };

  return { affiliates, pendingPayouts, stats, loading, updateAffiliateStatus, processPayoutAction, refetch: fetchAffiliates };
}

type AdminTab = "affiliates" | "payouts" | "settings";
type StatusFilter = "all" | "active" | "pending" | "suspended" | "rejected";

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; dot: string }> = {
    active: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
    pending: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
    suspended: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
    rejected: { bg: "bg-gray-50", text: "text-gray-600", dot: "bg-gray-400" },
    approved: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  };
  const c = config[status] || config.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}


export default function AdminAffiliatesPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("affiliates");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { affiliates, pendingPayouts, stats: programStats, loading, updateAffiliateStatus, processPayoutAction, refetch } = useAdminAffiliates();

  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
    toast.success("Affiliates refreshed");
  };

  const filteredAffiliates = affiliates.filter((a) => {
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    const matchesSearch = !searchQuery || 
      a.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.affiliateCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const approveAffiliate = (id: string) => {
    updateAffiliateStatus(id, "active");
    toast.success("Affiliate approved! They will receive an email notification.");
  };

  const rejectAffiliate = (id: string) => {
    updateAffiliateStatus(id, "rejected");
    toast.error("Affiliate application rejected.");
  };

  const suspendAffiliate = (id: string) => {
    updateAffiliateStatus(id, "suspended");
    toast.warning("Affiliate account suspended.");
  };

  const processPayout = (id: string) => {
    processPayoutAction(id);
    toast.success("Payout marked as processing. Complete the transfer and confirm.");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Affiliate Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage affiliates, payouts, and program settings</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-xs" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
            Sync
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export CSV
          </Button>
        </div>
      </div>


      {/* Overview Stats */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : programStats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-purple-500" />
              <span className="text-[10px] font-bold text-gray-500 uppercase">Total Affiliates</span>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{programStats.totalAffiliates}</p>
            <p className="text-[10px] text-emerald-600 font-bold mt-1">{programStats.activeAffiliates} active</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span className="text-[10px] font-bold text-gray-500 uppercase">Pending Applications</span>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{programStats.pendingApplications}</p>
            <p className="text-[10px] text-amber-600 font-bold mt-1">Needs review</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] font-bold text-gray-500 uppercase">Total Commissions</span>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">₹{programStats.totalCommissionsPaid.toLocaleString()}</p>
            <p className="text-[10px] text-gray-500 font-bold mt-1">₹{programStats.pendingPayouts.toLocaleString()} pending</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span className="text-[10px] font-bold text-gray-500 uppercase">Conversion Rate</span>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{programStats.conversionRate}%</p>
            <p className="text-[10px] text-gray-500 font-bold mt-1">{programStats.totalReferrals} total referrals</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-800 rounded-xl p-1">
        {[
          { id: "affiliates" as AdminTab, label: "Affiliates", icon: Users },
          { id: "payouts" as AdminTab, label: "Pending Payouts", icon: Wallet, badge: pendingPayouts.length || undefined },
          { id: "settings" as AdminTab, label: "Program Settings", icon: Settings },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === tab.id
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
            {tab.badge && (
              <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{tab.badge}</span>
            )}
          </button>
        ))}
      </div>


      {/* Affiliates Tab */}
      {activeTab === "affiliates" && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
          {/* Filters */}
          <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or code..."
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-slate-600 text-sm focus:border-purple-400 outline-none bg-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              {(["all", "active", "pending", "suspended", "rejected"] as StatusFilter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === f
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                      : "text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700"
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-700">
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Affiliate</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Code</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                  <th className="text-center py-3 px-4 text-xs font-bold text-gray-500 uppercase">Referrals</th>
                  <th className="text-center py-3 px-4 text-xs font-bold text-gray-500 uppercase">Conversions</th>
                  <th className="text-right py-3 px-4 text-xs font-bold text-gray-500 uppercase">Earnings</th>
                  <th className="text-right py-3 px-4 text-xs font-bold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAffiliates.map((aff) => (
                  <tr key={aff.id} className="border-b border-gray-50 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-xs font-bold text-purple-600">
                          {aff.fullName.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-white text-sm">{aff.fullName}</p>
                          <p className="text-[10px] text-gray-400">{aff.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <code className="text-xs bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded font-mono">{aff.affiliateCode}</code>
                    </td>
                    <td className="py-3 px-4"><StatusBadge status={aff.status} /></td>
                    <td className="py-3 px-4 text-center font-medium">{aff.totalReferrals}</td>
                    <td className="py-3 px-4 text-center font-medium">{aff.totalConversions}</td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-600">₹{aff.totalEarnings.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer">
                            <MoreVertical className="w-4 h-4 text-gray-400" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => toast.info(`Viewing ${aff.fullName}`)}>
                            <Eye className="w-3.5 h-3.5 mr-2" /> View Details
                          </DropdownMenuItem>
                          {aff.status === "pending" && (
                            <>
                              <DropdownMenuItem onClick={() => approveAffiliate(aff.id)}>
                                <UserCheck className="w-3.5 h-3.5 mr-2 text-emerald-500" /> Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => rejectAffiliate(aff.id)} className="text-red-600">
                                <XCircle className="w-3.5 h-3.5 mr-2" /> Reject
                              </DropdownMenuItem>
                            </>
                          )}
                          {aff.status === "active" && (
                            <DropdownMenuItem onClick={() => suspendAffiliate(aff.id)} className="text-red-600">
                              <Ban className="w-3.5 h-3.5 mr-2" /> Suspend
                            </DropdownMenuItem>
                          )}
                          {aff.status === "suspended" && (
                            <DropdownMenuItem onClick={() => approveAffiliate(aff.id)}>
                              <UserCheck className="w-3.5 h-3.5 mr-2 text-emerald-500" /> Reactivate
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>
                            <Mail className="w-3.5 h-3.5 mr-2" /> Send Email
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAffiliates.length === 0 && (
            <div className="p-8 text-center text-gray-500 text-sm">
              No affiliates found matching your filters.
            </div>
          )}
        </div>
      )}


      {/* Payouts Tab */}
      {activeTab === "payouts" && (
        <div className="space-y-4">
          {/* Pending Payouts */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
            <div className="p-4 border-b border-gray-100 dark:border-slate-700">
              <h3 className="font-bold text-slate-800 dark:text-white">Pending Payout Requests</h3>
              <p className="text-xs text-gray-500 mt-0.5">{pendingPayouts.length} requests waiting for processing</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-slate-700">
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Affiliate</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Method</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Requested</th>
                    <th className="text-right py-3 px-4 text-xs font-bold text-gray-500 uppercase">Amount</th>
                    <th className="text-right py-3 px-4 text-xs font-bold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingPayouts.map((payout) => (
                    <tr key={payout.id} className="border-b border-gray-50 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30">
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-800 dark:text-white">{payout.affiliateName}</p>
                        <p className="text-[10px] text-gray-400">{payout.email}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs font-bold bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded">{payout.method}</span>
                      </td>
                      <td className="py-3 px-4 text-gray-500">{payout.requestedAt}</td>
                      <td className="py-3 px-4 text-right font-black text-slate-900 dark:text-white">₹{payout.amount.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Button size="sm" onClick={() => processPayout(payout.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs cursor-pointer">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Process
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => toast.error("Payout rejected")} className="text-xs cursor-pointer text-red-600 border-red-200 hover:bg-red-50">
                            <XCircle className="w-3 h-3 mr-1" /> Reject
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payout Summary */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5">
              <p className="text-xs text-gray-500 font-bold uppercase">Total Pending</p>
              <p className="text-2xl font-black text-amber-600 mt-1">₹{(programStats?.pendingPayouts || 0).toLocaleString()}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5">
              <p className="text-xs text-gray-500 font-bold uppercase">Paid This Month</p>
              <p className="text-2xl font-black text-emerald-600 mt-1">₹0</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5">
              <p className="text-xs text-gray-500 font-bold uppercase">All-Time Paid</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">₹{(programStats?.totalCommissionsPaid || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}


      {/* Settings Tab */}
      {activeTab === "settings" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4">Program Configuration</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Commission Rate (%)</label>
                <input type="number" defaultValue={25} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-600 text-sm bg-transparent" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Commission Duration (months)</label>
                <input type="number" defaultValue={11} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-600 text-sm bg-transparent" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Minimum Payout (₹)</label>
                <input type="number" defaultValue={500} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-600 text-sm bg-transparent" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Cookie Duration (days)</label>
                <input type="number" defaultValue={30} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-600 text-sm bg-transparent" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Payout Frequency</label>
                <select className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-600 text-sm bg-transparent">
                  <option value="monthly">Monthly</option>
                  <option value="bi-weekly">Bi-Weekly</option>
                  <option value="on-demand">On Demand</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Auto-Approve Affiliates</label>
                <select className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-600 text-sm bg-transparent">
                  <option value="false">No (Manual Review)</option>
                  <option value="true">Yes (Auto-Approve)</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-3">
              <Button onClick={() => toast.success("Settings saved!")} className="bg-purple-600 hover:bg-purple-700 text-white text-xs cursor-pointer">
                Save Settings
              </Button>
              <Button variant="outline" className="text-xs cursor-pointer">
                Reset to Defaults
              </Button>
            </div>
          </div>

          {/* Program Status */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white">Program Status</h3>
                <p className="text-xs text-gray-500 mt-0.5">Toggle the affiliate program on or off</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-emerald-600">Active</span>
                <button className="w-12 h-6 bg-emerald-500 rounded-full relative cursor-pointer transition-colors">
                  <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 shadow-sm transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-red-200 dark:border-red-900/50 p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-red-700 dark:text-red-400">Danger Zone</h3>
                <p className="text-xs text-gray-500 mt-1">These actions are irreversible. Proceed with caution.</p>
                <div className="flex items-center gap-3 mt-4">
                  <Button variant="outline" size="sm" className="text-xs border-red-200 text-red-600 hover:bg-red-50 cursor-pointer">
                    Suspend All Affiliates
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs border-red-200 text-red-600 hover:bg-red-50 cursor-pointer">
                    Reset Commission Rates
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
