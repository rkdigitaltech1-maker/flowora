import { PageLayout } from "@/components/PageLayout.tsx";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";
import { Calendar, User, ArrowRight } from "lucide-react";

export default function BlogPage() {
  const posts = [
    {
      title: "5 Ways to Automate Your Instagram DMs for High Conversion",
      category: "Guides",
      author: "Emma Taylor",
      date: "May 20, 2026",
      desc: "Learn how to use keyword comment triggers, story replies, and personalized sales checkouts inside Instagram chats to grow sales by 10x.",
      bgGradient: "from-pink-500 to-rose-400",
    },
    {
      title: "Meta Developer Guidelines: Keeping Your Instagram Account Safe",
      category: "Safety",
      author: "Carlos Vega",
      date: "May 15, 2026",
      desc: "We discuss the security differences between browser-scraping extensions (unauthorized bots) and official Meta Graph API webhooks.",
      bgGradient: "from-violet-500 to-indigo-400",
    },
    {
      title: "How Aisha Patel Captured 1,200 New Leads in One Month",
      category: "Case Study",
      author: "Aisha Patel",
      date: "May 10, 2026",
      desc: "An in-depth look at a fitness coach's workflow that turned post commenters into email subscribers automatically using our lead forms.",
      bgGradient: "from-emerald-500 to-teal-400",
    },
  ];

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto px-5 py-12 space-y-12">
        {/* Intro */}
        <div className="space-y-4 text-center">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#7c3cff] bg-violet-50 px-3 py-1 rounded-full border border-violet-100 shadow-inner">
            Insights &amp; Updates
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            Flowora <br/>
            <span className="animated-gradient-text bg-gradient-to-r from-[#7c3cff] to-[#ec149e] bg-clip-text text-transparent">Growth Blog</span>
          </h1>
          <p className="text-slate-555 text-base sm:text-lg max-w-xl mx-auto font-medium">
            Read our guides, customer stories, and API updates to boost your social media conversion rates.
          </p>
        </div>

        {/* Featured Card */}
        <div className="bg-slate-950 text-white rounded-3xl p-8 relative overflow-hidden shadow-xl border border-slate-900">
          <div className="absolute right-0 top-0 w-80 h-80 bg-[#7c3cff]/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="relative space-y-4 z-10 text-left">
            <span className="text-[9px] font-black uppercase tracking-widest bg-violet-600/20 text-[#7c3cff] border border-violet-500/20 px-3 py-1 rounded-full">
              FEATURED ARTICLE
            </span>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
              The Complete Guide to Automating Stripe Checkout in Instagram DMs
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed font-semibold max-w-xl">
              Setting up digital storefronts can be complex. Learn how to connect your Stripe account, create digital download links, and deliver checkouts instantly.
            </p>
            <Button className="h-9 px-4 text-[10px] rounded-lg bg-white text-slate-950 hover:bg-slate-50 font-extrabold cursor-pointer flex items-center gap-1">
              Read Article <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* List of articles */}
        <div className="grid md:grid-cols-3 gap-6">
          {posts.map((post, idx) => (
            <div key={idx} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-slate-200 transition-all flex flex-col justify-between">
              <div className={`h-24 bg-gradient-to-tr ${post.bgGradient} flex items-center p-5`}>
                <span className="text-[10px] font-black uppercase text-white bg-white/15 px-2.5 py-1 rounded-md backdrop-blur-md">
                  {post.category}
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4 text-left">
                <div className="space-y-2">
                  <h3 className="font-extrabold text-slate-900 text-xs leading-snug hover:text-[#7c3cff] transition-colors cursor-pointer">
                    {post.title}
                  </h3>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                    {post.desc}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-[9px] text-slate-400 font-bold border-t border-slate-50 pt-3">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {post.date}</span>
                  <span className="flex items-center gap-1"><User className="h-3 w-3" /> {post.author}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
