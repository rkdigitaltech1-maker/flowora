import { PageLayout } from "@/components/PageLayout.tsx";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";
import { MessageSquare, Mail, ShieldAlert, Key, Search, ChevronRight } from "lucide-react";

export default function SupportPage() {
  const categories = [
    {
      title: "Instagram Connection",
      icon: Key,
      color: "bg-pink-50 text-pink-600 border-pink-100",
      desc: "Troubleshoot Facebook page linkage, business profile status, and authorization scopes.",
    },
    {
      title: "Stripe Storefronts",
      icon: Mail,
      color: "bg-blue-50 text-blue-600 border-blue-100",
      desc: "Connect your seller dashboard, create checkouts, set webhook routes, and configure payments.",
    },
    {
      title: "Workflow Builders",
      icon: MessageSquare,
      color: "bg-violet-50 text-violet-600 border-violet-100",
      desc: "Set up triggers for keywords, story poll reactions, re-entry limits, and delay intervals.",
    },
    {
      title: "Security & Guidelines",
      icon: ShieldAlert,
      color: "bg-red-50 text-red-600 border-red-100",
      desc: "Understand Meta compliance parameters, safety boundaries, and sandbox configurations.",
    },
  ];

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto px-5 py-12 space-y-12">
        {/* Intro */}
        <div className="space-y-4 text-center">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#7c3cff] bg-violet-50 px-3 py-1 rounded-full border border-violet-100 shadow-inner">
            Help Center
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            How Can We <br/>
            <span className="animated-gradient-text bg-gradient-to-r from-[#7c3cff] to-[#ec149e] bg-clip-text text-transparent">Help You Today?</span>
          </h1>
          <p className="text-slate-555 text-base sm:text-lg max-w-xl mx-auto font-medium">
            Search our knowledge base or reach out to our active developer support team.
          </p>

          {/* Search bar */}
          <div className="max-w-lg mx-auto flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 mt-6 shadow-sm">
            <Search className="h-4.5 w-4.5 text-slate-400 ml-2" />
            <input
              type="text"
              placeholder="Search help articles, categories, triggers..."
              className="flex-1 bg-transparent text-xs font-semibold outline-none py-1.5 px-1"
            />
            <Button className="h-9 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs cursor-pointer">
              Search
            </Button>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid sm:grid-cols-2 gap-6 pt-6">
          {categories.map((c, idx) => {
            const Icon = c.icon;
            return (
              <div key={idx} className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm hover:border-violet-200 hover:shadow-md transition-all flex flex-col justify-between items-start gap-4">
                <div className="space-y-3 text-left">
                  <span className={`h-9 w-9 rounded-xl flex items-center justify-center border ${c.color}`}>
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  <h3 className="font-extrabold text-slate-900 text-sm">{c.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">{c.desc}</p>
                </div>
                <button className="text-[10px] font-black text-[#7c3cff] uppercase tracking-wider flex items-center gap-0.5 hover:underline cursor-pointer">
                  Browse Articles <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Support Callout */}
        <div className="bg-slate-950 text-white rounded-3xl p-8 relative overflow-hidden shadow-xl border border-slate-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="absolute right-0 top-0 w-80 h-80 bg-pink-500/5 rounded-full blur-[80px] pointer-events-none" />
          <div className="relative space-y-2 z-10 text-left">
            <h2 className="text-lg sm:text-xl font-black tracking-tight">
              Can't find what you are looking for?
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed font-semibold max-w-md">
              Our 24/7 technical customer support team is ready to help you resolve API connection, dashboard, or workflow challenges.
            </p>
          </div>
          <a href="mailto:support@flowora.com" className="shrink-0 relative z-10">
            <Button className="h-11 px-6 rounded-xl bg-gradient-to-r from-[#7c3cff] to-[#ec149e] hover:opacity-90 text-white font-extrabold text-xs cursor-pointer flex items-center gap-1.5">
              <Mail className="h-4 w-4" /> Email Developer Support
            </Button>
          </a>
        </div>
      </div>
    </PageLayout>
  );
}
