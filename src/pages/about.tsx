import { PageLayout } from "@/components/PageLayout.tsx";
import { Zap, Shield, Users, Heart } from "lucide-react";

export default function AboutPage() {
  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto px-5 py-12 space-y-12">
        {/* Intro */}
        <div className="space-y-4 text-center">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#7c3cff] bg-violet-50 px-3 py-1 rounded-full border border-violet-100 shadow-inner">
            Our Mission
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            Empowering Creators to <br/>
            <span className="animated-gradient-text bg-gradient-to-r from-[#7c3cff] to-[#ec149e] bg-clip-text text-transparent">Scale Automatically</span>
          </h1>
          <p className="text-slate-500 text-base sm:text-lg max-w-xl mx-auto font-medium">
            Flowora is the leading Instagram DM Automation platform built specifically for course creators, educators, fitness coaches, and digital brands.
          </p>
        </div>

        {/* Brand Values Grid */}
        <div className="grid md:grid-cols-2 gap-6 pt-6">
          <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-3">
            <span className="h-10 w-10 rounded-xl bg-violet-50 text-[#7c3cff] flex items-center justify-center">
              <Zap className="h-5 w-5 fill-current" />
            </span>
            <h3 className="font-extrabold text-slate-900 text-sm">Instant Engagement</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              Say goodbye to manual copy-pasting. We trigger responses within 0.8s, ensuring you convert hot comments immediately before they scroll away.
            </p>
          </div>
          <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-3">
            <span className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Shield className="h-5 w-5" />
            </span>
            <h3 className="font-extrabold text-slate-900 text-sm">Meta Compliant &amp; Safe</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              We leverage the official Meta Graph API Webhooks. No scraping, no shadow-bans, and no risk to your credentials. Your security is our priority.
            </p>
          </div>
          <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-3">
            <span className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </span>
            <h3 className="font-extrabold text-slate-900 text-sm">Built For Growth</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              From lead capture validation to direct Stripe checkouts inside DMs, our workflow engine connects the dots so you can focus on building content.
            </p>
          </div>
          <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-3">
            <span className="h-10 w-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
              <Heart className="h-5 w-5 fill-current" />
            </span>
            <h3 className="font-extrabold text-slate-900 text-sm">Customer Obsessed</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              Over 60,000+ creators worldwide trust us to deliver automations day in and day out. We offer 24/7 technical support to keep your business running.
            </p>
          </div>
        </div>

        {/* Story */}
        <hr className="border-slate-100 my-8" />
        <div className="space-y-4 max-w-2xl mx-auto font-medium text-slate-600 text-sm leading-relaxed">
          <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Our Story</h2>
          <p>
            Flowora started in 2025 out of a simple problem: digital creators were wasting hours copy-pasting links in DMs or manually managing comments on their viral Instagram posts.
          </p>
          <p>
            We realized that existing bot platforms were clunky, dangerous for account health, and hard to configure. We set out to build a modern, high-fidelity SaaS that integrates directly with Stripe and Meta Graph APIs, making automation intuitive and secure.
          </p>
          <p>
            Today, our platform handles millions of messages monthly, generating millions in revenue for creators and sellers globally.
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
