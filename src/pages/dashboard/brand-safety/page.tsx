import { useState } from "react";
import {
  ShieldCheck,
  Eye,
  EyeOff,
  Zap,
  MessageCircle,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  Settings,
  ArrowLeft,
  Plus,
  Trash2,
  Activity,
  Shield,
  Globe,
  Ban,
  Link2,
  Users,
  Bell,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils.ts";
import { Button } from "@/components/ui/button.tsx";
import { useCommentModeration } from "@/hooks/use-comment-moderation.ts";
import type { ToxicityCategory } from "@/hooks/use-comment-moderation.ts";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";


const CATEGORY_META: Record<ToxicityCategory, { label: string; icon: any; color: string; description: string }> = {
  hate_speech: { label: "Hate Speech", icon: Ban, color: "text-red-500", description: "Targeted hatred based on identity" },
  slur: { label: "Slurs", icon: AlertTriangle, color: "text-orange-500", description: "Offensive language & slurs" },
  spam: { label: "Spam", icon: MessageCircle, color: "text-yellow-500", description: "Repetitive or bot-like messages" },
  scam_link: { label: "Scam Links", icon: Link2, color: "text-rose-500", description: "Phishing or money scheme links" },
  competitor_bait: { label: "Competitor Bait", icon: Users, color: "text-purple-500", description: "Promoting competing products" },
  harassment: { label: "Harassment", icon: XCircle, color: "text-pink-500", description: "Personal attacks & bullying" },
  explicit: { label: "Explicit Content", icon: EyeOff, color: "text-red-600", description: "Adult or violent content" },
  safe: { label: "Safe", icon: CheckCircle2, color: "text-emerald-500", description: "No issues detected" },
};


export default function BrandSafetyPage() {
  const navigate = useNavigate();
  const {
    settings,
    comments,
    stats,
    isScanning,
    toggleModeration,
    overrideComment,
    updateSettings,
    toggleCategory,
    addWhitelistedUser,
    removeWhitelistedUser,
  } = useCommentModeration();

  const [activeTab, setActiveTab] = useState<"feed" | "settings">("feed");
  const [whitelistInput, setWhitelistInput] = useState("");

  const handleAddWhitelist = () => {
    const username = whitelistInput.trim().replace("@", "");
    if (!username) return;
    if (settings.whitelistedUsers.includes(username)) {
      toast.error("User already whitelisted");
      return;
    }
    addWhitelistedUser(username);
    setWhitelistInput("");
    toast.success(`@${username} added to whitelist`);
  };


  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/dashboard/automations")}
          className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Automations
        </button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10 shadow-lg">
              <ShieldCheck className="h-7 w-7 text-purple-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Brand Safety</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                AI-powered comment moderation — hides hate before your audience sees it.
              </p>
            </div>
          </div>
        </div>
      </div>


      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-[1fr_0.38fr]">
        {/* Left Column */}
        <div className="space-y-6">
          {/* AI Shield Toggle Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl",
                  settings.isEnabled ? "bg-emerald-100" : "bg-slate-100"
                )}>
                  <Shield className={cn("h-5 w-5", settings.isEnabled ? "text-emerald-600" : "text-slate-400")} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">AI Shield</h2>
                  <p className="text-xs text-slate-500">
                    {settings.isEnabled
                      ? "Active — scanning every new comment in real-time"
                      : "Inactive — toggle on to start protecting your posts"}
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                onClick={toggleModeration}
                className={cn(
                  "relative h-8 w-14 rounded-full transition-all duration-300 shadow-inner",
                  settings.isEnabled
                    ? "bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-200"
                    : "bg-slate-200"
                )}
              >
                <span
                  className={cn(
                    "absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-300",
                    settings.isEnabled ? "translate-x-6" : "translate-x-0"
                  )}
                />
              </button>
            </div>


            {/* Status */}
            {settings.isEnabled && (
              <div className="mt-4 flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </span>
                <span className="text-xs font-semibold text-emerald-700">
                  Scanning — {stats.averageResponseTime}ms avg response time
                </span>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab("feed")}
              className={cn(
                "pb-3 px-5 font-semibold text-sm transition-all border-b-2 flex items-center gap-2",
                activeTab === "feed"
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              )}
            >
              <Activity className="h-4 w-4" />
              Live Feed
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={cn(
                "pb-3 px-5 font-semibold text-sm transition-all border-b-2 flex items-center gap-2",
                activeTab === "settings"
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              )}
            >
              <Settings className="h-4 w-4" />
              Moderation Settings
            </button>
          </div>


          {/* Live Feed Tab */}
          {activeTab === "feed" && (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              {comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-16 text-center">
                  <ShieldCheck className="h-12 w-12 text-slate-300 mb-4" />
                  <h3 className="font-bold text-slate-900 text-lg">No comments yet</h3>
                  <p className="text-sm text-slate-500 mt-1 max-w-sm">
                    {settings.isEnabled
                      ? "Waiting for new comments to scan... They'll appear here in real-time."
                      : "Enable AI Shield above to start scanning comments."}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                  {comments.map((comment) => {
                    const catMeta = CATEGORY_META[comment.toxicityCategory];
                    const CatIcon = catMeta.icon;
                    return (
                      <div
                        key={comment.id}
                        className={cn(
                          "flex items-start gap-3 p-4 transition-colors",
                          comment.status === "hidden" ? "bg-red-50/50" : "bg-white"
                        )}
                      >
                        {/* Avatar */}
                        <div className={cn(
                          "h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 bg-gradient-to-br",
                          comment.avatarColor
                        )}>
                          {comment.username.charAt(0).toUpperCase()}
                        </div>


                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900">@{comment.username}</span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(comment.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className={cn(
                            "text-sm mt-0.5",
                            comment.status === "hidden" ? "text-slate-400 line-through" : "text-slate-700"
                          )}>
                            {comment.comment}
                          </p>
                          {comment.status === "hidden" && comment.reason && (
                            <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              {comment.reason}
                            </p>
                          )}
                        </div>

                        {/* Status + Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          {comment.status === "hidden" ? (
                            <>
                              <span className="text-[9px] font-bold text-red-500 border border-red-200 bg-red-50 px-2 py-0.5 rounded-full">
                                HIDDEN
                              </span>
                              <button
                                onClick={() => overrideComment(comment.id, "kept")}
                                className="text-[10px] font-semibold text-slate-500 hover:text-emerald-600 border border-slate-200 px-2 py-0.5 rounded-full hover:border-emerald-200 transition-colors"
                                title="Restore comment"
                              >
                                <RotateCcw className="h-3 w-3" />
                              </button>
                            </>
                          ) : (
                            <>
                              <span className="text-[9px] font-bold text-emerald-600 border border-emerald-200 bg-emerald-50 px-2 py-0.5 rounded-full">
                                KEPT
                              </span>
                              {comment.toxicityCategory !== "safe" && (
                                <button
                                  onClick={() => overrideComment(comment.id, "hidden")}
                                  className="text-[10px] font-semibold text-slate-500 hover:text-red-600 border border-slate-200 px-2 py-0.5 rounded-full hover:border-red-200 transition-colors"
                                  title="Hide comment"
                                >
                                  <EyeOff className="h-3 w-3" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}


          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              {/* Sensitivity Threshold */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-1">Detection Sensitivity</h3>
                <p className="text-xs text-slate-500 mb-4">
                  Comments above this confidence threshold will be auto-hidden. Lower = stricter.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700">
                      Threshold: {Math.round(settings.autoHideThreshold * 100)}%
                    </span>
                    <span className="text-xs text-slate-400">
                      {settings.autoHideThreshold <= 0.5 ? "Very Strict" : settings.autoHideThreshold <= 0.75 ? "Balanced" : "Lenient"}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="95"
                    value={settings.autoHideThreshold * 100}
                    onChange={(e) => updateSettings({ autoHideThreshold: Number(e.target.value) / 100 })}
                    className="w-full h-2 rounded-full appearance-none bg-slate-200 accent-purple-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                    <span>Stricter (hides more)</span>
                    <span>Lenient (hides less)</span>
                  </div>
                </div>
              </div>


              {/* Category Toggles */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-1">Moderation Categories</h3>
                <p className="text-xs text-slate-500 mb-4">
                  Choose which types of toxic content to auto-hide.
                </p>
                <div className="space-y-3">
                  {(Object.keys(CATEGORY_META) as ToxicityCategory[])
                    .filter((cat) => cat !== "safe")
                    .map((category) => {
                      const meta = CATEGORY_META[category];
                      const Icon = meta.icon;
                      return (
                        <div key={category} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                          <div className="flex items-center gap-3">
                            <Icon className={cn("h-4 w-4", meta.color)} />
                            <div>
                              <p className="text-sm font-semibold text-slate-800">{meta.label}</p>
                              <p className="text-[11px] text-slate-400">{meta.description}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => toggleCategory(category)}
                            className={cn(
                              "relative h-5 w-9 rounded-full transition-colors",
                              settings.categories[category] ? "bg-purple-600" : "bg-slate-200"
                            )}
                          >
                            <span className={cn(
                              "absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
                              settings.categories[category] ? "translate-x-4" : "translate-x-0"
                            )} />
                          </button>
                        </div>
                      );
                    })}
                </div>
              </div>


              {/* Language Detection */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-1">Language & Regional Detection</h3>
                <p className="text-xs text-slate-500 mb-4">
                  Tuned for Indian creators — catches Hinglish abuse and regional slurs.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <Globe className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="text-sm font-semibold text-slate-800">Hinglish Detection</p>
                        <p className="text-[11px] text-slate-400">Detect abuse in Hindi-English mixed text</p>
                      </div>
                    </div>
                    <button
                      onClick={() => updateSettings({ hinglishDetection: !settings.hinglishDetection })}
                      className={cn(
                        "relative h-5 w-9 rounded-full transition-colors",
                        settings.hinglishDetection ? "bg-purple-600" : "bg-slate-200"
                      )}
                    >
                      <span className={cn(
                        "absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
                        settings.hinglishDetection ? "translate-x-4" : "translate-x-0"
                      )} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <Globe className="h-4 w-4 text-indigo-500" />
                      <div>
                        <p className="text-sm font-semibold text-slate-800">Regional Slur Detection</p>
                        <p className="text-[11px] text-slate-400">Covers Tamil, Telugu, Bengali, Marathi patterns</p>
                      </div>
                    </div>
                    <button
                      onClick={() => updateSettings({ regionalSlurDetection: !settings.regionalSlurDetection })}
                      className={cn(
                        "relative h-5 w-9 rounded-full transition-colors",
                        settings.regionalSlurDetection ? "bg-purple-600" : "bg-slate-200"
                      )}
                    >
                      <span className={cn(
                        "absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
                        settings.regionalSlurDetection ? "translate-x-4" : "translate-x-0"
                      )} />
                    </button>
                  </div>
                </div>
              </div>


              {/* Notification & Whitelist */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-1">Notifications & Whitelist</h3>
                <p className="text-xs text-slate-500 mb-4">
                  Get alerts when comments are hidden and whitelist trusted accounts.
                </p>

                {/* Notify toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 mb-4">
                  <div className="flex items-center gap-3">
                    <Bell className="h-4 w-4 text-amber-500" />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Notify on hide</p>
                      <p className="text-[11px] text-slate-400">Get notified when a comment is auto-hidden</p>
                    </div>
                  </div>
                  <button
                    onClick={() => updateSettings({ notifyOnHide: !settings.notifyOnHide })}
                    className={cn(
                      "relative h-5 w-9 rounded-full transition-colors",
                      settings.notifyOnHide ? "bg-purple-600" : "bg-slate-200"
                    )}
                  >
                    <span className={cn(
                      "absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
                      settings.notifyOnHide ? "translate-x-4" : "translate-x-0"
                    )} />
                  </button>
                </div>

                {/* Whitelist */}
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-2">Whitelisted Users</p>
                  <p className="text-[11px] text-slate-400 mb-3">These accounts will never be moderated.</p>
                  <div className="flex gap-2 mb-3">
                    <input
                      value={whitelistInput}
                      onChange={(e) => setWhitelistInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddWhitelist(); } }}
                      placeholder="@username"
                      className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10"
                    />
                    <Button onClick={handleAddWhitelist} size="sm" className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-4">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {settings.whitelistedUsers.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {settings.whitelistedUsers.map((user) => (
                        <span key={user} className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                          @{user}
                          <button onClick={() => removeWhitelistedUser(user)} className="hover:text-red-500">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>


        {/* Right Column - Live Stats */}
        <div className="space-y-6">
          {/* Stats Card */}
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-[#0d1020] to-[#1a1040] p-6 shadow-xl sticky top-6">
            <div className="flex items-center gap-2 mb-5">
              <ShieldCheck className="h-4 w-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white">Moderation Stats</h3>
              {isScanning && (
                <span className="ml-auto relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
              )}
            </div>

            <div className="space-y-3">
              {/* Total Scanned */}
              <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/20">
                    <Eye className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white tabular-nums">{stats.totalScanned}</p>
                    <p className="text-[11px] text-slate-400">Comments Scanned</p>
                  </div>
                </div>
              </div>

              {/* Hidden Today */}
              <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/20">
                    <EyeOff className="h-4 w-4 text-red-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white tabular-nums">{stats.hiddenToday}</p>
                    <p className="text-[11px] text-slate-400">Hidden Today</p>
                  </div>
                </div>
              </div>

              {/* Kept Today */}
              <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white tabular-nums">{stats.keptToday}</p>
                    <p className="text-[11px] text-slate-400">Kept (Safe)</p>
                  </div>
                </div>
              </div>

              {/* Response Time */}
              <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/20">
                    <Zap className="h-4 w-4 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white tabular-nums">{stats.averageResponseTime}ms</p>
                    <p className="text-[11px] text-slate-400">Avg Response</p>
                  </div>
                </div>
              </div>
            </div>


            {/* Top Threats */}
            {stats.topCategories.length > 0 && (
              <div className="mt-5 pt-4 border-t border-white/10">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Top Threats</p>
                <div className="space-y-2">
                  {stats.topCategories
                    .filter((c) => c.category !== "safe")
                    .slice(0, 4)
                    .map((cat) => {
                      const meta = CATEGORY_META[cat.category];
                      return (
                        <div key={cat.category} className="flex items-center justify-between">
                          <span className={cn("text-xs font-semibold", meta.color)}>{meta.label}</span>
                          <span className="text-xs font-bold text-white">{cat.count}</span>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Protection Badge */}
            <div className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-2.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <div>
                <p className="text-[11px] font-semibold text-emerald-300">
                  {settings.isEnabled ? "Protection Active" : "Protection Off"}
                </p>
                <p className="text-[10px] text-emerald-400/70">
                  {settings.isEnabled ? "Reacts in milliseconds" : "Enable to protect your brand"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
