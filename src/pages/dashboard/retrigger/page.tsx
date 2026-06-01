import { useState } from "react";
import {
  Repeat,
  Play,
  Pause,
  Zap,
  MessageCircle,
  Send,
  Reply,
  Shield,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  RotateCcw,
  Users,
  ArrowLeft,
  Plus,
  Trash2,
  Eye,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils.ts";
import { Button } from "@/components/ui/button.tsx";
import { useRetrigger } from "@/hooks/use-retrigger.ts";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function RetriggerPage() {
  const navigate = useNavigate();
  const {
    isActive,
    isScanning,
    isSending,
    comments,
    stats,
    config,
    setConfig,
    toggleRetrigger,
    startSending,
    stopSending,
    metaRateLimits,
  } = useRetrigger();

  const [keywordInput, setKeywordInput] = useState("");
  const [showComments, setShowComments] = useState(false);

  const handleAddKeyword = () => {
    const value = keywordInput.trim().toUpperCase();
    if (!value) return;
    if (config.keywords.includes(value)) {
      toast.error("Keyword already added");
      return;
    }
    setConfig({ ...config, keywords: [...config.keywords, value] });
    setKeywordInput("");
  };

  const handleRemoveKeyword = (kw: string) => {
    setConfig({ ...config, keywords: config.keywords.filter((k) => k !== kw) });
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
              <Repeat className="h-7 w-7 text-purple-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Retrigger Old Comments
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Recover every missed lead from past comments - months of DMs queued in minutes.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-[1fr_0.4fr]">
        {/* Left Column */}
        <div className="space-y-6">
          {/* One-Click Reactivation Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
                  <RotateCcw className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">One-Click Reactivation</h2>
                  <p className="text-xs text-slate-500">
                    Toggle it on - we fetch every matching old comment and queue the DMs.
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                onClick={toggleRetrigger}
                disabled={isScanning}
                className={cn(
                  "relative h-8 w-14 rounded-full transition-all duration-300 shadow-inner",
                  isActive
                    ? "bg-gradient-to-r from-purple-500 to-indigo-600 shadow-purple-200"
                    : "bg-slate-200"
                )}
              >
                {isScanning ? (
                  <span className="absolute top-1 left-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-purple-600" />
                  </span>
                ) : (
                  <span
                    className={cn(
                      "absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-300",
                      isActive ? "translate-x-6" : "translate-x-0"
                    )}
                  />
                )}
              </button>
            </div>

            {/* Status Badge */}
            {isActive && (
              <div className="mt-4 flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </span>
                <span className="text-xs font-semibold text-emerald-700">
                  {isScanning
                    ? "Scanning old comments..."
                    : isSending
                      ? "Sending DMs in batches..."
                      : `Found ${stats.totalFound} missed comments - Ready to send`}
                </span>
              </div>
            )}
          </div>

          {/* Configuration Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4">Configuration</h3>
            <div className="space-y-5">
              {/* Keywords */}
              <div>
                <label className="block text-sm font-semibold text-slate-700">Trigger Keywords</label>
                <p className="text-xs text-slate-400 mt-0.5 mb-2">
                  Comments containing these keywords will be processed.
                </p>
                <div className="flex gap-2">
                  <input
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddKeyword();
                      }
                    }}
                    placeholder="Add keyword (e.g. LINK, INFO, WANT)"
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10"
                  />
                  <Button
                    onClick={handleAddKeyword}
                    size="sm"
                    className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-4"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {config.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {config.keywords.map((kw) => (
                      <span
                        key={kw}
                        className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-600"
                      >
                        {kw}
                        <button onClick={() => handleRemoveKeyword(kw)} className="hover:text-red-500">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Scan Mode */}
              <div>
                <label className="block text-sm font-semibold text-slate-700">Scan Mode</label>
                <p className="text-xs text-slate-400 mt-0.5 mb-2">
                  Which old posts to scan for missed comments.
                </p>
                <select
                  value={config.scanMode}
                  onChange={(e) => setConfig({ ...config, scanMode: e.target.value as any })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10"
                >
                  <option value="all_posts">All past posts</option>
                  <option value="recent">Last 30 days</option>
                  <option value="specific">Specific posts only</option>
                </select>
              </div>

              {/* DM Message */}
              <div>
                <label className="block text-sm font-semibold text-slate-700">DM Message</label>
                <p className="text-xs text-slate-400 mt-0.5 mb-2">
                  Message sent to users whose old comments match. Use {"{{username}}"} for personalization.
                </p>
                <textarea
                  value={config.dmMessage}
                  onChange={(e) => setConfig({ ...config, dmMessage: e.target.value })}
                  placeholder="Hey {{username}}! I saw you commented on my post. Here's what you were looking for: ..."
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 resize-none"
                />
              </div>

              {/* Max DMs */}
              <div>
                <label className="block text-sm font-semibold text-slate-700">Max DMs per run</label>
                <p className="text-xs text-slate-400 mt-0.5 mb-2">
                  Limit DMs per scan to stay within rate limits.
                </p>
                <input
                  type="number"
                  value={config.maxDmsPerRun}
                  onChange={(e) => setConfig({ ...config, maxDmsPerRun: Number(e.target.value) })}
                  placeholder="50"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10"
                />
              </div>

              {/* Skip Already Sent Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-semibold text-slate-700">Skip already contacted users</label>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Don't send to users who already received a DM.
                  </p>
                </div>
                <button
                  onClick={() => setConfig({ ...config, excludeAlreadySent: !config.excludeAlreadySent })}
                  className={cn(
                    "relative h-6 w-11 rounded-full transition-colors",
                    config.excludeAlreadySent ? "bg-purple-600" : "bg-slate-200"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                      config.excludeAlreadySent ? "translate-x-5" : "translate-x-0"
                    )}
                  />
                </button>
              </div>
            </div>

            {/* Action Button */}
            {isActive && !isSending && stats.totalFound > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-100">
                <Button
                  onClick={startSending}
                  className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 shadow-lg shadow-purple-500/20"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send {stats.dmsQueued} DMs in Safe Batches
                </Button>
              </div>
            )}

            {isSending && (
              <div className="mt-6 pt-4 border-t border-slate-100">
                <Button
                  onClick={stopSending}
                  variant="outline"
                  className="w-full rounded-xl border-red-200 text-red-600 hover:bg-red-50 font-semibold py-3"
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Pause Sending
                </Button>
              </div>
            )}
          </div>

          {/* Batch Progress Card */}
          {isActive && (isSending || stats.dmsSent > 0) && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                  <Zap className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Sent in Safe Batches</h3>
                  <p className="text-xs text-slate-500">
                    Throttled to Meta's published rate limits, so your account stays healthy.
                  </p>
                </div>
              </div>

              {/* Rate Limit Info */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="rounded-xl bg-slate-50 p-3 text-center">
                  <p className="text-lg font-bold text-slate-900">{metaRateLimits.maxPerMinute}</p>
                  <p className="text-[10px] text-slate-500 font-medium">DMs/min limit</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 text-center">
                  <p className="text-lg font-bold text-slate-900">{metaRateLimits.batchSize}</p>
                  <p className="text-[10px] text-slate-500 font-medium">Per batch</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 text-center">
                  <p className="text-lg font-bold text-slate-900">{Math.round(metaRateLimits.delayBetweenBatches / 1000)}s</p>
                  <p className="text-[10px] text-slate-500 font-medium">Batch cooldown</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">
                    Batch {stats.batchesSent} of {stats.totalBatches}
                  </span>
                  <span className="text-slate-500">
                    {stats.dmsSent}/{stats.totalFound} sent
                  </span>
                </div>
                <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500"
                    style={{ width: `${stats.totalFound > 0 ? (stats.dmsSent / stats.totalFound) * 100 : 0}%` }}
                  />
                </div>
                {isSending && (
                  <div className="flex items-center gap-2 mt-2">
                    <Shield className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-[11px] text-emerald-600 font-medium">
                      Account safe - within Meta rate limits
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recovered Comments List */}
          {isActive && comments.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900">Recovered Comments</h3>
                <button
                  onClick={() => setShowComments(!showComments)}
                  className="text-xs font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1"
                >
                  <Eye className="h-3.5 w-3.5" />
                  {showComments ? "Hide" : "Show"} ({comments.length})
                </button>
              </div>

              {showComments && (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {comments.map((comment, idx) => (
                    <div
                      key={comment.id}
                      className={cn(
                        "flex items-start gap-3 rounded-xl p-3 border transition-colors",
                        idx < stats.dmsSent
                          ? "border-emerald-100 bg-emerald-50/50"
                          : "border-slate-100 bg-slate-50/50"
                      )}
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 text-white text-xs font-bold shrink-0">
                        {comment.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900 truncate">
                            @{comment.username}
                          </span>
                          <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-medium">
                            {comment.matchedKeyword}
                          </span>
                          {idx < stats.dmsSent && (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 ml-auto shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">"{comment.comment}"</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {new Date(comment.commentedAt).toLocaleDateString()} on "{comment.postCaption}"
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column - Live Counter */}
        <div className="space-y-6">
          {/* Live Stats Counter Card */}
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-[#0d1020] to-[#1a1040] p-6 shadow-xl sticky top-6">
            <div className="flex items-center gap-2 mb-5">
              <Activity className="h-4 w-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white">Live Recovery Tracker</h3>
              {(isSending || stats.dmsSent > 0) && (
                <span className="ml-auto relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
              )}
            </div>

            {/* Counter Cards */}
            <div className="space-y-3">
              {/* Comments Found */}
              <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/20">
                    <MessageCircle className="h-4.5 w-4.5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white tabular-nums">
                      {stats.totalFound}
                    </p>
                    <p className="text-[11px] text-slate-400">Comments Found</p>
                  </div>
                </div>
              </div>

              {/* DMs Sent */}
              <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/20">
                    <Send className="h-4.5 w-4.5 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white tabular-nums">
                      {stats.dmsSent}
                    </p>
                    <p className="text-[11px] text-slate-400">DMs Sent</p>
                  </div>
                </div>
                {stats.totalFound > 0 && (
                  <div className="mt-2 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700"
                      style={{ width: `${(stats.dmsSent / stats.totalFound) * 100}%` }}
                    />
                  </div>
                )}
              </div>

              {/* DMs Queued */}
              <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/20">
                    <Clock className="h-4.5 w-4.5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white tabular-nums">
                      {stats.dmsQueued}
                    </p>
                    <p className="text-[11px] text-slate-400">Queued</p>
                  </div>
                </div>
              </div>

              {/* Replies Received */}
              <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20">
                    <Reply className="h-4.5 w-4.5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white tabular-nums">
                      {stats.repliesReceived}
                    </p>
                    <p className="text-[11px] text-slate-400">Replies Back</p>
                  </div>
                </div>
              </div>

              {/* Leads Recovered */}
              <div className="rounded-xl bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/30 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/30">
                    <Users className="h-4.5 w-4.5 text-purple-300" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white tabular-nums">
                      {stats.dmsSent + stats.repliesReceived}
                    </p>
                    <p className="text-[11px] text-purple-300 font-medium">Leads Recovered</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Safety Badge */}
            <div className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-2.5">
              <Shield className="h-4 w-4 text-emerald-400" />
              <div>
                <p className="text-[11px] font-semibold text-emerald-300">Account Protected</p>
                <p className="text-[10px] text-emerald-400/70">
                  Throttled to {metaRateLimits.maxPerMinute} DMs/min
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
