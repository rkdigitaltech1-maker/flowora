import { PageLayout } from "@/components/PageLayout.tsx";

export default function TermsPage() {
  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto px-5 py-12 text-left space-y-8 font-medium text-slate-600 text-sm leading-relaxed">
        
        {/* Header */}
        <div className="space-y-2 text-center pb-6">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">Terms of Service</h1>
          <p className="text-slate-400 text-xs font-semibold">Last Updated: May 23, 2026</p>
        </div>

        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wide">1. Acceptance of Terms</h2>
          <p>
            By creating a Flowora account and connecting your Instagram profile, you agree to comply with and be bound by these Terms of Service. If you do not agree, you must not use or connect your account.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wide">2. Permitted Use &amp; Compliance</h2>
          <p>
            You agree to use Flowora only for legitimate engagement and transaction purposes:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 font-semibold text-xs">
            <li>You must comply with Meta developer agreements and not deliver spam, misleading content, or phishing pages.</li>
            <li>We reserve the right to suspend or terminate accounts that trigger high rates of reports or use unauthorized keywords.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wide">3. Subscriptions &amp; Billing</h2>
          <p>
            We offer monthly subscription tiers (Starter, Pro, and Enterprise) billed automatically on a recurring cycle. Starter plan includes 500 DMs/mo limits, while Pro plan provides unlimited delivery parameters. We offer a 14-day free trial on all new plans. You can cancel at any time from your settings billing tab.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wide">4. Limitation of Liability</h2>
          <p>
            Flowora operates as an official developer platform, but we are not liable for modifications in Instagram's Graph API, API webhooks outages, or business actions taken by Meta Platforms, Inc. regarding your professional account status.
          </p>
        </section>
      </div>
    </PageLayout>
  );
}
