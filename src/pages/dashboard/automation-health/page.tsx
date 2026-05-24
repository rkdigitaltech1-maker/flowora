import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Clock3, 
  Play, 
  RefreshCcw, 
  ShieldCheck, 
  MessageCircle, 
  Sparkles, 
  Video, 
  MessageSquare, 
  UserCheck, 
  Repeat, 
  Mail, 
  Flame, 
  Send,
  Heart,
  Smile,
  Image as ImageIcon,
  Mic,
  Loader2
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { useNavigate } from "react-router-dom";
import { useAutomationHealth } from "@/lib/supabase-hooks.ts";

const featureCards = [
  {
    id: "comment",
    title: "Comment Automation",
    description: "Reply to comments and send a DM to engage your followers.",
    trigger: "instagram_comment",
    previewType: "comment"
  },
  {
    id: "story",
    title: "Story Automation",
    description: "Auto respond to story replies and reactions.",
    trigger: "instagram_story_reply",
    previewType: "story"
  },
  {
    id: "live",
    title: "Live Automation",
    description: "Send a message to followers who are active during lives.",
    trigger: "webhook",
    previewType: "live"
  },
  {
    id: "dm",
    title: "DM Automation",
    description: "Automatically reply to the followers who messages you.",
    trigger: "instagram_dm",
    previewType: "dm"
  },
  {
    id: "follow_gate",
    title: "Ask For Follow",
    description: "Ask users to follow you before sending the message",
    trigger: "follow_gate",
    previewType: "follow"
  },
  {
    id: "re_trigger",
    title: "Re-trigger",
    description: "Re-trigger automations for old posts and never loose customers",
    trigger: "re_trigger",
    previewType: "re_trigger"
  },
  {
    id: "data_capture",
    title: "Collect User Data",
    description: "Create your email list to re target audience",
    trigger: "data_capture",
    previewType: "data"
  },
  {
    id: "ai_replies",
    title: "AI Replies",
    description: "Convert more users with the help of AI ✨",
    trigger: "ai_replies",
    previewType: "ai",
    isComingSoon: false
  }
];

