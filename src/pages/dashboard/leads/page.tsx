import { Download, Filter, Mail, Phone, Search, Tag, Users, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { useLeads } from "@/lib/supabase-hooks.ts";
import { useState, useMemo } from "react";
import { CountUp } from "@/components/ui/count-up.tsx";

function parseValueForCountUp(val: string | number) {
  if (typeof val === "number") {
    return { end: val, prefix: "", suffix: "", decimals: 0 };
  }
  const cleanStr = val.trim();
  if (cleanStr.includes("/")) {
    const parts = cleanStr.split("/");
    const active = parseFloat(parts[0].replace(/[^0-9.]/g, ""));
    const total = parts[1];
    return { end: isNaN(active) ? 0 : active, prefix: "", suffix: `/${total}`, decimals: 0 };
  }
  if (cleanStr.endsWith("%")) {
    const num = parseFloat(cleanStr.replace(/[^0-9.]/g, ""));
    const hasDecimal = cleanStr.includes(".");
    const decimals = hasDecimal ? cleanStr.split(".")[1].replace(/[^0-9]/g, "").length : 0;
    return { end: isNaN(num) ? 0 : num, prefix: "", suffix: "%", decimals };
  }
  let prefix = "";
  let numberStr = cleanStr;
  const firstChar = cleanStr[0];
  if (isNaN(Number(firstChar)) && firstChar !== "-" && firstChar !== ".") {
    prefix = firstChar;
    numberStr = cleanStr.slice(1);
  }
  const num = parseFloat(numberStr.replace(/,/g, ""));
  const hasDecimal = numberStr.includes(".");
  const decimals = hasDecimal ? numberStr.split(".")[1].replace(/[^0-9]/g, "").length : 0;
  return {
    end: isNaN(num) ? 0 : num,
    prefix,
    suffix: "",
    decimals,
  };
}

export default function LeadsPage() {
  const { leads, campaigns, deliveries, loading } = useLeads();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // Compute filtered list and unique tags
  const { filteredLeads, allTags, stats } = useMemo(() => {
    if (loading) return { filteredLeads: [], allTags: [], stats: { total: 0, thisWeek: 0, conversionRate: "0.0%" } };

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Dynamic stats
    const total = leads.length;
    const thisWeek = leads.filter((l: any) => new Date(l.created_at || l.createdAt) >= oneWeekAgo).length;
    const conversionRate = deliveries.length > 0 
      ? Math.min(100, (leads.length / deliveries.length) * 100).toFixed(1) + "%" 
      : "0.0%";

    // Unique tags helper
    const tagsSet = new Set<string>();
    leads.forEach((l: any) => {
      if (l.tags) {
        l.tags.forEach((tag: string) => tagsSet.add(tag));
      }
    });

    // Map campaign names and filter
    const campaignMap = new Map(campaigns.map((c: any) => [c.id ?? c._id, c.name]));
    
    const filtered = leads.filter((l: any) => {
      const campId = l.campaign_id ?? l.campaignId;
      const campName = campId ? campaignMap.get(campId) || "" : "";
      const matchesSearch = 
        (l.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (l.instagram_username || l.instagramUsername || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (l.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (l.phone || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (l.source || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        campName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesTag = !selectedTag || (l.tags && l.tags.includes(selectedTag));

      return matchesSearch && matchesTag;
    }).map((l: any) => {
      const campId = l.campaign_id ?? l.campaignId;
      return {
        ...l,
        campaignName: campId ? campaignMap.get(campId) || l.source || "Direct DM" : l.source || "Direct DM"
      };
    });

    return {
      filteredLeads: filtered,
      allTags: Array.from(tagsSet),
      stats: { total, thisWeek, conversionRate }
    };
  }, [leads, campaigns, deliveries, loading, searchTerm, selectedTag]);

  // Export CSV helper
  const handleExportCSV = () => {
    if (filteredLeads.length === 0) return;
    const headers = ["Name", "Instagram Handle", "Email", "Phone", "Source/Campaign", "Tags", "Date Joined"];
    const rows = filteredLeads.map((l: any) => [
      l.name || "",
      (l.instagram_username || l.instagramUsername) ? `@${l.instagram_username || l.instagramUsername}` : "",
      l.email || "",
      l.phone || "",
      l.campaignName || "",
      (l.tags || []).join("; "),
      new Date(l.created_at || l.createdAt).toLocaleDateString()
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `creator_leads_${new Date().toISOString().split("T")[0]}.csv`);
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Leads</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-950">Creator CRM</h1>
          <p className="mt-1 text-sm text-slate-500">Every form submit, DM opt-in, WhatsApp click, and product interest lands here.</p>
        </div>
        <Button variant="outline" className="rounded-lg" onClick={handleExportCSV} disabled={filteredLeads.length === 0}>
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Real Statistics Cards */}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          [stats.total, "Total leads"],
          [stats.thisWeek, "This week"],
          [stats.conversionRate, "Lead conversion"],
        ].map(([value, label]) => {
          const parsed = parseValueForCountUp(value);
          return (
            <div key={label as string} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <Users className="h-5 w-5 text-slate-500" />
              <p className="mt-4 text-2xl font-semibold text-slate-950">
                <CountUp
                  end={parsed.end}
                  prefix={parsed.prefix}
                  suffix={parsed.suffix}
                  decimals={parsed.decimals}
                  triggerImmediately={true}
                />
              </p>
              <p className="text-sm text-slate-500">{label as string}</p>
            </div>
          );
        })}
      </div>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="relative flex flex-col gap-3 border-b border-slate-100 p-4 md:flex-row">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
            <Search className="h-4 w-4 text-slate-400" />
            <input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="min-w-0 flex-1 bg-transparent text-sm outline-none" 
              placeholder="Search lead, handle, email, or campaign" 
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")}>
                <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
              </button>
            )}
          </div>
          
          <div className="relative">
            <Button 
              variant="outline" 
              className={`rounded-lg ${selectedTag ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50' : ''}`}
              onClick={() => setShowFilterMenu(!showFilterMenu)}
            >
              <Filter className="h-4 w-4" />
              {selectedTag ? `Tag: ${selectedTag}` : 'Filter'}
            </Button>

            {showFilterMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg border border-slate-200 bg-white p-2 shadow-lg z-10">
                <p className="text-xs font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider">Filter by Tag</p>
                <div className="mt-1 space-y-1">
                  <button 
                    onClick={() => { setSelectedTag(null); setShowFilterMenu(false); }}
                    className={`w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-slate-50 ${!selectedTag ? 'font-medium text-[#6d48ff]' : 'text-slate-600'}`}
                  >
                    All Tags
                  </button>
                  {allTags.map((tag) => (
                    <button 
                      key={tag}
                      onClick={() => { setSelectedTag(tag); setShowFilterMenu(false); }}
                      className={`w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-slate-50 capitalize ${selectedTag === tag ? 'font-medium text-[#6d48ff]' : 'text-slate-600'}`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Leads List */}
        {filteredLeads.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Users className="h-10 w-10 text-slate-300" />
            <h3 className="mt-4 font-semibold text-slate-900">No leads found</h3>
            <p className="mt-1 text-sm text-slate-500">
              {searchTerm || selectedTag 
                ? "Try clearing filters or adjusting your search term."
                : "Your synced creator leads will appear here."}
            </p>
            {(searchTerm || selectedTag) && (
              <Button 
                variant="link" 
                className="mt-2 text-[#6d48ff] font-semibold"
                onClick={() => { setSearchTerm(""); setSelectedTag(null); }}
              >
                Clear all filters
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredLeads.map((lead: any) => (
              <div key={lead.id ?? lead._id} className="grid gap-4 p-5 lg:grid-cols-[1fr_1fr_0.8fr_0.4fr] lg:items-center">
                <div>
                  <p className="font-semibold text-slate-950">{lead.name || lead.instagram_username || lead.instagramUsername || "Anonymous Creator"}</p>
                  <p className="text-sm text-slate-500">{ (lead.instagram_username || lead.instagramUsername) ? `@${lead.instagram_username || lead.instagramUsername}` : "No Instagram linked"}</p>
                </div>
                <div className="space-y-1 text-sm text-slate-600">
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-slate-400" /> 
                    {lead.email || <span className="text-slate-400 italic">No email provided</span>}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-slate-400" /> 
                    {lead.phone || <span className="text-slate-400 italic">No phone provided</span>}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">{lead.campaignName}</p>
                  <p className="text-xs text-slate-500">Source campaign</p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {(lead.tags || ["New"]).map((tag: string) => (
                    <span key={tag} className="flex w-fit items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 capitalize">
                      <Tag className="h-3 w-3 text-slate-400" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
