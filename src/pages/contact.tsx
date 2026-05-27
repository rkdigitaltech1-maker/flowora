import { useState } from "react";
import { PageLayout } from "@/components/PageLayout.tsx";
import { motion } from "motion/react";
import { Mail, MessageSquare, Clock, MapPin, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { toast } from "sonner";

const contactMethods = [
  {
    icon: Mail,
    title: "Email Support",
    description: "Get a response within 24 hours for general queries and account help.",
    value: "support@flowora.tech",
    href: "mailto:support@flowora.tech",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: MessageSquare,
    title: "Live Chat",
    description: "Available for Pro plan users. Get real-time help from our automation experts.",
    value: "In-app chat (Pro users)",
    href: "/login",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Clock,
    title: "Response Time",
    description: "We typically respond within 4-12 hours during business days (Mon-Sat, IST).",
    value: "4-12 hours",
    href: null,
    color: "from-emerald-500 to-green-500",
  },
  {
    icon: MapPin,
    title: "Headquarters",
    description: "Flowora is operated from India, serving creators worldwide.",
    value: "India",
    href: null,
    color: "from-orange-500 to-red-500",
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    // Simulate submission
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success("Message sent! We'll get back to you soon.");
    }, 1200);
  };

  return (
    <PageLayout>
      <main className="relative overflow-hidden bg-white pt-28">
        {/* Background */}
        <div className="absolute inset-x-0 top-0 h-[420px] bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" />
        <div className="absolute left-1/3 top-20 h-80 w-80 rounded-full bg-blue-300/20 blur-3xl" />
        <div className="absolute right-1/4 top-32 h-72 w-72 rounded-full bg-indigo-300/20 blur-3xl" />

        {/* Header */}
        <section className="relative z-10 mx-auto max-w-5xl px-6 pb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mx-auto inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700"
          >
            <Mail className="h-4 w-4" />
            We're here to help
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="mx-auto mt-6 max-w-3xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl"
          >
            Contact Us
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="mx-auto mt-6 max-w-2xl text-lg font-medium leading-8 text-slate-600"
          >
            Have a question, need support, or want to share feedback? We'd love to hear from you. Our team is ready to assist.
          </motion.p>
        </section>

        {/* Contact Methods */}
        <section className="relative z-10 mx-auto max-w-7xl px-6 pb-20">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {contactMethods.map((method, index) => (
              <motion.div
                key={method.title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_55px_rgba(30,41,59,0.07)] text-center"
              >
                <div className={`mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${method.color} text-white`}>
                  <method.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-base font-black text-slate-950">{method.title}</h3>
                <p className="mt-2 text-xs font-medium leading-5 text-slate-500">{method.description}</p>
                {method.href ? (
                  <a
                    href={method.href}
                    className="mt-3 inline-block text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    {method.value}
                  </a>
                ) : (
                  <p className="mt-3 text-sm font-bold text-slate-700">{method.value}</p>
                )}
              </motion.div>
            ))}
          </div>
        </section>

        {/* Contact Form */}
        <section className="bg-slate-50 py-20">
          <div className="mx-auto max-w-3xl px-6">
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
              className="rounded-3xl border border-slate-200 bg-white p-8 md:p-10 shadow-[0_18px_55px_rgba(30,41,59,0.07)]"
            >
              {submitted ? (
                <div className="text-center py-12">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-500" />
                  </motion.div>
                  <h3 className="mt-6 text-2xl font-black text-slate-950">Message Sent!</h3>
                  <p className="mt-3 text-sm font-medium text-slate-600 max-w-md mx-auto">
                    Thank you for reaching out. Our team will review your message and get back to you within 24 hours.
                  </p>
                  <Button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: "", email: "", subject: "", message: "" });
                    }}
                    variant="outline"
                    className="mt-6"
                  >
                    Send another message
                  </Button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-black text-slate-950 mb-2">Send us a message</h2>
                  <p className="text-sm font-medium text-slate-500 mb-8">
                    Fill in the form below and we'll get back to you as soon as possible.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                          placeholder="you@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Subject</label>
                      <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                        placeholder="What's this about?"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Message <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
                        placeholder="Tell us how we can help..."
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:opacity-90 text-white font-bold py-5 rounded-xl shadow-lg shadow-purple-200 transition-all"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        </section>
      </main>
    </PageLayout>
  );
}