export default function AutomationHealthPage() {
  const [activeTab, setActiveTab] = useState<"features" | "health">("features");
  const [keyword, setKeyword] = useState("GUIDE");
  const [username, setUsername] = useState("@demo.follower");
  const [isSimulating, setIsSimulating] = useState(false);
  const navigate = useNavigate();

  const { events, deliveries, loading, simulateEvent } = useAutomationHealth();

  const logs = events.map((e: any) => ({
    event: e.event_type ?? "unknown",
    status: e.status ?? "processed",
    detail: e.payload_json ? JSON.stringify(e.payload_json) : e.actor_username ?? "",
    time: e.created_at ? new Date(e.created_at).toLocaleTimeString() : "",
  }));
  const stats = {
    jobsProcessed: deliveries.length,
    queuedRetries: 0,
    rateLimits: 0,
    webhookStatus: "Healthy",
  };

  const metrics = useMemo(
    () => [
      [stats.webhookStatus, "Webhook receiver", CheckCircle2],
      [String(stats.jobsProcessed), "Jobs processed", Activity],
      [String(stats.queuedRetries), "Queued retries", Clock3],
      [String(stats.rateLimits), "Rate-limit pauses", AlertTriangle],
    ],
    [stats]
  );

  const runSimulation = async () => {
    setIsSimulating(true);
    try {
      await simulateEvent();
    } catch (err) {
      console.error("Simulation failed:", err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleConfigure = (trigger: string) => {
    navigate(`/dashboard/workflows?create=true&trigger=${trigger}`);
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-120px)] flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-[#6d48ff]" />
        <p className="text-sm font-semibold text-[#82799b]">Syncing with real stats...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Automations</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-950">Creator Automations Hub</h1>
          <p className="mt-1 text-sm text-slate-500">
            Showcase features, manage comments, story reactions, live flows, and diagnostic event logs.
          </p>
        </div>
        {activeTab === "health" && (
          <Button variant="outline" className="rounded-lg">
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
        )}
      </div>

      {/* Tabs Menu */}
      <div className="mt-6 flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("features")}
          className={`pb-4 px-6 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 ${
            activeTab === "features"
              ? "border-[#6d48ff] text-[#6d48ff]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Sparkles className="h-4 w-4" />
          Automation Features
        </button>
        <button
          onClick={() => setActiveTab("health")}
          className={`pb-4 px-6 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 ${
            activeTab === "health"
              ? "border-[#6d48ff] text-[#6d48ff]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Activity className="h-4 w-4" />
          Health Monitor & Logs
        </button>
      </div>

      {/* Active Tab View */}
      {activeTab === "features" ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featureCards.map((card) => (
            <div 
              key={card.id} 
              className="flex flex-col rounded-[22px] overflow-hidden bg-[#0d1020] border border-slate-800 text-white shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-slate-700"
            >
              {/* Preview Window (Mock Phone Frame half) */}
              <div className="h-[200px] bg-[#f8f9fc] flex flex-col justify-between border-b border-slate-850 relative overflow-hidden">
                {/* Visual renders based on previewType */}
                {card.previewType === "comment" && (
                  <div className="p-3 text-[11px] text-slate-800 h-full flex flex-col justify-between">
                    <div className="border-b border-slate-200 pb-1.5 font-bold text-center text-slate-500">Comments</div>
                    <div className="space-y-2 flex-1 mt-2">
                      <div className="flex gap-2">
                        <div className="h-5 w-5 rounded-full bg-indigo-500 text-white font-bold flex items-center justify-center shrink-0 text-[9px]">E</div>
                        <div>
                          <p className="font-semibold text-slate-900 flex items-center gap-1">Etienne <span className="text-[9px] text-slate-400 font-normal">2m</span></p>
                          <p className="text-slate-700 mt-0.5">Do you ship in Italy?</p>
                        </div>
                        <Heart className="h-3 w-3 text-slate-400 ml-auto self-center" />
                      </div>
                      <div className="flex gap-2 pl-6">
                        <div className="h-5 w-5 rounded-full bg-[#101326] text-white font-bold flex items-center justify-center shrink-0 text-[9px]">M</div>
                        <div>
                          <p className="font-semibold text-slate-900 flex items-center gap-1">muted_poetry <span className="text-[9px] text-slate-400 font-normal">now</span></p>
                          <p className="text-slate-700 mt-0.5"><span className="text-[#6d48ff] font-medium">@etienne</span> We ship in all Europe, including Italy!</p>
                        </div>
                        <Heart className="h-3 w-3 text-slate-400 ml-auto self-center" />
                      </div>
                    </div>
                  </div>
                )}

                {card.previewType === "story" && (
                  <div className="h-full bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-800 p-3 flex flex-col justify-between text-white">
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded-full bg-amber-400 border border-white flex items-center justify-center text-[9px] font-bold text-black">M</div>
                      <span className="text-[9px] font-bold">muted_poetry</span>
                      <span className="text-[8px] bg-red-600 px-1 py-0.2 rounded ml-auto uppercase font-black tracking-wider">Story</span>
                    </div>
                    <div className="my-auto self-center bg-black/60 backdrop-blur-md px-3 py-2 rounded-xl text-center max-w-[85%] border border-white/10">
                      <p className="text-[9px] font-semibold flex items-center justify-center gap-1">React with <Flame className="h-3 w-3 text-orange-400 fill-orange-400" /> to get early access!</p>
                    </div>
                    <div className="bg-white text-slate-950 text-[10px] font-semibold py-1 px-2.5 rounded-full shadow-lg w-fit ml-2 max-w-[80%] border border-slate-200">
                      That's crazyyyy!!
                    </div>
                  </div>
                )}

                {card.previewType === "live" && (
                  <div className="h-full bg-[#0c0d15] p-3 flex flex-col justify-between text-white relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-0" />
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="h-5 w-5 rounded-full bg-cyan-500 text-black font-bold flex items-center justify-center text-[9px]">M</div>
                        <span className="text-[9px] font-bold">muted_poetry</span>
                      </div>
                      <span className="text-[8px] bg-pink-600 px-1.5 py-0.5 rounded font-black tracking-wider uppercase">Live</span>
                    </div>
                    <div className="relative z-10 space-y-1.5 mt-auto mb-2 text-[9px]">
                      <p className="text-white/60"><span className="font-bold text-white">pierredemilly</span> 🔥🔥🔥🔥🔥</p>
                      <p className="text-white/60"><span className="font-bold text-white">katelin.aldridge38</span> Welcome! 🔥</p>
                    </div>
                    <div className="relative z-10 bg-white/10 rounded-full h-6 px-2 flex items-center text-white/50 text-[9px] border border-white/10">
                      Add a comment...
                    </div>
                  </div>
                )}

                {card.previewType === "dm" && (
                  <div className="h-full bg-[#0c0d15] p-3 flex flex-col justify-between text-white">
                    <div className="text-center text-[9px] text-white/40 font-bold border-b border-white/5 pb-1">Direct Message</div>
                    <div className="space-y-2 flex-1 mt-2 flex flex-col justify-end">
                      <div className="bg-white/10 text-white text-[10px] py-1.5 px-3 rounded-2xl rounded-tl-none max-w-[80%] self-start">
                        Hey! I love your music!
                      </div>
                      <div className="bg-[#6d48ff] text-white text-[10px] py-1.5 px-3 rounded-2xl rounded-tr-none max-w-[80%] self-end">
                        Thank you so much, it means a lot
                      </div>
                    </div>
                    <div className="mt-2 h-6 bg-white/5 rounded-full border border-white/10 flex items-center justify-between px-2 text-[8px] text-white/35">
                      <span>Message...</span>
                      <div className="flex gap-1.5 text-white/50">
                        <Mic className="h-3 w-3" />
                        <ImageIcon className="h-3 w-3" />
                        <Smile className="h-3 w-3" />
                      </div>
                    </div>
                  </div>
                )}

                {card.previewType === "follow" && (
                  <div className="h-full bg-[#0c0d15] p-3 flex flex-col justify-between text-white">
                    <div className="space-y-1.5 flex-1 flex flex-col justify-end">
                      <div className="bg-[#6d48ff] text-white text-[9px] py-1 px-2.5 rounded-2xl rounded-tr-none max-w-[80%] self-end">
                        Please Follow me for the link
                      </div>
                      <div className="bg-white/10 text-white text-[9px] py-1 px-2.5 rounded-2xl rounded-tl-none max-w-[80%] self-start flex items-center gap-1">
                        I Followed <UserCheck className="h-3 w-3 text-emerald-400" />
                      </div>
                      <div className="bg-[#6d48ff] text-white text-[9px] py-1 px-2.5 rounded-2xl rounded-tr-none max-w-[85%] self-end text-center">
                        Thanks! Here's the link 👇
                        <div className="mt-1 bg-white text-slate-900 font-bold px-2 py-0.5 rounded text-[8px]">Click Here</div>
                      </div>
                    </div>
                  </div>
                )}

                {card.previewType === "re_trigger" && (
                  <div className="h-full bg-[#0a0c16] flex items-center justify-center p-3">
                    <div className="flex flex-col items-center gap-2">
                      <div className="relative flex items-center justify-center">
                        <div className="absolute inset-0 bg-[#6d48ff]/20 animate-ping rounded-full" />
                        <div className="relative h-12 w-12 rounded-xl bg-gradient-to-br from-[#6d48ff] to-[#bd9fff] flex items-center justify-center text-white shadow-lg">
                          <Repeat className="h-6 w-6" />
                        </div>
                      </div>
                      <span className="text-[11px] font-bold tracking-widest text-[#bd9fff] uppercase">Re-Trigger</span>
                      <span className="text-[9px] text-slate-500">Scan & fetch old comments</span>
                    </div>
                  </div>
                )}

                {card.previewType === "data" && (
                  <div className="h-full bg-[#0c0d15] p-3 flex flex-col justify-between text-white">
                    <div className="space-y-1.5 flex-1 flex flex-col justify-end">
                      <div className="bg-[#6d48ff] text-white text-[9px] py-1 px-2.5 rounded-2xl rounded-tr-none max-w-[80%] self-end">
                        Please Share Your Email!
                      </div>
                      <div className="bg-white/10 text-white text-[9px] py-1 px-2.5 rounded-2xl rounded-tl-none max-w-[80%] self-start italic">
                        ig_user@gmail.com
                      </div>
                      <div className="bg-[#6d48ff] text-white text-[9px] py-1 px-2.5 rounded-2xl rounded-tr-none max-w-[80%] self-end">
                        Sent on Mail 😊
                      </div>
                    </div>
                  </div>
                )}

                {card.previewType === "ai" && (
                  <div className="h-full bg-gradient-to-br from-[#0d1020] via-[#241355] to-[#120524] flex flex-col items-center justify-center p-3 text-center">
                    <div className="relative">
                      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full blur-md opacity-75 animate-pulse" />
                      <div className="relative h-10 w-10 bg-black/60 rounded-full flex items-center justify-center border border-purple-500/35">
                        <Sparkles className="h-5 w-5 text-purple-400 fill-purple-400" />
                      </div>
                    </div>
                    <span className="mt-2 text-xs font-bold text-white tracking-wide">LinkPlease AI</span>
                    <span className="text-[8px] bg-green-400/20 text-green-300 border border-green-400/35 rounded-full px-2 py-0.5 mt-1 font-semibold uppercase tracking-wider scale-90">Active</span>
                  </div>
                )}
              </div>

              {/* Card Footer text area */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-base text-white flex items-center gap-2">
                    {card.title}
                  </h3>
                  <p className="text-slate-400 text-xs mt-2 leading-relaxed">{card.description}</p>
                </div>
                
                <div className="mt-5">
                  {card.isComingSoon ? (
                    <Button disabled className="w-full rounded-xl bg-slate-900 border border-slate-800 text-slate-500 font-semibold cursor-not-allowed">
                      Coming Soon
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => handleConfigure(card.trigger)}
                      className="w-full rounded-xl bg-[#6d48ff] text-white hover:bg-[#5a3ae0] font-semibold border-none shadow-[0_4px_14px_rgba(109,72,255,0.4)]"
                    >
                      Create Automation
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Metrics */}
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {metrics.map(([value, label, Icon]) => (
              <div key={label as string} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <Icon className="h-5 w-5 text-slate-500" />
                <p className="mt-4 text-2xl font-semibold text-slate-950">{value as string}</p>
                <p className="text-sm text-slate-500">{label as string}</p>
              </div>
            ))}
          </div>

          {/* Simulator */}
          <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <Play className="h-5 w-5 text-emerald-600" />
              <div>
                <h2 className="font-semibold text-slate-950">Comment event simulator</h2>
                <p className="text-sm text-slate-500">Use this until real Meta webhooks are connected.</p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-[0.5fr_0.5fr_auto]">
              <label className="block">
                <span className="text-xs font-semibold text-slate-500">Comment keyword</span>
                <input
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-slate-500">Follower username</span>
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
                />
              </label>
              <Button 
                className="self-end rounded-lg bg-slate-950 hover:bg-slate-800 text-white flex items-center gap-1.5" 
                onClick={runSimulation}
                disabled={isSimulating}
              >
                {isSimulating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Simulating...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Simulate
                  </>
                )}
              </Button>
            </div>
          </section>

          {/* Audit Logs */}
          <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                <div>
                  <h2 className="font-semibold text-slate-950">Event audit log</h2>
                  <p className="text-sm text-slate-500">Every Meta event is stored before processing for retry and diagnostics.</p>
                </div>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {logs.map((log, index) => (
                <div key={`${log.event}-${log.time}-${index}`} className="grid gap-3 p-5 md:grid-cols-[0.4fr_0.35fr_1fr_0.3fr] md:items-center">
                  <p className="font-mono text-sm text-slate-700">{log.event}</p>
                  <span className="w-fit rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{log.status}</span>
                  <p className="text-sm text-slate-600">{log.detail}</p>
                  <p className="text-sm text-slate-400">{log.time}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
