import { PageLayout } from "@/components/PageLayout.tsx";
import { Link } from "react-router-dom";
import { ShieldCheck, ShieldAlert, Key, MessageSquare } from "lucide-react";

export default function SafetyPage() {
  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto px-5 py-12 space-y-12">
        {/* Intro */}
        <div className="space-y-4 text-center">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#7c3cff] bg-violet-50 px-3 py-1 rounded-full border border-violet-100 shadow-inner">
            Compliance &amp; Security
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            Safety &amp; Compliance <br/>
            <span className="animated-gradient-text bg-gradient-to-r from-[#7c3cff] to-[#ec149e] bg-clip-text text-transparent">Official Guide</span>
          </h1>
          <p className="text-slate-555 text-base sm:text-lg max-w-xl mx-auto font-medium">
            Learn how Flowora protects your account reputation and adheres strictly to Instagram's developer ecosystem policies.
          </p>
        </div>

        {/* Section 1: Meta Official API */}
        <div className="bg-white border border-slate-100 p-8 rounded-3xl shadow-sm text-left space-y-4">
          <div className="flex items-center gap-3">
            <span className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Official Meta Graph API Integration</h2>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed font-semibold">
            Unlike legacy Instagram automation tools that use browser extensions, automation scripts, or unofficial scrapers to simulate user inputs (which are flagrantly forbidden and result in account bans), Flowora connects directly through the official Meta Graph API oauth scopes.
          </p>
          <ul className="list-disc list-inside text-xs text-slate-500 font-semibold space-y-1.5 pl-2">
            <li>We never ask for your Instagram password (authentication occurs directly on Facebook's secure login servers).</li>
            <li>No scrapers or background automation processes simulation.</li>
            <li>All comment replies and DM events are standard API request payloads monitored by Meta's developer settings.</li>
          </ul>
        </div>

        {/* Section 2: Safety Boundaries */}
        <div className="bg-white border border-slate-100 p-8 rounded-3xl shadow-sm text-left space-y-4">
          <div className="flex items-center gap-3">
            <span className="h-10 w-10 rounded-xl bg-violet-50 text-[#7c3cff] flex items-center justify-center">
              <MessageSquare className="h-5 w-5 fill-current" />
            </span>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Sane Rate Limiting &amp; Boundaries</h2>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed font-semibold">
            To prevent spamming and maintain premium organic reach, we enforce rate-limiting guardrails in your workflows:
          </p>
          <div className="grid sm:grid-cols-2 gap-4 text-xs font-bold text-slate-600">
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
              <h4 className="text-slate-800 font-extrabold mb-1">Workflow Re-entry Limits</h4>
              <p className="text-slate-450 leading-relaxed font-semibold">We verify if a user already triggered a campaign workflow recently and can withhold repeat automated messages based on your preferences.</p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
              <h4 className="text-slate-800 font-extrabold mb-1">Human-Like Latencies</h4>
              <p className="text-slate-450 leading-relaxed font-semibold">We support optional message triggers delays to emulate manual responses, avoiding high-velocity automated replies profiles.</p>
            </div>
          </div>
        </div>

        {/* Section 3: Warning */}
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-3xl text-left flex gap-4">
          <ShieldAlert className="h-6 w-6 text-amber-700 shrink-0" />
          <div className="space-y-1">
            <h4 className="text-xs font-black text-amber-900 leading-none">Security Warning: Beware of Scrapers</h4>
            <p className="text-[11px] text-amber-800/80 leading-relaxed font-semibold">
              Never share your account passwords, session cookies, or verification codes with any third-party marketing tools. Official providers like Flowora will only request integration through Meta's OAuth screen.
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
