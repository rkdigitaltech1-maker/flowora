import { Download, PackageCheck, Search, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { useOrders } from "@/lib/supabase-hooks.ts";
import { useState, useMemo } from "react";

function formatRevenue(amount: number): string {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)}L`;
  }
  return `₹${amount.toLocaleString("en-IN")}`;
}

export default function OrdersPage() {
  const { orders: rawOrders, loading } = useOrders();
  const [searchTerm, setSearchTerm] = useState("");

  // Adapt Supabase flat order rows to match the UI's expected shape
  const data = rawOrders.length > 0 || !loading
    ? {
        orders: rawOrders.map((o: any) => ({
          ...o,
          orderNumber: o.order_number ?? o.id?.slice(0, 8).toUpperCase() ?? "",
          productTitle: o.creator_products?.title ?? o.product_title ?? "Unknown Product",
          customerName: o.customer_name ?? "",
          customerEmail: o.customer_email ?? "",
          amount: Number(o.amount ?? 0),
          currency: o.currency ?? "INR",
          status: o.status ?? "paid",
          createdAt: o.created_at ?? new Date().toISOString(),
        })),
        stats: {
          totalOrders: rawOrders.length,
          totalRevenue: rawOrders.reduce((s: number, o: any) => s + Number(o.amount ?? 0), 0),
          deliverySuccess: rawOrders.length > 0
            ? `${((rawOrders.filter((o: any) => o.status === "delivered" || o.status === "paid").length / rawOrders.length) * 100).toFixed(1)}%`
            : "0.0%",
        },
      }
    : null;

  const { filteredOrders, stats } = useMemo(() => {
    if (!data) return { filteredOrders: [], stats: { totalOrders: 0, totalRevenue: 0, deliverySuccess: "0.0%" } };

    const { orders, stats } = data;

    const filtered = orders.filter((o: any) => {
      const matchSearch =
        o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.productTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());

      return matchSearch;
    });

    return {
      filteredOrders: filtered,
      stats,
    };
  }, [data, searchTerm]);

  // CSV Export handler
  const handleExportCSV = () => {
    if (filteredOrders.length === 0) return;
    const headers = ["Order ID", "Product Name", "Customer Name", "Customer Email", "Price", "Currency", "Status", "Date Created"];
    const rows = filteredOrders.map((o: any) => [
      o.orderNumber,
      o.productTitle,
      o.customerName,
      o.customerEmail,
      o.amount,
      o.currency,
      o.status,
      new Date(o.createdAt).toLocaleDateString()
    ]);
    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers.join(","), ...rows.map(row => row.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `creator_orders_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-120px)] flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-[#6d48ff]" />
        <p className="text-sm font-semibold text-[#82799b]">Syncing with real stats...</p>
      </div>
    );
  }

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "bg-[#f1edff] text-[#5144e8]";
      case "delivered":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200/50";
      case "pending":
        return "bg-amber-50 text-amber-700 border border-amber-200/50";
      case "failed":
        return "bg-red-50 text-red-700 border border-red-200/50";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="mx-auto max-w-[1180px] px-5 py-6 lg:px-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-[#82799b]">Orders</p>
          <h1 className="mt-1 text-3xl font-bold">Digital product orders</h1>
          <p className="mt-1 text-[#665d82]">Track purchases from DM campaigns, link-in-bio, and WhatsApp CTAs.</p>
        </div>
        <Button 
          onClick={handleExportCSV} 
          disabled={filteredOrders.length === 0}
          className="rounded-xl bg-[#5144e8] hover:bg-[#4336d4] text-white flex items-center gap-1.5 cursor-pointer"
        >
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Dynamic Statistics cards */}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          [stats.totalOrders.toLocaleString(), "Total orders"],
          [formatRevenue(stats.totalRevenue), "Revenue"],
          [stats.deliverySuccess, "Delivery success"],
        ].map(([value, label]) => (
          <section key={label} className="rounded-[18px] border border-[#dfdbea] bg-white p-6 shadow-sm">
            <PackageCheck className="h-5 w-5 text-[#6d48ff]" />
            <p className="mt-4 text-3xl font-bold text-slate-900">{value}</p>
            <p className="text-sm text-[#82799b]">{label}</p>
          </section>
        ))}
      </div>

      <section className="mt-6 overflow-hidden rounded-[18px] border border-[#dfdbea] bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-[#eeeaf6] p-5">
          <Search className="h-4 w-4 text-[#82799b]" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="min-w-0 flex-1 bg-transparent text-sm outline-none text-slate-900 placeholder:text-slate-400"
            placeholder="Search order, customer, or product"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")}>
              <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
            </button>
          )}
        </div>

        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <PackageCheck className="h-10 w-10 text-slate-300" />
            <h3 className="mt-4 font-semibold text-slate-900">No orders found</h3>
            <p className="mt-1 text-sm text-slate-500">
              {searchTerm ? "Try adjusting your search criteria." : "Live product sales will show up here."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#eeeaf6]">
            {filteredOrders.map((order: any) => (
              <div key={order._id} className="grid gap-3 p-5 md:grid-cols-[0.4fr_1.1fr_0.65fr_0.35fr_0.35fr] md:items-center">
                <p className="font-mono text-sm text-slate-500 font-semibold">{order.orderNumber}</p>
                <div>
                  <p className="font-semibold text-slate-900">{order.productTitle}</p>
                  <p className="text-2xs text-slate-400">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[#171126] font-medium">{order.customerName}</p>
                  <p className="text-2xs text-[#82799b]">{order.customerEmail || "No email"}</p>
                </div>
                <p className="font-bold text-slate-900">
                  {order.currency === "INR" ? "₹" : "$"}{order.amount.toLocaleString("en-IN")}
                </p>
                <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold capitalize ${getStatusStyle(order.status)}`}>
                  {order.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
