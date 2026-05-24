import { useWorkflows } from "@/lib/supabase-hooks.ts";
import { Link, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Plus, Play, Pause, FileText, Trash2, Workflow } from "lucide-react";

export default function WorkflowsPage() {
  const [searchParams] = useSearchParams();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [triggerType, setTriggerType] = useState<string>("manual");
  const [description, setDescription] = useState("");

  const { createWorkflow } = useWorkflows();

  useEffect(() => {
    const shouldCreate = searchParams.get("create") === "true";
    const trigger = searchParams.get("trigger");
    if (shouldCreate) {
      setShowCreate(true);
      if (trigger) {
        const allowedTriggers = ["manual", "instagram_comment", "instagram_dm", "instagram_story_reply", "webhook", "schedule", "follow_gate", "data_capture", "re_trigger", "ai_replies"];
        if (allowedTriggers.includes(trigger)) {
          setTriggerType(trigger);
        } else {
          setTriggerType("manual");
        }

        // Pre-populate name based on trigger type for a better UX
        const triggerNames: Record<string, string> = {
          instagram_comment: "Comment Automation Flow",
          instagram_story_reply: "Story Reply Flow",
          instagram_dm: "DM Auto Reply Flow",
          webhook: "Live Automation Flow",
          follow_gate: "Ask for Follow Flow",
          data_capture: "Data Collection Flow",
          re_trigger: "Old Post Re-trigger Flow",
          ai_replies: "AI Auto-Response Flow",
        };
        setName(triggerNames[trigger] || "New Automation Flow");
      }
    }
  }, [searchParams]);

  const handleCreate = async () => {
    if (!name.trim()) return;
    await createWorkflow({
      name: name.trim(),
      description: description.trim() || undefined,
      triggerType: triggerType as any,
    });
    setName("");
    setDescription("");
    setShowCreate(false);
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#171126]">Workflows</h1>
          <p className="mt-1 text-sm text-[#82799b]">Build and manage your automation workflows</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-xl bg-[#6d48ff] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#5a3ae0]"
        >
          <Plus className="h-4 w-4" />
          New Workflow
        </button>
      </div>

      {showCreate && (
        <div className="mb-6 rounded-2xl border border-[#dfdbea] bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-[#171126]">Create New Workflow</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#665d82]">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Automation Workflow"
                className="w-full rounded-xl border border-[#dfdbea] px-3 py-2.5 text-sm outline-none focus:border-[#6d48ff]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#665d82]">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does this workflow do?"
                rows={2}
                className="w-full rounded-xl border border-[#dfdbea] px-3 py-2.5 text-sm outline-none focus:border-[#6d48ff]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#665d82]">Trigger Type</label>
              <select
                value={triggerType}
                onChange={(e) => setTriggerType(e.target.value)}
                className="w-full rounded-xl border border-[#dfdbea] px-3 py-2.5 text-sm outline-none focus:border-[#6d48ff]"
              >
                <option value="manual">Manual</option>
                <option value="instagram_comment">Instagram Comment</option>
                <option value="instagram_dm">Instagram DM</option>
                <option value="instagram_story_reply">Instagram Story Reply</option>
                <option value="follow_gate">Ask for Follow (Follow Gate)</option>
                <option value="data_capture">Data Capture</option>
                <option value="ai_replies">AI Auto-Response</option>
                <option value="webhook">Webhook</option>
                <option value="schedule">Schedule (Cron)</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCreate}
                className="rounded-xl bg-[#6d48ff] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#5a3ae0]"
              >
                Create Workflow
              </button>
              <button
                onClick={() => setShowCreate(false)}
                className="rounded-xl border border-[#dfdbea] px-5 py-2.5 text-sm font-medium text-[#665d82] hover:bg-[#f6f3fb]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <WorkflowList />
    </div>
  );
}

function WorkflowList() {
  const { workflows, loading, updateWorkflow, deleteWorkflow } = useWorkflows();

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-[#dfdbea] bg-white p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#dfdbea] border-t-[#6d48ff]" />
      </div>
    );
  }

  if (workflows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-[#dfdbea] bg-white p-12">
        <Workflow className="mb-4 h-12 w-12 text-[#dfdbea]" />
        <h3 className="text-lg font-semibold text-[#171126]">No workflows yet</h3>
        <p className="mt-1 text-sm text-[#82799b]">Create your first automation workflow to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {(workflows as any[]).map((wf: any) => (
        <div key={wf._id} className="flex items-center gap-4 rounded-2xl border border-[#dfdbea] bg-white p-4 transition-colors hover:border-[#c5bde0]">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#f0edf8]">
            <FileText className="h-5 w-5 text-[#6d48ff]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Link to={`/dashboard/workflows/${wf._id}`} className="font-semibold text-[#171126] hover:text-[#6d48ff]">
                {wf.name}
              </Link>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                wf.status === "active" ? "bg-green-100 text-green-700" :
                wf.status === "paused" ? "bg-yellow-100 text-yellow-700" :
                wf.status === "archived" ? "bg-gray-100 text-gray-500" :
                "bg-blue-100 text-blue-700"
              }`}>
                {wf.status}
              </span>
            </div>
            <p className="mt-0.5 text-sm text-[#82799b]">
              {wf.description || wf.triggerType.replace(/_/g, " ")}
              {wf.lastRunAt && ` · Last run: ${new Date(wf.lastRunAt).toLocaleDateString()}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {wf.status === "draft" || wf.status === "paused" ? (
              <button
                onClick={() => updateWorkflow({ workflowId: wf._id, status: "active" })}
                className="rounded-lg p-2 text-green-600 hover:bg-green-50"
                title="Activate"
              >
                <Play className="h-4 w-4" />
              </button>
            ) : wf.status === "active" ? (
              <button
                onClick={() => updateWorkflow({ workflowId: wf._id, status: "paused" })}
                className="rounded-lg p-2 text-yellow-600 hover:bg-yellow-50"
                title="Pause"
              >
                <Pause className="h-4 w-4" />
              </button>
            ) : null}
            <button
              onClick={() => deleteWorkflow({ workflowId: wf._id })}
              className="rounded-lg p-2 text-red-500 hover:bg-red-50"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
