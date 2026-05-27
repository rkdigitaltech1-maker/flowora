import { PageLayout } from "@/components/PageLayout.tsx";
import { motion } from "motion/react";
import { Cookie, ShieldCheck, Settings, ToggleRight, Mail } from "lucide-react";

const cookieTypes = [
  {
    name: "Essential Cookies",
    description: "These cookies are strictly necessary for the website to function. They enable core features like security, session management, and accessibility. You cannot opt out of these cookies.",
    examples: ["Session authentication tokens", "CSRF protection", "Cookie consent preferences"],
    required: true,
  },
  {
    name: "Analytics Cookies",
    description: "These cookies help us understand how visitors interact with our website by collecting anonymous usage data. This helps us improve our product and user experience.",
    examples: ["Page visit counts", "Traffic sources", "User journey tracking", "Feature usage analytics"],
    required: false,
  },
  {
    name: "Functional Cookies",
    description: "These cookies enable enhanced functionality and personalization, such as remembering your preferences (language, currency, theme) and login sessions.",
    examples: ["Currency preference (INR/USD)", "Billing interval preference", "Dashboard layout settings"],
    required: false,
  },
  {
    name: "Marketing Cookies",
    description: "These cookies may be set through our site by advertising partners to build a profile of your interests and show you relevant ads. We currently do not use third-party advertising cookies.",
    examples: ["Currently not applicable"],
    required: false,
  },
];

export default function CookiesPage() {
  return (
    <PageLayout>
      <main className="relative overflow-hidden bg-white pt-28">
        {/* Background decorations */}
        <div className="absolute inset-x-0 top-0 h-[420px] bg-gradient-to-br from-orange-50 via-yellow-50 to-amber-50" />
        <div className="absolute left-1/4 top-20 h-80 w-80 rounded-full bg-orange-300/20 blur-3xl" />
        <div className="absolute right-1/4 top-32 h-72 w-72 rounded-full bg-yellow-300/20 blur-3xl" />

        {/* Header */}
        <section className="relative z-10 mx-auto max-w-5xl px-6 pb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mx-auto inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-bold text-orange-700"
          >
            <Cookie className="h-4 w-4" />
            Transparency First
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="mx-auto mt-6 max-w-3xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl"
          >
            Cookie Policy
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="mx-auto mt-6 max-w-3xl text-lg font-medium leading-8 text-slate-600"
          >
            This policy explains how Flowora uses cookies and similar technologies when you visit our website or use our platform.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.24 }}
            className="mx-auto mt-4 max-w-2xl text-xs font-semibold leading-6 text-slate-400"
          >
            Last updated: May 27, 2026
          </motion.p>
        </section>

        {/* What Are Cookies */}
        <section className="relative z-10 mx-auto max-w-5xl px-6 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_18px_55px_rgba(30,41,59,0.07)]"
          >
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex-shrink-0">
                <Cookie className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-950">What are cookies?</h2>
                <p className="mt-3 text-sm font-medium leading-7 text-slate-600">
                  Cookies are small text files stored on your device when you visit a website. They help websites remember your preferences, keep you logged in, and understand how you use the site. Cookies may be set by the website you are visiting ("first-party cookies") or by third-party services operating on that website.
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Cookie Types */}
        <section className="relative z-10 mx-auto max-w-7xl px-6 pb-20">
          <h2 className="text-2xl font-black text-slate-950 text-center mb-10">Types of cookies we use</h2>
          <div className="grid gap-5 md:grid-cols-2">
            {cookieTypes.map((cookie, index) => (
              <motion.div
                key={cookie.name}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_55px_rgba(30,41,59,0.07)]"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-black text-slate-950">{cookie.name}</h3>
                  {cookie.required ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                      <ShieldCheck className="h-3 w-3" />
                      Always Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600">
                      <ToggleRight className="h-3 w-3" />
                      Optional
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium leading-6 text-slate-600 mb-4">{cookie.description}</p>
                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Examples:</p>
                  {cookie.examples.map((example) => (
                    <div key={example} className="flex items-center gap-2 text-xs font-medium text-slate-500">
                      <div className="w-1 h-1 rounded-full bg-slate-400 flex-shrink-0" />
                      {example}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Managing Cookies */}
        <section className="bg-slate-50 py-20">
          <div className="mx-auto max-w-5xl px-6">
            <div className="grid gap-6 md:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45 }}
                className="rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_18px_55px_rgba(30,41,59,0.06)]"
              >
                <Settings className="h-8 w-8 text-purple-600" />
                <h2 className="mt-5 text-xl font-black text-slate-950">Managing your cookies</h2>
                <p className="mt-4 text-sm font-medium leading-7 text-slate-600">
                  Most web browsers allow you to manage cookie preferences through their settings. You can set your browser to refuse cookies or to alert you when cookies are being sent. Note that disabling certain cookies may affect the functionality of our platform.
                </p>
                <ul className="mt-4 space-y-2 text-sm font-medium text-slate-600">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                    <span><strong>Chrome:</strong> Settings &gt; Privacy and Security &gt; Cookies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                    <span><strong>Firefox:</strong> Settings &gt; Privacy & Security &gt; Cookies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                    <span><strong>Safari:</strong> Preferences &gt; Privacy &gt; Manage Website Data</span>
                  </li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45 }}
                className="rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_18px_55px_rgba(30,41,59,0.06)]"
              >
                <ShieldCheck className="h-8 w-8 text-emerald-600" />
                <h2 className="mt-5 text-xl font-black text-slate-950">Third-party cookies</h2>
                <p className="mt-4 text-sm font-medium leading-7 text-slate-600">
                  Some cookies on our site are set by third-party services that appear on our pages. We use the following third-party services that may set cookies:
                </p>
                <ul className="mt-4 space-y-2 text-sm font-medium text-slate-600">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                    <span><strong>Firebase/Google:</strong> Authentication and analytics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                    <span><strong>Stripe:</strong> Payment processing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                    <span><strong>Meta:</strong> Instagram API integration</span>
                  </li>
                </ul>
                <p className="mt-4 text-xs font-semibold text-slate-400">
                  These services have their own privacy and cookie policies. We encourage you to review them.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Updates & Contact */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 p-10 text-center text-white shadow-2xl shadow-orange-500/20">
            <Mail className="mx-auto h-10 w-10" />
            <h2 className="mt-5 text-3xl font-black tracking-tight">Questions about our cookies?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm font-medium leading-7 text-white/85">
              We may update this Cookie Policy from time to time to reflect changes in technology or regulation. If you have any questions about how we use cookies, please contact us.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <a
                href="mailto:privacy@flowora.tech"
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-black text-orange-700 transition hover:bg-slate-50"
              >
                privacy@flowora.tech
              </a>
            </div>
          </div>
        </section>
      </main>
    </PageLayout>
  );
}
