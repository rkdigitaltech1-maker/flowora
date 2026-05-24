import { Bot, Check, ChevronRight, Link2, MessageCircle, Pause, Play, Plus, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { useCampaigns } from "@/lib/supabase-hooks.ts";

const steps = [
  "Choose trigger",
  "Select post or reel",
  "Add keywords",
  "Write DM reply",
  "Attach CTA",
  "Review safety",
];

export default function CampaignsPage() {
  const { campaigns: dbCampaigns, loading } = useCampaigns();

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-120px)] flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-[#6d48ff]" />
        <p className="text-sm font-semibold text-[#82799b]">Syncing with real stats...</p>
      </div>
    );
  }

  const campaignsList = dbCampaigns || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Campaigns</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-950">Build Instagram automation flows</h1>
          <p className="mt-1 text-sm text-slate-500">Start with comment-to-DM and DM keyword replies, then add lead forms, products, or WhatsApp CTAs.</p>
        </div>
        <Button className="rounded-lg bg-slate-950 hover:bg-slate-800">
          <Plus className="h-4 w-4" />
          New campaign
        </Button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.36fr_0.64fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <MessageCircle className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-semibold text-slate-950">Campaign wizard</h2>
              <p className="text-sm text-slate-500">V1 guided builder</p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {steps.map((step, index) => (
              <div key={step} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-950 text-xs font-semibold text-white">{index + 1}</span>
                <span className="text-sm font-medium text-slate-800">{step}</span>
                <ChevronRight className="ml-auto h-4 w-4 text-slate-300" />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white">
          <div className="grid gap-4 border-b border-slate-100 p-5 lg:grid-cols-3">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-950">Default safety</p>
              <p className="mt-1 text-xs text-slate-500">Send once per user, queue retries, throttle viral posts.</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-950">Template</p>
              <p className="mt-1 text-xs text-slate-500">Hey {"{{first_name}}"}, here is {"{{cta_link}}"}.</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-950">AI assist</p>
              <p className="mt-1 text-xs text-slate-500">Generate replies and product FAQs from a short prompt.</p>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {campaignsList.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <MessageCircle className="h-10 w-10 text-slate-300" />
                <h3 className="mt-4 font-semibold text-slate-950">No campaigns found</h3>
                <p className="mt-1 text-sm text-slate-500">Create an automation flow to get started.</p>
              </div>
            ) : (
              campaignsList.map((campaign) => (
                <div key={campaign._id} className="grid gap-4 p-5 lg:grid-cols-[1fr_0.5fr_0.4fr_0.4fr_0.35fr] lg:items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-950">{campaign.name}</p>
                      {campaign.status === "active" ? <Play className="h-3.5 w-3.5 text-emerald-600" /> : <Pause className="h-3.5 w-3.5 text-amber-500" />}
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {campaign.triggerType === "comment_keyword" || campaign.triggerType === "comment_automation" ? "Comment keyword" : "DM keyword"} · keyword "{campaign.keywords.join(", ")}"
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Link2 className="h-4 w-4" />
                    {campaign.cta}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{campaign.dmsCount.toLocaleString()}</p>
                    <p className="text-xs text-slate-500">DMs</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{campaign.leadsCount.toLocaleString()}</p>
                    <p className="text-xs text-slate-500">Leads</p>
                  </div>
                  <Button variant="outline" className="rounded-lg">Edit</Button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <ShieldCheck className="h-5 w-5 text-emerald-600" />
          <h2 className="mt-4 font-semibold text-slate-950">Compliance first</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">Every campaign has duplicate protection, per-account rate limits, audit logs, and a pause switch for Meta errors.</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <Bot className="h-5 w-5 text-slate-950" />
          <h2 className="mt-4 font-semibold text-slate-950">AI copy generator</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">Use AI to draft short, friendly replies for lead magnets, course launches, consult calls, and digital product drops.</p>
        </div>
      </section>
    </div>
  );
}

