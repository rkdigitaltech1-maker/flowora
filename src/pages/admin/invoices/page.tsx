import { useState } from "react";
import { useAdminPaymentOrders } from "@/lib/supabase-hooks.ts";
import { useDebounce } from "@/hooks/use-debounce.ts";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog.tsx";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { toast } from "sonner";
import {
  Search, Receipt, IndianRupee, DollarSign, CheckCircle2,
  XCircle, Clock, RefreshCw, MoreVertical, Eye, Ban,
  ArrowUpRight, Download, CreditCard, AlertTriangle
} from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  created: { label: "Pending", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
  paid: { label: "Paid", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  failed: { label: "Failed", color: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
  signature_failed: { label: "Signature Failed", color: "bg-red-100 text-red-700 border-red-200", icon: AlertTriangle },
  refunded: { label: "Refunded", color: "bg-slate-100 text-slate-600 border-slate-200", icon: Ban },
};

function formatAmount(amount: number, currency: string) {
  const value = amount / 100; // Convert from paise/cents
  if (currency === "INR") return `₹${value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
  });
}

export default function AdminInvoicesPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch] = useDebounce(searchQuery, 300);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const { orders, loading, stats, updateOrderStatus, refetch } = useAdminPaymentOrders({
    status: statusFilter,
    search: debouncedSearch,
  });

  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
    toast.success("Invoices refreshed");
  };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Invoices & Payment Orders</h1>
          <p className="text-sm text-slate-500 mt-0.5">Track all Razorpay payment orders and their statuses</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1.5" />
            Export CSV
          </Button>
        </div>
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
                  <Receipt className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900">{stats.totalOrders}</p>
                  <p className="text-xs text-slate-500 font-medium">Total Orders</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-black text-emerald-700">{stats.paidCount}</p>
                  <p className="text-xs text-slate-500 font-medium">Successful</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <IndianRupee className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900">₹{stats.totalRevenueINR.toLocaleString("en-IN")}</p>
                  <p className="text-xs text-slate-500 font-medium">Revenue (INR)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900">${stats.totalRevenueUSD.toLocaleString("en-US")}</p>
                  <p className="text-xs text-slate-500 font-medium">Revenue (USD)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full sm:w-auto">
          <TabsList className="bg-slate-100 h-9">
            <TabsTrigger value="all" className="text-xs font-bold">All</TabsTrigger>
            <TabsTrigger value="paid" className="text-xs font-bold">Paid</TabsTrigger>
            <TabsTrigger value="created" className="text-xs font-bold">Pending</TabsTrigger>
            <TabsTrigger value="failed" className="text-xs font-bold">Failed</TabsTrigger>
            <TabsTrigger value="refunded" className="text-xs font-bold">Refunded</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by order ID, name, email..."
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
      ) : orders.length === 0 ? (
        <Card className="border-slate-200/80">
          <CardContent className="py-16 text-center">
            <Receipt className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-600">No invoices yet</p>
            <p className="text-xs text-slate-400 mt-1">Payment orders will appear here once users start upgrading.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-sm">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_1fr_120px_100px_120px_80px] gap-3 px-4 py-3 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            <span>Order / User</span>
            <span>Plan & Interval</span>
            <span>Amount</span>
            <span>Status</span>
            <span>Date</span>
            <span className="text-right">Actions</span>
          </div>

          {/* Table rows */}
          <div className="divide-y divide-slate-100">
            {orders.map((order: any) => {
              const statusConf = STATUS_CONFIG[order.status] || STATUS_CONFIG.created;
              const StatusIcon = statusConf.icon;

              return (
                <div
                  key={order.id || order.order_id}
                  className="grid grid-cols-[1fr_1fr_120px_100px_120px_80px] gap-3 px-4 py-3 items-center hover:bg-slate-50/50 transition-colors"
                >
                  {/* Order & User */}
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {order.order_id || "—"}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">{order.userName} • {order.userEmail}</p>
                  </div>

                  {/* Plan */}
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-700 capitalize">{order.plan_id || "pro"}</p>
                    <p className="text-[11px] text-slate-400 capitalize">{order.billing_interval || "—"}</p>
                    {order.promo_code && (
                      <Badge variant="outline" className="text-[9px] mt-0.5 border-violet-200 text-violet-600">{order.promo_code}</Badge>
                    )}
                  </div>

                  {/* Amount */}
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      {formatAmount(order.amount, order.currency)}
                    </p>
                    <p className="text-[10px] text-slate-400">{order.currency}</p>
                  </div>

                  {/* Status */}
                  <div>
                    <Badge className={`${statusConf.color} border text-[10px] font-bold gap-1`}>
                      <StatusIcon className="h-3 w-3" />
                      {statusConf.label}
                    </Badge>
                  </div>

                  {/* Date */}
                  <div>
                    <p className="text-[11px] text-slate-600">{formatDate(order.created_at)}</p>
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
                        <DropdownMenuItem onClick={() => setSelectedOrder(order)}>
                          <Eye className="h-3.5 w-3.5 mr-2" /> View Details
                        </DropdownMenuItem>
                        {order.payment_id && (
                          <DropdownMenuItem onClick={() => {
                            window.open(`https://dashboard.razorpay.com/app/payments/${order.payment_id}`, "_blank");
                          }}>
                            <ArrowUpRight className="h-3.5 w-3.5 mr-2" /> Open in Razorpay
                          </DropdownMenuItem>
                        )}
                        {order.status === "paid" && (
                          <DropdownMenuItem onClick={() => updateOrderStatus(order.order_id, "refunded")} className="text-red-600">
                            <Ban className="h-3.5 w-3.5 mr-2" /> Mark Refunded
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

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-violet-600" />
              Payment Order Details
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Order ID</p>
                  <p className="text-xs font-mono font-bold text-slate-800 break-all">{selectedOrder.order_id}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Payment ID</p>
                  <p className="text-xs font-mono font-bold text-slate-800 break-all">{selectedOrder.payment_id || "—"}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Amount</p>
                  <p className="text-lg font-black text-slate-900">{formatAmount(selectedOrder.amount, selectedOrder.currency)}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Status</p>
                  <Badge className={`${STATUS_CONFIG[selectedOrder.status]?.color || ""} border text-xs font-bold`}>
                    {STATUS_CONFIG[selectedOrder.status]?.label || selectedOrder.status}
                  </Badge>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Customer</p>
                  <p className="text-xs font-bold text-slate-800">{selectedOrder.userName}</p>
                  <p className="text-[11px] text-slate-500">{selectedOrder.userEmail}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Plan</p>
                  <p className="text-xs font-bold text-slate-800 capitalize">{selectedOrder.plan_id} — {selectedOrder.billing_interval}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Created</p>
                  <p className="text-xs text-slate-700">{formatDate(selectedOrder.created_at)}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Verified</p>
                  <p className="text-xs text-slate-700">{formatDate(selectedOrder.verified_at)}</p>
                </div>
              </div>
              {selectedOrder.promo_code && (
                <div className="bg-violet-50 rounded-lg p-3 border border-violet-100">
                  <p className="text-[10px] uppercase font-bold text-violet-500 mb-1">Promo Code Applied</p>
                  <p className="text-sm font-bold text-violet-700">{selectedOrder.promo_code} ({selectedOrder.discount_percent}% off)</p>
                </div>
              )}
              {selectedOrder.receipt && (
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Receipt</p>
                  <p className="text-xs font-mono text-slate-600 break-all">{selectedOrder.receipt}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
