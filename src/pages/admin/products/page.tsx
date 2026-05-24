import { useState } from "react";
import { useAdminProducts } from "@/lib/supabase-hooks.ts";
import { useAdminAuth } from "@/hooks/use-admin-auth.ts";
import { useDebounce } from "@/hooks/use-debounce.ts";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search, Package, FileText, Video, GraduationCap, FolderArchive,
  ArrowUpRight, ShoppingCart, IndianRupee, ShieldAlert
} from "lucide-react";

type Product = {
  _id: string;
  workspaceId: string;
  title: string;
  type: string;
  price: number;
  salesCount: number;
  revenue: number;
  isActive: boolean;
  createdAt: string;
  workspaceName: string;
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  pdf: <FileText size={13} className="text-red-500" />,
  course: <GraduationCap size={13} className="text-emerald-500" />,
  video: <Video size={13} className="text-blue-500" />,
  files: <FolderArchive size={13} className="text-amber-500" />,
};

function TypeBadge({ type }: { type: string }) {
  const normType = type.toLowerCase();
  const icon = TYPE_ICONS[normType] || <Package size={13} />;
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 capitalize">
      {icon}
      {type}
    </span>
  );
}

export default function AdminProductsPage() {
  const { token } = useAdminAuth();
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 300);

  const { products, loading } = useAdminProducts({
    type: tab,
    search: debouncedSearch,
  });

  // Calculate quick aggregates
  const totalCount = products?.length ?? 0;
  const totalSales = products?.reduce((sum, p) => sum + (p.salesCount || 0), 0) ?? 0;
  const totalRev = products?.reduce((sum, p) => sum + (p.revenue || 0), 0) ?? 0;
  const avgPrice = totalCount > 0 ? (products?.reduce((sum, p) => sum + p.price, 0) ?? 0) / totalCount : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">Platform Products</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          View all digital products, courses, PDFs, and files sold by creators on the platform.
        </p>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Products", value: totalCount, icon: <Package size={16} />, color: "from-blue-600 to-indigo-600" },
          { label: "Avg Product Price", value: `₹${avgPrice.toFixed(0)}`, icon: <IndianRupee size={16} />, color: "from-purple-600 to-indigo-600" },
          { label: "Total Sales Count", value: totalSales, icon: <ShoppingCart size={16} />, color: "from-emerald-600 to-teal-600" },
          { label: "Platform Product Sales", value: `₹${totalRev.toLocaleString()}`, icon: <IndianRupee size={16} />, color: "from-pink-600 to-rose-600" },
        ].map((stat, i) => (
          <Card key={i} className="border-0 shadow-sm overflow-hidden bg-gradient-to-r text-white" style={{ background: `linear-gradient(135deg, var(--tw-gradient-stops))` }}>
            <div className={`p-4 bg-gradient-to-br ${stat.color} flex items-center justify-between`}>
              <div>
                <p className="text-[10px] uppercase font-bold text-white/70 tracking-wider">{stat.label}</p>
                <p className="text-2xl font-extrabold mt-1">{products ? stat.value : <Skeleton className="h-7 w-16 bg-white/20" />}</p>
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
          <TabsList className="grid w-full grid-cols-5 max-w-[420px]">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            <TabsTrigger value="pdf" className="text-xs">PDFs</TabsTrigger>
            <TabsTrigger value="course" className="text-xs">Courses</TabsTrigger>
            <TabsTrigger value="video" className="text-xs">Videos</TabsTrigger>
            <TabsTrigger value="files" className="text-xs">Files</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search products or creator workspace..."
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
                <th className="py-3.5 px-4">Product Title</th>
                <th className="py-3.5 px-4">Creator / Workspace</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4 text-right">Price</th>
                <th className="py-3.5 px-4 text-right">Sales Count</th>
                <th className="py-3.5 px-4 text-right">Total Revenue</th>
                <th className="py-3.5 px-4 text-right">Status</th>
                <th className="py-3.5 px-4 text-right">Created Date</th>
              </tr>
            </thead>
            <tbody>
              {!products || loading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx} className="border-b border-slate-50 dark:border-slate-800/40">
                    <td className="py-4 px-4"><Skeleton className="h-5 w-48" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-5 w-24" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-5 w-16" /></td>
                    <td className="py-4 px-4 text-right"><Skeleton className="h-5 w-12 ml-auto" /></td>
                    <td className="py-4 px-4 text-right"><Skeleton className="h-5 w-12 ml-auto" /></td>
                    <td className="py-4 px-4 text-right"><Skeleton className="h-5 w-16 ml-auto" /></td>
                    <td className="py-4 px-4 text-right"><Skeleton className="h-5 w-14 ml-auto" /></td>
                    <td className="py-4 px-4 text-right"><Skeleton className="h-5 w-20 ml-auto" /></td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-sm text-slate-400">
                    No digital products found on the platform yet.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p._id} className="border-b border-slate-50 dark:border-slate-800/40 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                          <Package size={15} />
                        </div>
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{p.title}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                      {p.workspaceName}
                    </td>
                    <td className="py-3 px-4">
                      <TypeBadge type={p.type} />
                    </td>
                    <td className="py-3 px-4 text-right text-xs font-bold text-slate-700 dark:text-slate-300">
                      ₹{p.price.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-xs font-semibold">
                      {p.salesCount || 0}
                    </td>
                    <td className="py-3 px-4 text-right text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{(p.revenue || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Badge variant={p.isActive ? "default" : "secondary"} className="text-[10px]">
                        {p.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right text-xs text-slate-400">
                      {new Date(p.createdAt).toLocaleDateString()}
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
