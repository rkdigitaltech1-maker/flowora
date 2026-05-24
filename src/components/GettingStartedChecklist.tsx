import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2, Circle, ChevronDown, ChevronUp,
  Zap, Package, X, Sparkles
} from "lucide-react";

// ─── Checklist item definition ─────────────────────────────────────────────
interface ChecklistItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  cta: string;
  href?: string;
  action?: () => void;
  storageKey: string;
}

// ─── Instagram icon (inline — lucide version not available) ────────────────
const IgIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

// ─── Progress ring ─────────────────────────────────────────────────────────
function ProgressRing({ done, total }: { done: number; total: number }) {
  const r = 16;
  const circ = 2 * Math.PI * r;
  const pct = total === 0 ? 0 : done / total;
  const dash = circ * pct;
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" className="-rotate-90">
      <circle cx="20" cy="20" r={r} fill="none" stroke="#ede9fe" strokeWidth="4" />
      <circle
        cx="20" cy="20" r={r} fill="none"
        stroke="#6d48ff" strokeWidth="4"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        className="transition-all duration-700"
      />
    </svg>
  );
}

// ─── Main component ────────────────────────────────────────────────────────
export function GettingStartedChecklist() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Per-item completion persisted to localStorage
  const [done, setDone] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem("cs_checklist_done") ?? "{}");
    } catch {
      return {};
    }
  });

  const markDone = (id: string) => {
    setDone(prev => {
      const next = { ...prev, [id]: true };
      localStorage.setItem("cs_checklist_done", JSON.stringify(next));
      return next;
    });
  };

  const items: ChecklistItem[] = [
    {
      id: "connect_ig",
      icon: IgIcon,
      iconBg: "bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045]",
      iconColor: "text-white",
      title: "Connect your Instagram account",
      description: "Link your Instagram Business account via Meta OAuth to enable live automations.",
      cta: "Connect Instagram",
      action: () => { markDone("connect_ig"); navigate("/dashboard"); },
      storageKey: "connect_ig",
    },
    {
      id: "create_workflow",
      icon: Zap,
      iconBg: "bg-[#f0edf8]",
      iconColor: "text-[#6d48ff]",
      title: "Create your first workflow",
      description: "Set up a Comment-to-DM, Story Reply, or Follow Gate automation in minutes.",
      cta: "Build a workflow",
      action: () => { markDone("create_workflow"); navigate("/dashboard/workflows"); },
      storageKey: "create_workflow",
    },
    {
      id: "add_product",
      icon: Package,
      iconBg: "bg-[#f0fdf4]",
      iconColor: "text-emerald-600",
      title: "Add your first digital product",
      description: "Sell a PDF, template, course, or coaching session from your creator store.",
      cta: "Add a product",
      action: () => { markDone("add_product"); navigate("/dashboard/products"); },
      storageKey: "add_product",
    },
    {
      id: "invite_or_share",
      icon: Sparkles,
      iconBg: "bg-[#fff7ed]",
      iconColor: "text-amber-500",
      title: "Try AI Replies",
      description: "Let AI generate personalised DM responses, objection handlers, and follow-ups.",
      cta: "Explore AI Replies",
      action: () => { markDone("invite_or_share"); navigate("/dashboard/automations"); },
      storageKey: "invite_or_share",
    },
  ];

  const doneCount = items.filter(i => done[i.id]).length;
  const allDone = doneCount === items.length;

  // Auto-hide after all steps complete (with a short delay)
  useEffect(() => {
    if (allDone) {
      const t = setTimeout(() => {
        localStorage.setItem("cs_checklist_dismissed", "true");
        setDismissed(true);
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [allDone]);

  // Honour previous dismissal
  useEffect(() => {
    if (localStorage.getItem("cs_checklist_dismissed") === "true") setDismissed(true);
  }, []);

  if (dismissed) return null;

  return (
    <section
      className="mb-6 overflow-hidden rounded-[18px] border border-[#e8e2f8] bg-white shadow-sm"
      role="region"
      aria-label="Getting started checklist"
    >
      {/* Header */}
      <div
        className="flex cursor-pointer items-center justify-between px-5 py-4 select-none"
        onClick={() => setCollapsed(c => !c)}
        role="button"
        aria-expanded={!collapsed}
        aria-controls="checklist-body"
      >
        <div className="flex items-center gap-3">
          {/* Progress ring */}
          <div className="relative flex items-center justify-center">
            <ProgressRing done={doneCount} total={items.length} />
            <span className="absolute text-[10px] font-bold text-[#6d48ff]">
              {doneCount}/{items.length}
            </span>
          </div>
          <div>
            <p className="text-sm font-bold text-[#171126]">
              {allDone ? "🎉 You're all set!" : "Get started with Flowora"}
            </p>
            <p className="text-xs text-[#82799b]">
              {allDone
                ? "All setup steps complete — your automations are live."
                : `${items.length - doneCount} step${items.length - doneCount === 1 ? "" : "s"} remaining`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Dismiss */}
          <button
            onClick={e => {
              e.stopPropagation();
              localStorage.setItem("cs_checklist_dismissed", "true");
              setDismissed(true);
            }}
            className="rounded-lg p-1.5 text-slate-300 hover:bg-slate-50 hover:text-slate-500 transition-colors"
            aria-label="Dismiss checklist"
          >
            <X className="h-4 w-4" />
          </button>
          {/* Collapse toggle */}
          <div className="rounded-lg p-1.5 text-slate-400">
            {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </div>
        </div>
      </div>

      {/* Progress bar stripe */}
      <div className="h-1 w-full bg-[#f3f0fb]">
        <div
          className="h-full bg-[#6d48ff] rounded-full transition-all duration-700"
          style={{ width: `${(doneCount / items.length) * 100}%` }}
        />
      </div>

      {/* Checklist items */}
      {!collapsed && (
        <div id="checklist-body" className="divide-y divide-[#f3f0fb]">
          {items.map((item) => {
            const isDone = !!done[item.id];
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className={`flex items-center gap-4 px-5 py-4 transition-colors ${
                  isDone ? "opacity-50" : "hover:bg-[#faf9ff]"
                }`}
              >
                {/* Check state */}
                <button
                  onClick={() => markDone(item.id)}
                  className="shrink-0 transition-transform hover:scale-110"
                  aria-label={isDone ? `${item.title} — completed` : `Mark "${item.title}" as done`}
                >
                  {isDone
                    ? <CheckCircle2 className="h-5 w-5 text-[#6d48ff]" />
                    : <Circle className="h-5 w-5 text-[#d4cce8]" />
                  }
                </button>

                {/* Icon */}
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${item.iconBg}`}>
                  <Icon className={`h-4 w-4 ${item.iconColor}`} />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${isDone ? "line-through text-[#82799b]" : "text-[#171126]"}`}>
                    {item.title}
                  </p>
                  {!isDone && (
                    <p className="text-xs text-[#82799b] mt-0.5 leading-snug">{item.description}</p>
                  )}
                </div>

                {/* CTA */}
                {!isDone && (
                  <button
                    onClick={item.action}
                    className="shrink-0 rounded-xl border border-[#e0d8f7] bg-[#f4f1fd] px-4 py-2 text-xs font-bold text-[#6d48ff] hover:bg-[#ebe5ff] transition-colors whitespace-nowrap"
                  >
                    {item.cta} →
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
