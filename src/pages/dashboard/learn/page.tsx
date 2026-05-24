import { BookOpen, Lock, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";

const lessons = [
  "Instagram comment-to-DM basics",
  "How to write high-converting DM copy",
  "Lead magnet funnels for influencers",
  "WhatsApp follow-up playbooks",
  "Digital product launch checklist",
  "Reading campaign analytics",
];

export default function LearnPage() {
  return (
    <div className="mx-auto max-w-[1180px] px-5 py-6 lg:px-10">
      <section className="rounded-[22px] bg-[#101326] p-8 text-white">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em]">
          <BookOpen className="h-4 w-4 text-[#9d91ff]" />
          Learn
        </span>
        <h1 className="mt-6 text-4xl font-bold">CreatorDM masterclass</h1>
        <p className="mt-3 max-w-2xl text-white/70">Short lessons for creators who want to turn comments, replies, and DMs into leads and product sales.</p>
      </section>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {lessons.map((lesson, index) => (
          <section key={lesson} className="flex items-center gap-4 rounded-[18px] border border-[#dfdbea] bg-white p-5 shadow-sm">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#f1edff] text-[#6d48ff]">
              {index < 2 ? <PlayCircle className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-bold">{lesson}</h2>
              <p className="text-sm text-[#82799b]">{index < 2 ? "Available in beta" : "Locked for Pro users"}</p>
            </div>
            <Button variant="outline" className="rounded-xl">{index < 2 ? "Watch" : "Unlock"}</Button>
          </section>
        ))}
      </div>
    </div>
  );
}
