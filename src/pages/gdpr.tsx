import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Database, FileText, LockKeyhole, Mail, ShieldCheck, UserCheck } from "lucide-react";
import { motion } from "motion/react";
import { PageLayout } from "@/components/PageLayout.tsx";

const commitments = [
  {
    icon: ShieldCheck,
    title: "Privacy by design",
    body: "Flowora only collects data needed to run Instagram automation, lead capture, analytics, billing, and support.",
  },
  {
    icon: UserCheck,
    title: "User rights supported",
    body: "Creators and contacts may request access, correction, export, restriction, objection, or deletion of personal data.",
  },
  {
    icon: LockKeyhole,
    title: "Security controls",
    body: "We use encrypted transport, access controls, audit logging, token protection, and webhook safety practices.",
  },
  {
    icon: Database,
    title: "Processor discipline",
    body: "Third-party services are used only for hosting, payments, authentication, analytics, AI assistance, and support operations.",
  },
];

const rights = [
  "Access a copy of personal data connected to your account or submitted through a creator form.",
  "Correct inaccurate profile, contact, lead, or campaign data.",
  "Request deletion of personal data where retention is no longer required.",
  "Request export of supported account, lead, and campaign records.",
  "Object to or restrict certain processing where applicable.",
  "Withdraw consent for opt-in based contact collection and campaign communications.",
];

export default function GdprPage() {
  return (
    <PageLayout>
      <main className="relative overflow-hidden bg-white pt-28">
        <div className="absolute inset-x-0 top-0 h-[420px] bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50" />
        <div className="absolute left-1/4 top-20 h-80 w-80 rounded-full bg-purple-300/20 blur-3xl" />
        <div className="absolute right-1/4 top-32 h-72 w-72 rounded-full bg-blue-300/20 blur-3xl" />

        <section className="relative z-10 mx-auto max-w-5xl px-6 pb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mx-auto inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700"
          >
            <ShieldCheck className="h-4 w-4" />
            GDPR Compliant
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="mx-auto mt-6 max-w-3xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl"
          >
            GDPR commitment for creator automation.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="mx-auto mt-6 max-w-3xl text-lg font-medium leading-8 text-slate-600"
          >
            Flowora is built to help creators automate Instagram engagement while respecting privacy rights, consent, data minimization, retention controls, and secure processing.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.24 }}
            className="mx-auto mt-4 max-w-2xl text-xs font-semibold leading-6 text-slate-400"
          >
            This page summarizes our product controls and operating commitments. It is not legal advice.
          </motion.p>
        </section>

        <section className="relative z-10 mx-auto max-w-7xl px-6 pb-20">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {commitments.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_55px_rgba(30,41,59,0.07)]"
              >
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white">
                  <item.icon className="h-6 w-6" />
                </div>
                <h2 className="mt-5 text-lg font-black text-slate-950">{item.title}</h2>
                <p className="mt-3 text-sm font-medium leading-6 text-slate-600">{item.body}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="bg-slate-50 py-20">
          <div className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-[0.9fr_1.1fr]">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
              className="rounded-3xl bg-[#121d2c] p-8 text-white shadow-2xl shadow-slate-900/10"
            >
              <FileText className="h-10 w-10 text-emerald-400" />
              <h2 className="mt-6 text-3xl font-black tracking-tight">What data Flowora processes</h2>
              <p className="mt-5 text-sm font-medium leading-7 text-slate-300">
                Flowora processes creator account data, Instagram Business account metadata, campaign settings, automation events, lead form submissions, product purchase records, analytics events, support messages, and billing records required to operate the SaaS.
              </p>
              <p className="mt-4 text-sm font-medium leading-7 text-slate-300">
                We do not sell creator audience data. We use data to provide requested automation, security, analytics, payments, support, and compliance workflows.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
              className="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_18px_55px_rgba(30,41,59,0.07)]"
            >
              <h2 className="text-2xl font-black text-slate-950">Data subject rights</h2>
              <p className="mt-3 text-sm font-medium leading-7 text-slate-600">
                Where GDPR applies, we support the following requests after identity and account ownership are reasonably verified:
              </p>
              <div className="mt-6 grid gap-3">
                {rights.map((right) => (
                  <div key={right} className="flex gap-3 rounded-2xl bg-slate-50 p-4">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                    <p className="text-sm font-semibold leading-6 text-slate-700">{right}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              ["Lawful basis", "We rely on contract performance, legitimate interests, consent, and legal obligations depending on the processing activity."],
              ["Retention", "We retain records only as long as needed for product operations, legal compliance, dispute handling, fraud prevention, and creator account continuity."],
              ["International transfers", "When data is processed outside the EEA/UK, we use appropriate safeguards with processors where applicable."],
            ].map(([title, body]) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45 }}
                className="rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_18px_55px_rgba(30,41,59,0.06)]"
              >
                <h2 className="text-xl font-black text-slate-950">{title}</h2>
                <p className="mt-4 text-sm font-medium leading-7 text-slate-600">{body}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="px-6 pb-20">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-10 text-center text-white shadow-2xl shadow-purple-500/20">
            <Mail className="mx-auto h-10 w-10" />
            <h2 className="mt-5 text-3xl font-black tracking-tight">Submit a GDPR request</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm font-medium leading-7 text-white/85">
              For access, correction, export, deletion, or processor questions, contact our privacy team. We may ask for verification before acting on a request.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <a
                href="mailto:privacy@flowora.tech"
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-black text-purple-700 transition hover:bg-slate-50"
              >
                privacy@flowora.tech
              </a>
              <Link
                to="/privacy"
                className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3 text-sm font-black text-white transition hover:bg-white/10"
              >
                Read Privacy Policy
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </PageLayout>
  );
}
