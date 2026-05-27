import { useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  Copy, ExternalLink, TrendingUp, Users, DollarSign, Eye,
  MousePointerClick, UserPlus, ArrowUpRight, Download, Calendar,
  Wallet, CreditCard, Clock, CheckCircle2, XCircle, Filter,
  BarChart3, Share2, Link2, QrCode, Gift, FileText, Bell
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";


// Mock data for the affiliate dashboard
const mockAffiliate = {
  id: "aff_001",
  fullName: "Priya Patel",
  email: "priya@creator.io",
  affiliateCode: "priya2026",
  referralLink: "https://flowora.com/ref/priya2026",
  status: "active" as const,
  commissionRate: 25,
  commissionDurationMonths: 11,
  totalReferrals: 47,
  totalConversions: 12,
  totalEarnings: 14850.00,
  totalPaid: 9900.00,
  pendingBalance: 4950.00,
  createdAt: "2025-01-15",
};

const mockStats = {
  clicksThisMonth: 234,
  signupsThisMonth: 8,
  conversionsThisMonth: 3,
  earningsThisMonth: 3735.00,
  clicksLastMonth: 189,
  signupsLastMonth: 5,
  conversionsLastMonth: 2,
  earningsLastMonth: 2490.00,
};


const mockReferrals = [
  { id: "ref_1", email: "aarav@gmail.com", status: "converted", signedUpAt: "2025-04-12", convertedAt: "2025-04-15", earnings: "₹1,245" },
  { id: "ref_2", email: "neha@outlook.com", status: "converted", signedUpAt: "2025-04-20", convertedAt: "2025-04-22", earnings: "₹1,245" },
  { id: "ref_3", email: "raj@company.co", status: "signed_up", signedUpAt: "2025-05-02", convertedAt: null, earnings: "—" },
  { id: "ref_4", email: "sanya@gmail.com", status: "converted", signedUpAt: "2025-05-08", convertedAt: "2025-05-10", earnings: "₹1,245" },
  { id: "ref_5", email: "vikram@startup.io", status: "signed_up", signedUpAt: "2025-05-15", convertedAt: null, earnings: "—" },
  { id: "ref_6", email: "meera@brand.com", status: "converted", signedUpAt: "2025-05-18", convertedAt: "2025-05-20", earnings: "₹1,245" },
];

const mockPayouts = [
  { id: "pay_1", amount: "₹4,950", date: "2025-04-30", status: "completed", method: "UPI", txnId: "UPI2025043012345" },
  { id: "pay_2", amount: "₹4,950", date: "2025-03-31", status: "completed", method: "UPI", txnId: "UPI2025033167890" },
  { id: "pay_3", amount: "₹2,475", date: "2025-02-28", status: "completed", method: "UPI", txnId: "UPI2025022843210" },
];

const mockCommissions = [
  { id: "com_1", referral: "aarav@gmail.com", amount: "₹124.75", month: 4, date: "2025-05-15", status: "pending" },
  { id: "com_2", referral: "neha@outlook.com", amount: "₹124.75", month: 3, date: "2025-05-15", status: "pending" },
  { id: "com_3", referral: "sanya@gmail.com", amount: "₹124.75", month: 2, date: "2025-05-15", status: "pending" },
  { id: "com_4", referral: "meera@brand.com", amount: "₹124.75", month: 1, date: "2025-05-20", status: "pending" },
  { id: "com_5", referral: "aarav@gmail.com", amount: "₹124.75", month: 3, date: "2025-04-15", status: "paid" },
  { id: "com_6", referral: "neha@outlook.com", amount: "₹124.75", month: 2, date: "2025-04-15", status: "paid" },
];


type Tab = "overview" | "referrals" | "commissions" | "payouts" | "materials";

function StatCard({ icon: Icon, label, value, change, changePositive, gradient }: {
  icon: any; label: string; value: string; change?: string; changePositive?: boolean; gradient: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {change && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            changePositive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
          }`}>
            {changePositive ? "+" : ""}{change}
          </span>
        )}
      </div>
      <p className="text-2xl font-black text-slate-900">{value}</p>
      <p className="text-xs text-gray-500 font-medium mt-1">{label}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    converted: "bg-emerald-50 text-emerald-700 border-emerald-200",
    signed_up: "bg-blue-50 text-blue-700 border-blue-200",
    clicked: "bg-gray-50 text-gray-600 border-gray-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
    completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    processing: "bg-blue-50 text-blue-700 border-blue-200",
    failed: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${styles[status] || styles.pending}`}>
      {status.replace("_", " ")}
    </span>
  );
}


