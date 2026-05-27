import { useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  MessageCircle,
  Video,
  MessageSquare,
  UserCheck,
  Repeat,
  Mail,
  Sparkles,
  Image as ImageIcon,
  Plus,
  Trash2,
  Save,
  Zap,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Settings,
  Eye,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils.ts";
import { useWorkflows } from "@/lib/supabase-hooks.ts";
import { toast } from "sonner";
import { Button } from "@/components/ui/button.tsx";


// Automation type configurations
const AUTOMATION_TYPES: Record<string, {
  title: string;
  subtitle: string;
  icon: any;
  color: string;
  triggerType: string;
  fields: Array<{
    key: string;
    label: string;
    type: "text" | "textarea" | "select" | "toggle" | "keywords" | "number";
    placeholder?: string;
    options?: { value: string; label: string }[];
    defaultValue?: any;
    description?: string;
  }>;
}> = {
  comment: {
    title: "Comment Automation",
    subtitle: "Reply to comments and send a DM to engage your followers.",
    icon: MessageCircle,
    color: "#6d48ff",
    triggerType: "instagram_comment",
    fields: [
      {
        key: "keywords",
        label: "Trigger Keywords",
        type: "keywords",
        placeholder: "Add keyword (e.g. LINK, INFO, PRICE)",
        description: "The automation will trigger when someone comments with these keywords.",
      },
      {
        key: "commentReply",
        label: "Auto Comment Reply",
        type: "textarea",
        placeholder: "Thanks for your interest! Check your DMs 💌",
        description: "Reply posted publicly under the comment.",
      },
      {
        key: "dmMessage",
        label: "DM Message",
        type: "textarea",
        placeholder: "Hey {{username}}! Here's the link you requested: https://...",
        description: "Private message sent to the commenter. Use {{username}} for personalization.",
      },
      {
        key: "matchMode",
        label: "Keyword Match Mode",
        type: "select",
        options: [
          { value: "exact", label: "Exact Match" },
          { value: "contains", label: "Contains Keyword" },
          { value: "starts_with", label: "Starts With" },
        ],
        defaultValue: "contains",
      },
      {
        key: "onlyFollowers",
        label: "Only respond to followers",
        type: "toggle",
        defaultValue: false,
        description: "If enabled, only followers will receive the DM.",
      },
    ],
  },

  story: {
    title: "Story Automation",
    subtitle: "Auto respond to story replies and reactions.",
    icon: Flame,
    color: "#ec4899",
    triggerType: "instagram_story_reply",
    fields: [
      {
        key: "reactionTrigger",
        label: "Trigger On",
        type: "select",
        options: [
          { value: "any_reply", label: "Any Story Reply" },
          { value: "emoji_reaction", label: "Specific Emoji Reaction" },
          { value: "text_reply", label: "Text Reply Only" },
          { value: "both", label: "Both Replies & Reactions" },
        ],
        defaultValue: "both",
        description: "Choose what triggers the automation.",
      },
      {
        key: "emojiFilter",
        label: "Emoji Filter (optional)",
        type: "text",
        placeholder: "🔥 ❤️ 😍 (leave empty for any emoji)",
        description: "Only trigger on specific emoji reactions.",
      },
      {
        key: "dmMessage",
        label: "DM Response",
        type: "textarea",
        placeholder: "Hey {{username}}! Thanks for reacting to my story! 🙌 Here's something special for you...",
        description: "Message sent as a DM when the story trigger fires.",
      },
      {
        key: "delaySeconds",
        label: "Delay Before Sending (seconds)",
        type: "number",
        placeholder: "5",
        defaultValue: 3,
        description: "Wait before sending to feel more natural.",
      },
    ],
  },
  live: {
    title: "Live Automation",
    subtitle: "Send a message to followers who are active during lives.",
    icon: Video,
    color: "#ef4444",
    triggerType: "webhook",
    fields: [
      {
        key: "triggerAction",
        label: "Trigger When",
        type: "select",
        options: [
          { value: "comment_keyword", label: "Viewer comments a keyword" },
          { value: "join", label: "Viewer joins the live" },
          { value: "wave", label: "Viewer waves/reacts" },
        ],
        defaultValue: "comment_keyword",
      },
      {
        key: "keywords",
        label: "Trigger Keywords (for comment trigger)",
        type: "keywords",
        placeholder: "Add keyword (e.g. LINK, WANT, YES)",
        description: "Keywords that trigger the DM during live.",
      },
      {
        key: "dmMessage",
        label: "DM Message",
        type: "textarea",
        placeholder: "Hey {{username}}! Since you're watching live, here's an exclusive offer: ...",
        description: "Message sent to active live viewers.",
      },
      {
        key: "cooldownMinutes",
        label: "Cooldown per user (minutes)",
        type: "number",
        placeholder: "60",
        defaultValue: 60,
        description: "Prevent sending multiple DMs to the same user.",
      },
    ],
  },

  dm: {
    title: "DM Automation",
    subtitle: "Automatically reply to the followers who message you.",
    icon: MessageSquare,
    color: "#3b82f6",
    triggerType: "instagram_dm",
    fields: [
      {
        key: "triggerMode",
        label: "Trigger Mode",
        type: "select",
        options: [
          { value: "any_message", label: "Any incoming DM" },
          { value: "keyword", label: "Keyword-based" },
          { value: "first_message", label: "First-time messager only" },
        ],
        defaultValue: "keyword",
      },
      {
        key: "keywords",
        label: "Trigger Keywords",
        type: "keywords",
        placeholder: "Add keyword (e.g. HI, PRICE, HELP)",
        description: "Keywords in the DM that trigger the auto-reply.",
      },
      {
        key: "replyMessage",
        label: "Auto Reply Message",
        type: "textarea",
        placeholder: "Hey {{username}}! Thanks for reaching out. Here's what you need to know...",
        description: "The automated DM response. Use {{username}} for personalization.",
      },
      {
        key: "sendAsQuickReply",
        label: "Include Quick Reply Buttons",
        type: "toggle",
        defaultValue: false,
        description: "Add interactive buttons to guide the conversation.",
      },
      {
        key: "businessHoursOnly",
        label: "Only during business hours",
        type: "toggle",
        defaultValue: false,
        description: "Only send auto-replies during your set business hours.",
      },
    ],
  },
  follow_gate: {
    title: "Ask For Follow",
    subtitle: "Ask users to follow you before sending the message.",
    icon: UserCheck,
    color: "#10b981",
    triggerType: "follow_gate",
    fields: [
      {
        key: "promptMessage",
        label: "Follow Prompt Message",
        type: "textarea",
        placeholder: "Hey! Please follow me first so I can send you the link 🙏",
        description: "Message asking the user to follow before they get the content.",
      },
      {
        key: "confirmMessage",
        label: "Confirmation Message (after follow)",
        type: "textarea",
        placeholder: "Awesome! Thanks for following! Here's what you requested: ...",
        description: "Message sent once the user follows your account.",
      },
      {
        key: "checkInterval",
        label: "Follow Check Interval (seconds)",
        type: "number",
        placeholder: "30",
        defaultValue: 30,
        description: "How often to check if the user followed.",
      },
      {
        key: "timeoutMinutes",
        label: "Timeout (minutes)",
        type: "number",
        placeholder: "60",
        defaultValue: 60,
        description: "Stop checking after this many minutes.",
      },
    ],
  },

  re_trigger: {
    title: "Re-trigger",
    subtitle: "Re-trigger automations for old posts and never lose customers.",
    icon: Repeat,
    color: "#8b5cf6",
    triggerType: "re_trigger",
    fields: [
      {
        key: "scanMode",
        label: "Scan Mode",
        type: "select",
        options: [
          { value: "all_posts", label: "All past posts" },
          { value: "recent", label: "Last 30 days" },
          { value: "specific", label: "Specific posts only" },
        ],
        defaultValue: "recent",
        description: "Which old posts to scan for missed comments.",
      },
      {
        key: "keywords",
        label: "Keywords to Scan",
        type: "keywords",
        placeholder: "Add keyword (e.g. LINK, INFO, WANT)",
        description: "Comments containing these keywords will be processed.",
      },
      {
        key: "dmMessage",
        label: "DM Message",
        type: "textarea",
        placeholder: "Hey {{username}}! I saw you commented on my post. Here's what you were looking for: ...",
        description: "Message sent to users whose old comments match.",
      },
      {
        key: "excludeAlreadySent",
        label: "Skip already contacted users",
        type: "toggle",
        defaultValue: true,
        description: "Don't send to users who already received a DM.",
      },
      {
        key: "maxDmsPerRun",
        label: "Max DMs per scan",
        type: "number",
        placeholder: "50",
        defaultValue: 50,
        description: "Limit DMs per scan to stay within rate limits.",
      },
    ],
  },
  data_capture: {
    title: "Collect User Data",
    subtitle: "Create your email list to re-target audience.",
    icon: Mail,
    color: "#f59e0b",
    triggerType: "data_capture",
    fields: [
      {
        key: "dataField",
        label: "Data to Collect",
        type: "select",
        options: [
          { value: "email", label: "Email Address" },
          { value: "phone", label: "Phone Number" },
          { value: "both", label: "Email & Phone" },
          { value: "custom", label: "Custom Field" },
        ],
        defaultValue: "email",
      },
      {
        key: "askMessage",
        label: "Data Request Message",
        type: "textarea",
        placeholder: "To send you the free guide, please share your email address 📧",
        description: "Message asking the user for their information.",
      },
      {
        key: "confirmMessage",
        label: "Confirmation Message",
        type: "textarea",
        placeholder: "Got it! Check your inbox in the next few minutes 📬",
        description: "Message sent after data is successfully captured.",
      },
      {
        key: "validationEnabled",
        label: "Validate input format",
        type: "toggle",
        defaultValue: true,
        description: "Verify email/phone format before accepting.",
      },
      {
        key: "retryOnInvalid",
        label: "Ask again if invalid",
        type: "toggle",
        defaultValue: true,
        description: "Re-prompt the user if their input doesn't match the expected format.",
      },
    ],
  },

  ai_replies: {
    title: "AI Replies",
    subtitle: "Convert more users with the help of AI ✨",
    icon: Sparkles,
    color: "#6d48ff",
    triggerType: "ai_replies",
    fields: [
      {
        key: "aiPersonality",
        label: "AI Personality",
        type: "select",
        options: [
          { value: "friendly", label: "Friendly & Casual" },
          { value: "professional", label: "Professional" },
          { value: "enthusiastic", label: "Enthusiastic & Hype" },
          { value: "minimal", label: "Short & Direct" },
        ],
        defaultValue: "friendly",
        description: "Choose the AI's tone of voice.",
      },
      {
        key: "contextPrompt",
        label: "AI Context / Instructions",
        type: "textarea",
        placeholder: "You are a helpful assistant for my fitness coaching business. Guide users to my website for booking. My services include: personal training ($99/mo), group classes ($49/mo)...",
        description: "Give the AI context about your business to generate better replies.",
      },
      {
        key: "triggerOn",
        label: "Trigger On",
        type: "select",
        options: [
          { value: "all_dms", label: "All incoming DMs" },
          { value: "comments", label: "All comments" },
          { value: "both", label: "Both DMs & Comments" },
          { value: "unhandled", label: "Only unhandled messages" },
        ],
        defaultValue: "all_dms",
      },
      {
        key: "fallbackMessage",
        label: "Fallback Message (if AI is unsure)",
        type: "textarea",
        placeholder: "Let me connect you with my team! They'll get back to you shortly 🙌",
        description: "Sent when the AI confidence is low.",
      },
      {
        key: "maxTokens",
        label: "Max Response Length (words)",
        type: "number",
        placeholder: "100",
        defaultValue: 100,
        description: "Limit how long AI responses can be.",
      },
      {
        key: "humanHandoff",
        label: "Enable human handoff",
        type: "toggle",
        defaultValue: true,
        description: "Allow AI to escalate to you when it can't help.",
      },
    ],
  },
};


export default function CreateAutomationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const type = searchParams.get("type") || "comment";
  const config = AUTOMATION_TYPES[type] || AUTOMATION_TYPES.comment;
  const { createWorkflow } = useWorkflows();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [keywords, setKeywords] = useState<Record<string, string[]>>({});
  const [keywordInput, setKeywordInput] = useState<Record<string, string>>({});
  const [isCreating, setIsCreating] = useState(false);

  // Initialize defaults
  useEffect(() => {
    const defaults: Record<string, any> = {};
    config.fields.forEach((field) => {
      if (field.defaultValue !== undefined) {
        defaults[field.key] = field.defaultValue;
      }
    });
    setFormData(defaults);
  }, [type]);

  const Icon = config.icon;
  const totalSteps = 3; // Configure → Preview → Activate


  const handleAddKeyword = (fieldKey: string) => {
    const value = (keywordInput[fieldKey] || "").trim().toUpperCase();
    if (!value) return;
    const current = keywords[fieldKey] || [];
    if (current.includes(value)) {
      toast.error("Keyword already added");
      return;
    }
    const updated = [...current, value];
    setKeywords({ ...keywords, [fieldKey]: updated });
    setFormData({ ...formData, [fieldKey]: updated });
    setKeywordInput({ ...keywordInput, [fieldKey]: "" });
  };

  const handleRemoveKeyword = (fieldKey: string, kw: string) => {
    const updated = (keywords[fieldKey] || []).filter((k) => k !== kw);
    setKeywords({ ...keywords, [fieldKey]: updated });
    setFormData({ ...formData, [fieldKey]: updated });
  };

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const wf = await createWorkflow({
        name: `${config.title} - ${new Date().toLocaleDateString()}`,
        description: config.subtitle,
        triggerType: config.triggerType,
      });
      toast.success("Automation created successfully! 🎉");
      setTimeout(() => {
        navigate("/dashboard/automations");
      }, 1000);
    } catch (err) {
      toast.error("Failed to create automation");
    } finally {
      setIsCreating(false);
    }
  };


  const renderField = (field: typeof config.fields[0]) => {
    switch (field.type) {
      case "text":
        return (
          <input
            value={formData[field.key] || ""}
            onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
            placeholder={field.placeholder}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-[#6d48ff] focus:ring-2 focus:ring-[#6d48ff]/10"
          />
        );
      case "textarea":
        return (
          <textarea
            value={formData[field.key] || ""}
            onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
            placeholder={field.placeholder}
            rows={3}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-[#6d48ff] focus:ring-2 focus:ring-[#6d48ff]/10 resize-none"
          />
        );
      case "select":
        return (
          <select
            value={formData[field.key] || field.defaultValue || ""}
            onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-[#6d48ff] focus:ring-2 focus:ring-[#6d48ff]/10"
          >
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        );
      case "number":
        return (
          <input
            type="number"
            value={formData[field.key] || ""}
            onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
            placeholder={field.placeholder}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-[#6d48ff] focus:ring-2 focus:ring-[#6d48ff]/10"
          />
        );

      case "toggle":
        return (
          <button
            onClick={() => setFormData({ ...formData, [field.key]: !formData[field.key] })}
            className={cn(
              "relative h-6 w-11 rounded-full transition-colors",
              formData[field.key] ? "bg-[#6d48ff]" : "bg-slate-200"
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                formData[field.key] ? "translate-x-5" : "translate-x-0"
              )}
            />
          </button>
        );
      case "keywords":
        return (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                value={keywordInput[field.key] || ""}
                onChange={(e) => setKeywordInput({ ...keywordInput, [field.key]: e.target.value })}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddKeyword(field.key); } }}
                placeholder={field.placeholder}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-[#6d48ff] focus:ring-2 focus:ring-[#6d48ff]/10"
              />
              <Button
                onClick={() => handleAddKeyword(field.key)}
                size="sm"
                className="rounded-xl bg-[#6d48ff] hover:bg-[#5a3ae0] text-white px-4"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {(keywords[field.key] || []).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {(keywords[field.key] || []).map((kw) => (
                  <span
                    key={kw}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#6d48ff]/10 px-3 py-1 text-xs font-semibold text-[#6d48ff]"
                  >
                    {kw}
                    <button onClick={() => handleRemoveKeyword(field.key, kw)} className="hover:text-red-500">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };


  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/dashboard/automations")}
          className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Automations
        </button>

        <div className="flex items-center gap-4">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg"
            style={{ backgroundColor: `${config.color}15`, color: config.color }}
          >
            <Icon className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{config.title}</h1>
            <p className="text-sm text-slate-500 mt-0.5">{config.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="mb-8 flex items-center gap-2">
        {[
          { num: 1, label: "Configure", icon: Settings },
          { num: 2, label: "Preview", icon: Eye },
          { num: 3, label: "Activate", icon: Zap },
        ].map(({ num, label, icon: StepIcon }, idx) => (
          <div key={num} className="flex items-center gap-2">
            <button
              onClick={() => setStep(num)}
              className={cn(
                "flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all",
                step === num
                  ? "bg-[#6d48ff] text-white shadow-lg shadow-[#6d48ff]/25"
                  : step > num
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-slate-100 text-slate-400"
              )}
            >
              {step > num ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <StepIcon className="h-3.5 w-3.5" />
              )}
              {label}
            </button>
            {idx < 2 && <ChevronRight className="h-4 w-4 text-slate-300" />}
          </div>
        ))}
      </div>


      {/* Step 1: Configure */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Configuration</h2>
            <p className="text-sm text-slate-500 mb-6">Set up your automation trigger and response.</p>

            <div className="space-y-5">
              {config.fields.map((field) => (
                <div key={field.key} className={cn(
                  "space-y-2",
                  field.type === "toggle" && "flex items-center justify-between"
                )}>
                  <div className={field.type === "toggle" ? "flex-1" : ""}>
                    <label className="block text-sm font-semibold text-slate-700">{field.label}</label>
                    {field.description && (
                      <p className="text-xs text-slate-400 mt-0.5">{field.description}</p>
                    )}
                  </div>
                  <div className={field.type === "toggle" ? "" : "mt-1.5"}>
                    {renderField(field)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => setStep(2)}
              className="rounded-xl bg-[#6d48ff] hover:bg-[#5a3ae0] text-white font-semibold px-8 py-3 shadow-lg shadow-[#6d48ff]/20"
            >
              Preview Setup
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}


      {/* Step 2: Preview */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Preview Your Automation</h2>
            <p className="text-sm text-slate-500 mb-6">Review your settings before activating.</p>

            {/* Preview Card */}
            <div className="rounded-2xl bg-[#0d1020] border border-slate-800 overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b border-slate-800 flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${config.color}20`, color: config.color }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">{config.title}</h3>
                  <p className="text-slate-400 text-xs">{config.triggerType.replace(/_/g, " ")}</p>
                </div>
                <span className="ml-auto text-xs font-bold bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 px-2.5 py-0.5 rounded-full">
                  Ready
                </span>
              </div>

              {/* Settings Summary */}
              <div className="p-4 space-y-3">
                {config.fields.map((field) => {
                  const value = formData[field.key];
                  if (value === undefined || value === "" || value === null) return null;
                  
                  let displayValue: string;
                  if (field.type === "toggle") {
                    displayValue = value ? "✅ Enabled" : "❌ Disabled";
                  } else if (field.type === "keywords") {
                    const kws = keywords[field.key] || [];
                    displayValue = kws.length > 0 ? kws.join(", ") : "None set";
                  } else if (field.type === "select") {
                    const opt = field.options?.find((o) => o.value === value);
                    displayValue = opt?.label || String(value);
                  } else {
                    displayValue = String(value);
                  }

                  return (
                    <div key={field.key} className="flex items-start gap-3 text-sm">
                      <span className="text-slate-500 font-medium min-w-[140px] shrink-0">{field.label}:</span>
                      <span className="text-white font-medium break-all">{displayValue}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button
              onClick={() => setStep(1)}
              variant="outline"
              className="rounded-xl font-semibold px-6"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Edit Settings
            </Button>
            <Button
              onClick={() => setStep(3)}
              className="rounded-xl bg-[#6d48ff] hover:bg-[#5a3ae0] text-white font-semibold px-8 shadow-lg shadow-[#6d48ff]/20"
            >
              Continue to Activate
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}


      {/* Step 3: Activate */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center">
            <div
              className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl"
              style={{ backgroundColor: `${config.color}10` }}
            >
              <Zap className="h-10 w-10" style={{ color: config.color }} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Ready to Activate!</h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto mb-8">
              Your <strong>{config.title}</strong> is configured and ready to go. 
              Once activated, it will automatically respond to triggers in real-time.
            </p>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-4 mb-8 max-w-lg mx-auto">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-2xl font-bold text-[#6d48ff]">
                  {Object.values(formData).filter((v) => v !== undefined && v !== "" && v !== null).length}
                </p>
                <p className="text-xs text-slate-500 font-medium mt-1">Settings Configured</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-2xl font-bold text-emerald-600">
                  {Object.values(keywords).reduce((acc, arr) => acc + arr.length, 0) || "—"}
                </p>
                <p className="text-xs text-slate-500 font-medium mt-1">Keywords Set</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-2xl font-bold text-amber-600">24/7</p>
                <p className="text-xs text-slate-500 font-medium mt-1">Active Time</p>
              </div>
            </div>

            {/* Important note */}
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 mb-8 max-w-lg mx-auto text-left flex gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Before activating</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Make sure your Instagram account is connected in Settings. The automation will start immediately once activated.
                </p>
              </div>
            </div>

            <div className="flex justify-center gap-3">
              <Button
                onClick={() => setStep(2)}
                variant="outline"
                className="rounded-xl font-semibold px-6"
              >
                Go Back
              </Button>
              <Button
                onClick={handleCreate}
                disabled={isCreating}
                className="rounded-xl bg-[#6d48ff] hover:bg-[#5a3ae0] text-white font-bold px-10 py-3 shadow-xl shadow-[#6d48ff]/30 text-base"
              >
                {isCreating ? (
                  <>
                    <span className="animate-spin mr-2">⚡</span>
                    Creating...
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5 mr-2" />
                    Activate Automation
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
