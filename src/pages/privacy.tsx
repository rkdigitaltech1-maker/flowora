import { PageLayout } from "@/components/PageLayout.tsx";

export default function PrivacyPage() {
  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto px-5 py-12 text-left space-y-8 font-medium text-slate-600 text-sm leading-relaxed">
        
        {/* Header */}
        <div className="space-y-2 text-center pb-6">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">Privacy Policy</h1>
          <p className="text-slate-400 text-xs font-semibold">Last Updated: May 23, 2026</p>
        </div>

        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wide">1. Information We Collect</h2>
          <p>
            We collect information when you connect your Instagram account via Meta OAuth and create an account. This includes:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 font-semibold text-xs">
            <li>Your name, email address, and professional credentials.</li>
            <li>Your Instagram account details (business username, profile photo, and follower metrics).</li>
            <li>Instagram message webhooks metadata (e.g. comment keywords, comment texts, user handles triggering automation, DM timestamp). We do not read or record unrelated personal private messages.</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wide">2. How We Use Your Information</h2>
          <p>
            Your information is used solely to provide and optimize the automation services:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 font-semibold text-xs">
            <li>Processing webhooks and delivering comment replies or DMs.</li>
            <li>Tracking conversion analytics (click rates, trigger rates, leads captured, Stripe checkouts MTD) displayed in your creator dashboard.</li>
            <li>Providing security validation and billing support services.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wide">3. Data Security &amp; Encryption</h2>
          <p>
            We deploy secure technology systems to safeguard your records. All API tokens, auth codes, database tables, and communication channels are encrypted using SSL protocol. Flowora utilizes secure database instances hosted by Supabase and secure webhook triggers.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wide">4. Meta &amp; Stripe Partners</h2>
          <p>
            We synchronize transactions and webhooks with Meta Platforms, Inc. and Stripe, Inc. respectively. We do not sell or trade your data, and we do not use your audience's email submissions or contact handles for unauthorized commercial actions.
          </p>
        </section>
      </div>
    </PageLayout>
  );
}
