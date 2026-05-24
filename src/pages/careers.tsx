import { PageLayout } from "@/components/PageLayout.tsx";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";
import { Briefcase, MapPin, DollarSign, Heart } from "lucide-react";

export default function CareersPage() {
  const jobs = [
    {
      title: "Senior Frontend Engineer (React)",
      dept: "Engineering",
      location: "Remote (Global)",
      salary: "$110k - $140k + Equity",
      desc: "Lead the development of our premium workflow designer and dashboard UI. Experience with React, TypeScript, and state management required.",
    },
    {
      title: "Product Designer (UI/UX)",
      dept: "Design",
      location: "Remote (Global)",
      salary: "$90k - $120k + Equity",
      desc: "Own the look and feel of Flowora. Design premium layout flows, interactive elements, and maintain our design system.",
    },
    {
      title: "Growth Marketer (SaaS)",
      dept: "Marketing",
      location: "Remote (US/EU)",
      salary: "$80k - $105k + Equity",
      desc: "Drive creator acquisition across social media channels, influencer programs, and targeted search campaigns.",
    },
  ];

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto px-5 py-12 space-y-12">
        {/* Intro */}
        <div className="space-y-4 text-center">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#7c3cff] bg-violet-50 px-3 py-1 rounded-full border border-violet-100 shadow-inner">
            We Are Hiring
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            Build the Future of <br/>
            <span className="animated-gradient-text bg-gradient-to-r from-[#7c3cff] to-[#ec149e] bg-clip-text text-transparent">Creator Commerce</span>
          </h1>
          <p className="text-slate-555 text-base sm:text-lg max-w-xl mx-auto font-medium">
            Join a remote-first, high-growth startup building automation tools for the world's most successful creators.
          </p>
        </div>

        {/* Benefits Section */}
        <div className="bg-[#f8f6ff] border border-violet-100/50 p-8 rounded-3xl space-y-6">
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Heart className="h-5 w-5 text-[#7c3cff] fill-[#7c3cff]" /> Company Benefits
          </h2>
          <div className="grid sm:grid-cols-3 gap-6 font-bold text-xs text-slate-600">
            <div className="space-y-2">
              <h4 className="text-slate-900 font-extrabold">Fully Remote</h4>
              <p className="text-slate-450 leading-relaxed font-semibold">Work from anywhere in the world. We offer flexible working hours and asynchronous collaboration.</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-slate-900 font-extrabold">Learning Stipend</h4>
              <p className="text-slate-450 leading-relaxed font-semibold">Get $2,000 annually for books, courses, conferences, or home office setup upgrades.</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-slate-900 font-extrabold">Generous Time Off</h4>
              <p className="text-slate-450 leading-relaxed font-semibold">Enjoy 25 days of paid annual leave plus federal/local holidays and mental health days.</p>
            </div>
          </div>
        </div>

        {/* Open Positions List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Open Positions</h2>
          <div className="space-y-4">
            {jobs.map((job, idx) => (
              <div key={idx} className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm hover:border-violet-200 transition-all flex flex-col justify-between gap-4">
                <div className="space-y-2 text-left">
                  <h3 className="font-extrabold text-slate-900 text-base">{job.title}</h3>
                  <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-450 font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" /> {job.dept}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {job.location}</span>
                    <span className="flex items-center gap-1 text-[#7c3cff]"><DollarSign className="h-3.5 w-3.5" /> {job.salary}</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold pt-1">{job.desc}</p>
                </div>
                <Button className="w-fit h-9 text-[10px] rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-extrabold cursor-pointer">
                  Apply Now
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
