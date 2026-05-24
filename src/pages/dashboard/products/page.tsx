import { FileText, IndianRupee, PackagePlus, ShoppingCart, Video, Loader2, Trash2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { useProducts } from "@/lib/supabase-hooks.ts";
import { supabase as rawSupabase } from "@/lib/supabase.ts";
const supabase = rawSupabase as any;
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Input } from "@/components/ui/input.tsx";

const PRODUCT_TYPES = ["PDF", "Video", "Files", "Course", "Other"];

function formatRevenue(amount: number): string {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)}L`;
  }
  return `₹${amount.toLocaleString("en-IN")}`;
}

export default function ProductsPage() {
  const { products: data, loading, createProduct, refetch } = useProducts();

  // Modal / Form States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  const [title, setTitle] = useState("");
  const [type, setType] = useState("PDF");
  const [price, setPrice] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [simulatingId, setSimulatingId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-120px)] flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-[#6d48ff]" />
        <p className="text-sm font-semibold text-[#82799b]">Syncing with real stats...</p>
      </div>
    );
  }

  // Adapt flat product rows to expected shape
  const products = (Array.isArray(data) ? data : []).map((p: any) => ({
    ...p,
    _id: p.id ?? p._id,
    title: p.title ?? "",
    type: p.type ?? "PDF",
    price: Number(p.price ?? 0),
    isActive: p.is_active ?? true,
    sales: p.sales_count ?? p.sales ?? 0,
    revenue: Number(p.revenue ?? 0),
  }));
  const stats = {
    totalRevenue: products.reduce((s: number, p: any) => s + p.revenue, 0),
    totalOrders: products.reduce((s: number, p: any) => s + p.sales, 0),
    dmToSaleRate: "N/A",
  };

  const getProductIcon = (pType: string) => {
    switch (pType?.toUpperCase()) {
      case "VIDEO":
      case "COURSE":
        return Video;
      default:
        return FileText;
    }
  };

  const handleOpenAdd = () => {
    setTitle("");
    setType("PDF");
    setPrice("499");
    setIsAddOpen(true);
  };

  const handleOpenEdit = (product: any) => {
    setSelectedProduct(product);
    setTitle(product.title);
    setType(product.type);
    setPrice(product.price.toString());
    setIsActive(product.isActive ?? true);
    setIsEditOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price) {
      toast.error("Please fill in all fields.");
      return;
    }
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0) {
      toast.error("Please enter a valid price.");
      return;
    }

    setSubmitting(true);
    try {
      await createProduct({
        title: title.trim(),
        type,
        price: numPrice,
      });
      toast.success("Product added successfully!");
      setIsAddOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to add product.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    if (!title.trim() || !price) {
      toast.error("Please fill in all fields.");
      return;
    }
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0) {
      toast.error("Please enter a valid price.");
      return;
    }

    setSubmitting(true);
    try {
      await supabase.from("creator_products").update({
        title: title.trim(),
        type,
        price: numPrice,
        is_active: isActive,
      } as any).eq("id", selectedProduct._id);
      toast.success("Product updated successfully!");
      setIsEditOpen(false);
      refetch();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update product.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    if (!confirm("Are you sure you want to delete this product? All referencing orders will be removed.")) return;

    setSubmitting(true);
    try {
      await supabase.from("creator_products").delete().eq("id", selectedProduct._id);
      toast.success("Product deleted successfully!");
      setIsEditOpen(false);
      refetch();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete product.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSimulateSale = async (productId: any) => {
    setSimulatingId(productId);
    try {
      const orderNumber = `ORD-${Date.now()}`;
      const prod = products.find((p: any) => p._id === productId);
      if (!prod) return;
      await supabase.from("creator_orders").insert({
        workspace_id: prod.workspace_id,
        product_id: productId,
        order_number: orderNumber,
        amount: prod.price ?? 0,
        currency: "INR",
        status: "paid",
        customer_name: "Simulated Customer",
        customer_email: "sim@example.com",
      } as any);
      toast.success(`Simulated order ${orderNumber} successfully!`);
      refetch();
    } catch (err) {
      console.error(err);
      toast.error("Failed to simulate sale.");
    } finally {
      setSimulatingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Digital products</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-950">Sell from DM flows</h1>
          <p className="mt-1 text-sm text-slate-500">Upload files, add Razorpay checkout, and deliver products automatically after payment.</p>
        </div>
        <Button onClick={handleOpenAdd} className="rounded-lg bg-slate-950 hover:bg-slate-800 text-white cursor-pointer">
          <PackagePlus className="h-4 w-4" />
          Add product
        </Button>
      </div>

      {/* Synchronized Metrics cards */}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          [formatRevenue(stats.totalRevenue), "Product revenue", IndianRupee],
          [stats.totalOrders.toLocaleString(), "Orders", ShoppingCart],
          [stats.dmToSaleRate, "DM to sale rate", FileText],
        ].map(([value, label, Icon]) => (
          <div key={label as string} className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
            <Icon className="h-5 w-5 text-slate-500" />
            <p className="mt-4 text-2xl font-semibold text-slate-950">{value as string}</p>
            <p className="text-sm text-slate-500">{label as string}</p>
          </div>
        ))}
      </div>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-xs">
        <div className="border-b border-slate-100 p-5">
          <h2 className="font-semibold text-slate-950">Product catalog</h2>
          <p className="text-sm text-slate-500">V1 connects product links to DM replies. Phase 2 adds full checkout and file delivery.</p>
        </div>

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <ShoppingCart className="h-10 w-10 text-slate-300" />
            <h3 className="mt-4 font-semibold text-slate-900">No products yet</h3>
            <p className="mt-1 text-sm text-slate-500">Add digital products to start selling from DM flows.</p>
            <Button onClick={handleOpenAdd} className="mt-4 rounded-lg bg-slate-950 hover:bg-slate-800 text-white cursor-pointer">
              Add first product
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {products.map((product) => {
              const Icon = getProductIcon(product.type);
              return (
                <div key={product._id} className={`grid gap-4 p-5 md:grid-cols-[1fr_0.4fr_0.4fr_0.4fr_0.45fr] md:items-center ${!product.isActive ? "opacity-60 bg-slate-50/50" : ""}`}>
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-950">{product.title}</p>
                        {!product.isActive && (
                          <span className="rounded bg-slate-200 px-1.5 py-0.5 text-2xs font-medium text-slate-600">Inactive</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500">{product.type}</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-slate-950">₹{product.price.toLocaleString("en-IN")}</p>
                  <p className="text-sm text-slate-600">{(product.sales ?? 0).toLocaleString()} sales</p>
                  <p className="text-sm font-semibold text-slate-950">₹{(product.revenue ?? 0).toLocaleString("en-IN")}</p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg h-9 text-slate-700 hover:text-slate-950 cursor-pointer"
                      onClick={() => handleOpenEdit(product)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg h-9 border-[#7048ff]/30 text-[#7048ff] bg-[#7048ff]/5 hover:bg-[#7048ff]/10 hover:text-[#5e38eb] flex items-center gap-1 cursor-pointer"
                      disabled={simulatingId === product._id}
                      onClick={() => handleSimulateSale(product._id)}
                    >
                      {simulatingId === product._id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Zap className="h-3 w-3" />
                      )}
                      Simulate Sale
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Add Product Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle className="text-slate-950">Add Digital Product</DialogTitle>
              <DialogDescription className="text-slate-500">
                Create a product configuration to reference in automations.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-700">Product Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 30-day fitness PDF"
                  className="rounded-lg border-slate-200 bg-white"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-slate-700">Product Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm bg-white text-slate-950 focus:outline-hidden"
                  >
                    {PRODUCT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-slate-700">Price (INR)</label>
                  <Input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="499"
                    className="rounded-lg border-slate-200 bg-white"
                    required
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="mt-4 flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddOpen(false)}
                className="rounded-lg"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-slate-950 text-white hover:bg-slate-800 flex items-center gap-1 cursor-pointer"
              >
                {submitting && <Loader2 className="h-3 w-3 animate-spin" />}
                Add Product
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Product Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <form onSubmit={handleUpdate}>
            <DialogHeader>
              <DialogTitle className="text-slate-950">Edit Digital Product</DialogTitle>
              <DialogDescription className="text-slate-500">
                Modify product details, change price, or deactivate selling.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-700">Product Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Reels growth masterclass"
                  className="rounded-lg border-slate-200 bg-white"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-slate-700">Product Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm bg-white text-slate-950 focus:outline-hidden"
                  >
                    {PRODUCT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-slate-700">Price (INR)</label>
                  <Input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="1999"
                    className="rounded-lg border-slate-200 bg-white"
                    required
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded-sm border-slate-300 text-[#7048ff] focus:ring-[#7048ff]"
                />
                <label htmlFor="isActive" className="text-sm text-slate-700 font-medium">
                  Active (deliverable in DM campaign checkouts)
                </label>
              </div>
            </div>
            <DialogFooter className="mt-4 flex gap-2 justify-between items-center sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={handleDelete}
                disabled={submitting}
                className="rounded-lg border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditOpen(false)}
                  className="rounded-lg"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-slate-950 text-white hover:bg-slate-800 flex items-center gap-1 cursor-pointer"
                >
                  {submitting && <Loader2 className="h-3 w-3 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