export default function AffiliateDashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const copyLink = async () => {
    await navigator.clipboard.writeText(mockAffiliate.referralLink);
    toast.success("Referral link copied to clipboard!");
  };

  const copyCode = async () => {
    await navigator.clipboard.writeText(mockAffiliate.affiliateCode);
    toast.success("Affiliate code copied!");
  };

  const requestPayout = () => {
    if (mockAffiliate.pendingBalance < 500) {
      toast.error("Minimum payout amount is ₹500");
      return;
    }
    toast.success("Payout request submitted! Processing within 15 business days.");
  };

  const downloadAgreement = () => {
    toast.success("Downloading affiliate agreement PDF...");
    // In production this generates/downloads the PDF
  };

  const tabs = [
    { id: "overview" as Tab, label: "Overview", icon: BarChart3 },
    { id: "referrals" as Tab, label: "Referrals", icon: Users },
    { id: "commissions" as Tab, label: "Commissions", icon: DollarSign },
    { id: "payouts" as Tab, label: "Payouts", icon: Wallet },
    { id: "materials" as Tab, label: "Materials", icon: Share2 },
  ];

  return (
    <div className="mx-auto max-w-[1100px] px-5 py-6 lg:px-10">
      {/* Header with Link */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Affiliate Dashboard</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Commission: <strong className="text-purple-600">{mockAffiliate.commissionRate}%</strong> recurring for{" "}
              <strong>{mockAffiliate.commissionDurationMonths} months</strong>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={downloadAgreement} className="text-xs cursor-pointer">
              <FileText className="w-3.5 h-3.5 mr-1.5" />
              Agreement PDF
            </Button>
            <Button variant="outline" size="sm" onClick={requestPayout} className="text-xs cursor-pointer">
              <Wallet className="w-3.5 h-3.5 mr-1.5" />
              Request Payout
            </Button>
          </div>
        </div>


        {/* Referral Link Box */}
        <div className="mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-5 text-white shadow-lg shadow-purple-500/20">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <p className="text-xs text-white/70 font-bold uppercase tracking-wider mb-1">Your Referral Link</p>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5">
                <Link2 className="w-4 h-4 text-white/70 shrink-0" />
                <span className="text-sm font-mono truncate flex-1">{mockAffiliate.referralLink}</span>
                <button onClick={copyLink} className="text-white/80 hover:text-white cursor-pointer">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={copyCode} variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-0 text-xs cursor-pointer">
                <Copy className="w-3.5 h-3.5 mr-1" />
                Code: {mockAffiliate.affiliateCode}
              </Button>
              <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-0 cursor-pointer">
                <QrCode className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-white text-slate-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>


      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={MousePointerClick}
              label="Clicks This Month"
              value={mockStats.clicksThisMonth.toString()}
              change={`${Math.round(((mockStats.clicksThisMonth - mockStats.clicksLastMonth) / mockStats.clicksLastMonth) * 100)}%`}
              changePositive={mockStats.clicksThisMonth > mockStats.clicksLastMonth}
              gradient="from-blue-500 to-cyan-500"
            />
            <StatCard
              icon={UserPlus}
              label="Signups This Month"
              value={mockStats.signupsThisMonth.toString()}
              change={`${mockStats.signupsThisMonth - mockStats.signupsLastMonth}`}
              changePositive={mockStats.signupsThisMonth > mockStats.signupsLastMonth}
              gradient="from-purple-500 to-violet-500"
            />
            <StatCard
              icon={TrendingUp}
              label="Conversions"
              value={mockStats.conversionsThisMonth.toString()}
              change={`${mockStats.conversionsThisMonth - mockStats.conversionsLastMonth}`}
              changePositive={mockStats.conversionsThisMonth >= mockStats.conversionsLastMonth}
              gradient="from-emerald-500 to-green-500"
            />
            <StatCard
              icon={DollarSign}
              label="Earnings This Month"
              value={`₹${mockStats.earningsThisMonth.toLocaleString()}`}
              change={`${Math.round(((mockStats.earningsThisMonth - mockStats.earningsLastMonth) / mockStats.earningsLastMonth) * 100)}%`}
              changePositive={mockStats.earningsThisMonth > mockStats.earningsLastMonth}
              gradient="from-amber-500 to-orange-500"
            />
          </div>

          {/* Earnings Summary */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-6 text-white">
              <Wallet className="w-6 h-6 text-white/80 mb-3" />
              <p className="text-3xl font-black">₹{mockAffiliate.totalEarnings.toLocaleString()}</p>
              <p className="text-sm text-white/80 mt-1">Total Earnings (Lifetime)</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
              <CheckCircle2 className="w-6 h-6 text-white/80 mb-3" />
              <p className="text-3xl font-black">₹{mockAffiliate.totalPaid.toLocaleString()}</p>
              <p className="text-sm text-white/80 mt-1">Total Paid Out</p>
            </div>
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white">
              <Clock className="w-6 h-6 text-white/80 mb-3" />
              <p className="text-3xl font-black">₹{mockAffiliate.pendingBalance.toLocaleString()}</p>
              <p className="text-sm text-white/80 mt-1">Pending Balance</p>
              <Button
                onClick={requestPayout}
                size="sm"
                className="mt-3 bg-white/20 hover:bg-white/30 text-white border-0 text-xs cursor-pointer"
              >
                Request Payout
              </Button>
            </div>
          </div>


          {/* Quick Performance */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">Conversion Funnel</h3>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Total Clicks", value: mockAffiliate.totalReferrals * 5, color: "bg-blue-500" },
                { label: "Signups", value: mockAffiliate.totalReferrals, color: "bg-purple-500" },
                { label: "Conversions", value: mockAffiliate.totalConversions, color: "bg-emerald-500" },
                { label: "Active Subs", value: mockAffiliate.totalConversions - 2, color: "bg-amber-500" },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <div className={`h-2 rounded-full ${item.color} mb-2`} style={{ width: `${Math.max(20, (item.value / (mockAffiliate.totalReferrals * 5)) * 100)}%`, margin: "0 auto" }} />
                  <p className="text-xl font-black text-slate-900">{item.value}</p>
                  <p className="text-[10px] text-gray-500 font-medium">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Referrals Preview */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800">Recent Referrals</h3>
              <button onClick={() => setActiveTab("referrals")} className="text-xs font-bold text-purple-600 hover:text-purple-700 cursor-pointer">
                View All →
              </button>
            </div>
            <div className="space-y-3">
              {mockReferrals.slice(0, 4).map((ref) => (
                <div key={ref.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-600">
                      {ref.email[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{ref.email}</p>
                      <p className="text-[10px] text-gray-400">Signed up {ref.signedUpAt}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-700">{ref.earnings}</span>
                    <StatusBadge status={ref.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}


      {/* Referrals Tab */}
      {activeTab === "referrals" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-slate-800">All Referrals</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{mockReferrals.length} total</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-2 text-xs font-bold text-gray-500 uppercase">Email</th>
                  <th className="text-left py-3 px-2 text-xs font-bold text-gray-500 uppercase">Signed Up</th>
                  <th className="text-left py-3 px-2 text-xs font-bold text-gray-500 uppercase">Converted</th>
                  <th className="text-left py-3 px-2 text-xs font-bold text-gray-500 uppercase">Status</th>
                  <th className="text-right py-3 px-2 text-xs font-bold text-gray-500 uppercase">Earnings</th>
                </tr>
              </thead>
              <tbody>
                {mockReferrals.map((ref) => (
                  <tr key={ref.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                    <td className="py-3 px-2 font-medium text-slate-800">{ref.email}</td>
                    <td className="py-3 px-2 text-gray-500">{ref.signedUpAt}</td>
                    <td className="py-3 px-2 text-gray-500">{ref.convertedAt || "—"}</td>
                    <td className="py-3 px-2"><StatusBadge status={ref.status} /></td>
                    <td className="py-3 px-2 text-right font-bold text-slate-800">{ref.earnings}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Commissions Tab */}
      {activeTab === "commissions" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-slate-800">Commission History</h3>
            <span className="text-xs text-gray-500">{mockCommissions.length} entries</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-2 text-xs font-bold text-gray-500 uppercase">Referral</th>
                  <th className="text-left py-3 px-2 text-xs font-bold text-gray-500 uppercase">Month #</th>
                  <th className="text-left py-3 px-2 text-xs font-bold text-gray-500 uppercase">Date</th>
                  <th className="text-left py-3 px-2 text-xs font-bold text-gray-500 uppercase">Status</th>
                  <th className="text-right py-3 px-2 text-xs font-bold text-gray-500 uppercase">Amount</th>
                </tr>
              </thead>
              <tbody>
                {mockCommissions.map((com) => (
                  <tr key={com.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                    <td className="py-3 px-2 font-medium text-slate-800">{com.referral}</td>
                    <td className="py-3 px-2 text-gray-500">Month {com.month}/11</td>
                    <td className="py-3 px-2 text-gray-500">{com.date}</td>
                    <td className="py-3 px-2"><StatusBadge status={com.status} /></td>
                    <td className="py-3 px-2 text-right font-bold text-emerald-600">{com.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}


      {/* Payouts Tab */}
      {activeTab === "payouts" && (
        <div className="space-y-6">
          {/* Payout Summary */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <p className="text-xs text-gray-500 font-bold uppercase mb-1">Available Balance</p>
              <p className="text-2xl font-black text-slate-900">₹{mockAffiliate.pendingBalance.toLocaleString()}</p>
              <Button onClick={requestPayout} size="sm" className="mt-3 bg-purple-600 hover:bg-purple-700 text-white text-xs cursor-pointer">
                Request Payout
              </Button>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <p className="text-xs text-gray-500 font-bold uppercase mb-1">Total Paid Out</p>
              <p className="text-2xl font-black text-emerald-600">₹{mockAffiliate.totalPaid.toLocaleString()}</p>
              <p className="text-[10px] text-gray-400 mt-1">Across {mockPayouts.length} payouts</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <p className="text-xs text-gray-500 font-bold uppercase mb-1">Min. Payout</p>
              <p className="text-2xl font-black text-slate-900">₹500</p>
              <p className="text-[10px] text-gray-400 mt-1">Monthly processing cycle</p>
            </div>
          </div>

          {/* Payout History */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">Payout History</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-2 text-xs font-bold text-gray-500 uppercase">Date</th>
                    <th className="text-left py-3 px-2 text-xs font-bold text-gray-500 uppercase">Method</th>
                    <th className="text-left py-3 px-2 text-xs font-bold text-gray-500 uppercase">Transaction ID</th>
                    <th className="text-left py-3 px-2 text-xs font-bold text-gray-500 uppercase">Status</th>
                    <th className="text-right py-3 px-2 text-xs font-bold text-gray-500 uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {mockPayouts.map((pay) => (
                    <tr key={pay.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                      <td className="py-3 px-2 text-slate-800">{pay.date}</td>
                      <td className="py-3 px-2 text-gray-500">{pay.method}</td>
                      <td className="py-3 px-2 text-gray-400 font-mono text-xs">{pay.txnId}</td>
                      <td className="py-3 px-2"><StatusBadge status={pay.status} /></td>
                      <td className="py-3 px-2 text-right font-bold text-emerald-600">{pay.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}


      {/* Materials Tab */}
      {activeTab === "materials" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-2">Promotional Materials</h3>
            <p className="text-sm text-gray-500 mb-6">Download ready-made assets to promote Flowora</p>
            
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { title: "Social Media Posts Pack", desc: "10 ready-to-post Instagram/Twitter images with captions", type: "ZIP", size: "4.2 MB" },
                { title: "Email Swipe File", desc: "5 high-converting email templates for your list", type: "PDF", size: "320 KB" },
                { title: "YouTube Video Script", desc: "Complete script for a Flowora review video", type: "DOCX", size: "45 KB" },
                { title: "Banner Ads (All Sizes)", desc: "728x90, 300x250, 160x600, 320x50 banner creatives", type: "ZIP", size: "2.8 MB" },
                { title: "Brand Guidelines", desc: "Logos, colors, and usage guidelines", type: "PDF", size: "1.1 MB" },
                { title: "Case Study Template", desc: "Fill-in-the-blank case study for your audience", type: "DOCX", size: "38 KB" },
              ].map((mat) => (
                <div key={mat.title} className="border border-gray-100 rounded-xl p-4 hover:border-purple-200 hover:bg-purple-50/30 transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{mat.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">{mat.desc}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{mat.type}</span>
                        <span className="text-[10px] text-gray-400">{mat.size}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="shrink-0 cursor-pointer">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Share Templates */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">Quick Share Messages</h3>
            <div className="space-y-3">
              {[
                "I've been using Flowora to automate my Instagram DMs and it's incredible! Use my link to get started free: " + mockAffiliate.referralLink,
                "If you're a creator looking to grow on Instagram, check out Flowora. It automates DMs, captures leads, and saves hours. Try it free: " + mockAffiliate.referralLink,
              ].map((msg, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700">
                  <p className="leading-relaxed">{msg}</p>
                  <button
                    onClick={() => { navigator.clipboard.writeText(msg); toast.success("Message copied!"); }}
                    className="mt-2 text-xs font-bold text-purple-600 hover:text-purple-700 cursor-pointer flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" /> Copy message
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
