import { useWorkflow } from "@/lib/supabase-hooks.ts";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useCallback, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Play,
  Save,
  Plus,
  Trash2,
  Link2,
  MessageSquare,
  Clock,
  GitBranch,
  Bot,
  Mail,
  Webhook,
  FileText,
  LogOut,
  UserCheck,
  Settings,
  Activity,
  X,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils.ts";
import { toast } from "sonner";

const NODE_TYPES: Record<
  string,
  { label: string; color: string; icon: any; defaults: Record<string, any>; description: string }
> = {
  trigger: {
    label: "Trigger",
    color: "#635bff",
    icon: Play,
    defaults: { triggerType: "instagram_comment", scanOldPosts: false },
    description: "Starts the workflow automation rule",
  },
  follow_gate: {
    label: "Follow Gate",
    color: "#ec4899",
    icon: UserCheck,
    defaults: { promptIfNotFollowing: "Please follow our account first so we can send you the link!" },
    description: "Verify follower status before sending a DM",
  },
  data_capture: {
    label: "Data Capture",
    color: "#3b82f6",
    icon: FileText,
    defaults: { fieldToCollect: "email", prompt: "Please reply with your email address to receive the PDF!" },
    description: "Collect and save contact details (email or phone)",
  },
  send_dm: {
    label: "Send DM",
    color: "#10b981",
    icon: MessageSquare,
    defaults: { message: "" },
    description: "Send Instagram Direct Message",
  },
  ai_reply: {
    label: "AI Reply",
    color: "#06b6d4",
    icon: Bot,
    defaults: {
      prompt:
        "You are a friendly assistant for our shop. Answer customer queries politely and guide them to our website.",
    },
    description: "Generate AI-powered response reply",
  },
  delay: {
    label: "Delay",
    color: "#f59e0b",
    icon: Clock,
    defaults: { durationMs: 1000 },
    description: "Wait before continuing flow execution",
  },
  condition: {
    label: "Condition",
    color: "#eab308",
    icon: GitBranch,
    defaults: { expression: "" },
    description: "Branch based on a custom expression",
  },
  http_request: {
    label: "HTTP Request",
    color: "#ff5a2f",
    icon: Webhook,
    defaults: { url: "", method: "GET" },
    description: "Make an external API request",
  },
  update_lead: {
    label: "Update Lead",
    color: "#8b5cf6",
    icon: FileText,
    defaults: {},
    description: "Update lead profile attribute record",
  },
  send_email: {
    label: "Send Email",
    color: "#ef4444",
    icon: Mail,
    defaults: { subject: "", body: "" },
    description: "Send an automated email notification",
  },
  webhook: {
    label: "Webhook",
    color: "#64748b",
    icon: Webhook,
    defaults: { url: "" },
    description: "Trigger an external webhook endpoint",
  },
  log: {
    label: "Log",
    color: "#94a3b8",
    icon: FileText,
    defaults: { message: "" },
    description: "Log debug statement parameters",
  },
  end: {
    label: "End",
    color: "#df1b41",
    icon: LogOut,
    defaults: {},
    description: "End of workflow automation path",
  },
};

const PALETTE_GROUPS = [
  {
    title: "Triggers & Gates",
    items: ["trigger", "follow_gate", "condition"],
  },
  {
    title: "Actions & Messages",
    items: ["send_dm", "ai_reply", "delay", "send_email"],
  },
  {
    title: "Data & Advanced",
    items: ["data_capture", "update_lead", "http_request", "webhook", "log", "end"],
  },
];

type CanvasNode = {
  _id: string;
  type: string;
  label: string;
  config?: string;
  x: number;
  y: number;
};

type CanvasEdge = {
  _id: string;
  sourceNodeId: string;
  targetNodeId: string;
  label?: string;
  conditionExpression?: string;
};

export default function WorkflowBuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    workflowData,
    executions,
    addNode,
    updateNode,
    removeNode,
    addEdge,
    removeEdge,
    updateWorkflow,
    triggerWorkflow,
    loading,
  } = useWorkflow(id || "");

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [dx, setDx] = useState(0);
  const [dy, setDy] = useState(0);
  const [showPalette, setShowPalette] = useState(false);
  const [palettePos, setPalettePos] = useState({ x: 100, y: 100 });
  
  // Naming states
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState("");

  const canvasRef = useRef<HTMLDivElement>(null);

  // Initialize title
  useEffect(() => {
    if (workflowData?.workflow?.name) {
      setTempTitle(workflowData.workflow.name);
    }
  }, [workflowData?.workflow?.name]);

  const handleRenameSave = async () => {
    if (tempTitle.trim() && tempTitle.trim() !== workflowData?.workflow?.name) {
      await updateWorkflow({ workflowId: id as any, name: tempTitle.trim() });
      toast.success("Workflow renamed successfully");
    }
    setIsEditingTitle(false);
  };

  if (loading || !workflowData) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#635bff]" />
      </div>
    );
  }

  const { workflow, nodes, edges } = workflowData;

  const canvasNodes: CanvasNode[] = (nodes as any[]).map((n: any) => ({
    _id: n._id,
    type: n.type,
    label: n.label,
    config: n.config,
    x: n.positionX ?? 0,
    y: n.positionY ?? 0,
  }));

  const canvasEdges: CanvasEdge[] = (edges as any[]).map((e: any) => ({
    _id: e._id,
    sourceNodeId: e.sourceNodeId,
    targetNodeId: e.targetNodeId,
    label: e.label,
    conditionExpression: e.conditionExpression,
  }));

  const selectedNode = (nodes as any[]).find((n: any) => n._id === selectedNodeId);

  const handleAddNode = async (type: string) => {
    if (!id) return;
    const label = NODE_TYPES[type]?.label || type;
    
    // Adjust pos to fit relative coordinates within canvas scroll
    let relativeX = palettePos.x;
    let relativeY = palettePos.y;
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      relativeX = relativeX - rect.left + canvasRef.current.scrollLeft;
      relativeY = relativeY - rect.top + canvasRef.current.scrollTop;
    }

    await addNode({
      workflowId: id as any,
      type: type as any,
      label,
      positionX: Math.max(20, relativeX - 95),
      positionY: Math.max(20, relativeY - 38),
      config: JSON.stringify(NODE_TYPES[type]?.defaults || {}),
    });
    setShowPalette(false);
    toast.success(`Node '${label}' added`);
  };

  const handleDragStart = (nodeId: string, e: React.MouseEvent) => {
    // Only drag on left click and not on ports
    if (e.button !== 0 || (e.target as HTMLElement).closest("[title*='Port']")) return;
    setDraggingNode(nodeId);
    const node = canvasNodes.find((n) => n._id === nodeId);
    if (node) {
      setDx(e.clientX - node.x);
      setDy(e.clientY - node.y);
    }
    e.preventDefault();
  };

  const handleDragMove = useCallback(
    (e: MouseEvent) => {
      if (draggingNode) {
        const x = e.clientX - dx;
        const y = e.clientY - dy;
        updateNode({ nodeId: draggingNode as any, positionX: Math.max(0, x), positionY: Math.max(0, y) });
      }
    },
    [draggingNode, dx, dy, updateNode]
  );

  const handleDragEnd = useCallback(() => {
    setDraggingNode(null);
  }, []);

  useEffect(() => {
    if (draggingNode) {
      window.addEventListener("mousemove", handleDragMove);
      window.addEventListener("mouseup", handleDragEnd);
      return () => {
        window.removeEventListener("mousemove", handleDragMove);
        window.removeEventListener("mouseup", handleDragEnd);
      };
    }
  }, [draggingNode, handleDragMove, handleDragEnd]);

  // Standardized 190x76 Card Port Positions
  const getOutputPortPosition = (node: CanvasNode) => ({
    x: node.x + 190,
    y: node.y + 38,
  });

  const getInputPortPosition = (node: CanvasNode) => ({
    x: node.x,
    y: node.y + 38,
  });

  const handleCanvasClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).dataset?.canvas) {
      setSelectedNodeId(null);
      setShowPalette(false);
    }
  };

  const handleTrigger = async () => {
    if (!id) return;
    toast.info("Running simulation...");
    await triggerWorkflow({ workflowId: id as any, workspaceId: "" as any, payload: "{}" });
  };

  const handleSavePublish = () => {
    updateWorkflow({
      workflowId: id as any,
      status: (workflow.status === "draft" ? "active" : workflow.status) as any,
    });
    toast.success("Workflow rules published & active!");
  };

  return (
    <div className="flex h-full flex-col bg-slate-50">
      {/* Figma-Style Toolbar */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard/workflows")}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          
          <div className="flex flex-col">
            {isEditingTitle ? (
              <input
                type="text"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onBlur={handleRenameSave}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRenameSave();
                  if (e.key === "Escape") {
                    setTempTitle(workflow.name);
                    setIsEditingTitle(false);
                  }
                }}
                className="text-sm font-bold text-slate-800 border-b border-[#635bff] outline-none bg-transparent py-0.5 w-48"
                autoFocus
              />
            ) : (
              <div className="flex items-center gap-1.5 group">
                <h2
                  onDoubleClick={() => setIsEditingTitle(true)}
                  className="text-sm font-bold text-slate-800 cursor-pointer hover:text-[#635bff] transition-colors leading-tight"
                  title="Double click to rename"
                >
                  {workflow.name}
                </h2>
                <button
                  onClick={() => setIsEditingTitle(true)}
                  className="opacity-0 group-hover:opacity-100 text-2xs font-semibold text-slate-400 hover:text-[#635bff] transition-opacity cursor-pointer"
                >
                  Rename
                </button>
              </div>
            )}
            <p className="text-[10px] font-semibold text-slate-400 leading-none mt-0.5">
              {workflow.description || workflow.triggerType.replace(/_/g, " ")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase">STATUS:</span>
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-3xs font-black uppercase tracking-wider border",
                workflow.status === "active"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : workflow.status === "paused"
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-blue-50 text-blue-700 border-blue-200"
              )}
            >
              {workflow.status}
            </span>
          </div>

          <div className="h-4 w-px bg-slate-200" />

          <button
            onClick={handleTrigger}
            className="flex items-center gap-1.5 rounded-[4px] bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 transition-colors cursor-pointer"
          >
            <Play className="h-3 w-3" />
            Run Test
          </button>
          
          <button
            onClick={handleSavePublish}
            className="flex items-center gap-1.5 rounded-[4px] bg-[#635bff] hover:bg-[#563acc] text-white text-xs font-bold px-4 py-1.5 shadow-stripe-button transition-colors cursor-pointer"
          >
            <Save className="h-3 w-3" />
            Publish
          </button>
        </div>
      </header>

      {/* Main Builder Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Canvas Area */}
        <div
          ref={canvasRef}
          data-canvas="true"
          className="relative flex-1 overflow-auto bg-slate-50 outline-none select-none"
          onClick={handleCanvasClick}
          onMouseUp={() => setConnectingFrom(null)}
          onContextMenu={(e) => {
            e.preventDefault();
            setPalettePos({ x: e.clientX, y: e.clientY });
            setShowPalette(true);
          }}
          style={{
            backgroundImage: "radial-gradient(#cfd7df 1.2px, transparent 1.2px)",
            backgroundSize: "20px 20px",
          }}
        >
          {/* SVG Connection Paths */}
          <svg className="pointer-events-none absolute inset-0 h-[2000px] w-[2000px]">
            <defs>
              <marker
                id="arrowhead"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#635bff" />
              </marker>
            </defs>
            
            {canvasEdges.map((edge) => {
              const source = canvasNodes.find((n) => n._id === edge.sourceNodeId);
              const target = canvasNodes.find((n) => n._id === edge.targetNodeId);
              if (!source || !target) return null;
              
              const from = getOutputPortPosition(source);
              const to = getInputPortPosition(target);
              const midX = (from.x + to.x) / 2;
              
              const isSelectedPath = selectedNodeId === edge.sourceNodeId || selectedNodeId === edge.targetNodeId;
              
              return (
                <g key={edge._id}>
                  {/* Glowing shadow path under active/selected edges */}
                  {isSelectedPath && (
                    <path
                      d={`M ${from.x} ${from.y} C ${midX} ${from.y}, ${midX} ${to.y}, ${to.x} ${to.y}`}
                      fill="none"
                      stroke="#635bff20"
                      strokeWidth="6"
                    />
                  )}
                  {/* Core connector path */}
                  <path
                    d={`M ${from.x} ${from.y} C ${midX} ${from.y}, ${midX} ${to.y}, ${to.x} ${to.y}`}
                    fill="none"
                    stroke={isSelectedPath ? "#635bff" : "#a5b4fc"}
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                    strokeDasharray={isSelectedPath ? "5,5" : undefined}
                    className={cn("transition-all duration-300", isSelectedPath ? "animate-pulse" : "")}
                  />
                  
                  {edge.label && (
                    <g>
                      <rect
                        x={midX - 35}
                        y={(from.y + to.y) / 2 - 8}
                        width="70"
                        height="16"
                        rx="4"
                        fill="#f8fafc"
                        stroke="#e2e8f0"
                        strokeWidth="1"
                      />
                      <text
                        x={midX}
                        y={(from.y + to.y) / 2 + 4}
                        textAnchor="middle"
                        fontSize="9"
                        fontWeight="bold"
                        fill="#4f566b"
                      >
                        {edge.label}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {connectingFrom && (
              (() => {
                const source = canvasNodes.find((n) => n._id === connectingFrom);
                if (!source) return null;
                const from = getOutputPortPosition(source);
                return (
                  <path
                    d={`M ${from.x} ${from.y} L ${from.x + 80} ${from.y}`}
                    fill="none"
                    stroke="#635bff"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                );
              })()
            )}
          </svg>

          {/* Render Nodes */}
          {canvasNodes.map((node) => {
            const nt = NODE_TYPES[node.type] || NODE_TYPES.log;
            const isSelected = selectedNodeId === node._id;
            const isTrigger = node.type === "trigger";
            const isEnd = node.type === "end";

            // Parse configurations to display details
            let summary = "";
            try {
              if (node.config) {
                const parsed = JSON.parse(node.config);
                if (node.type === "trigger") {
                  summary = parsed.triggerType ? parsed.triggerType.replace(/_/g, " ") : "Instagram comment";
                } else if (node.type === "send_dm") {
                  summary = parsed.message ? `"${parsed.message.slice(0, 16)}..."` : "Empty message";
                } else if (node.type === "follow_gate") {
                  summary = "Follow restriction";
                } else if (node.type === "data_capture") {
                  summary = `Collect: ${parsed.fieldToCollect || "email"}`;
                } else if (node.type === "delay") {
                  summary = `${(parsed.durationMs || 1000) / 1000}s pause`;
                } else if (node.type === "ai_reply") {
                  summary = "AI auto-reply agent";
                } else if (node.type === "condition") {
                  summary = parsed.expression ? parsed.expression : "Check rules";
                }
              }
            } catch (err) {}

            return (
              <div
                key={node._id}
                className={cn(
                  "absolute flex flex-col rounded-xl border bg-white shadow-sm transition-all duration-200 select-none group",
                  isSelected
                    ? "border-[#635bff] ring-2 ring-[#635bff]/20 shadow-md scale-[1.02]"
                    : "border-slate-200 hover:border-slate-300 hover:shadow-md hover:scale-[1.01]"
                )}
                style={{ left: node.x, top: node.y, width: 190, height: 76 }}
                onMouseDown={(e) => handleDragStart(node._id, e)}
                onMouseUp={(e) => {
                  if (connectingFrom && connectingFrom !== node._id) {
                    addEdge({
                      workflowId: id as any,
                      sourceNodeId: connectingFrom as any,
                      targetNodeId: node._id as any,
                    });
                    toast.success("Nodes connected successfully!");
                  }
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedNodeId(node._id);
                }}
              >
                {/* Visual Category Line */}
                <div className="h-1 rounded-t-xl" style={{ backgroundColor: nt.color }} />

                {/* Body Content */}
                <div className="flex flex-1 items-center gap-2.5 p-3 min-w-0">
                  <span
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-lg"
                    style={{ backgroundColor: `${nt.color}15`, color: nt.color }}
                  >
                    <nt.icon className="h-4.5 w-4.5" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-slate-800 leading-tight">{node.label}</p>
                    <p className="truncate text-[9px] text-slate-400 font-semibold leading-none mt-0.5">
                      {isTrigger ? "RULE TRIGGER" : nt.label.toUpperCase()}
                    </p>
                    {summary && (
                      <p className="truncate text-[9px] text-slate-500 font-normal leading-none mt-1.5 italic">
                        {summary}
                      </p>
                    )}
                  </div>
                </div>

                {/* Ports */}
                {/* Input anchor on left (except trigger) */}
                {!isTrigger && (
                  <div
                    className="absolute -left-1.5 top-[32px] h-3.5 w-3.5 rounded-full border-2 border-white bg-slate-300 transition-colors shadow-sm z-10 group-hover:bg-[#635bff]/40"
                    title="Input Port"
                  />
                )}

                {/* Output port handle on the right (except end) */}
                {!isEnd && (
                  <div
                    className="absolute -right-1.5 top-[32px] h-3.5 w-3.5 rounded-full border-2 border-white bg-[#635bff] cursor-crosshair hover:scale-125 hover:ring-4 hover:ring-[#635bff]/20 transition-all shadow-sm z-10"
                    title="Output Port"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      setConnectingFrom(node._id);
                    }}
                  />
                )}
              </div>
            );
          })}

          {/* Dotted Grid floating controls */}
          <button
            className="absolute bottom-5 right-5 flex h-10 w-10 items-center justify-center rounded-full bg-[#635bff] text-white shadow-lg hover:bg-[#563acc] hover:scale-105 transition-all cursor-pointer z-20"
            onClick={(e) => {
              e.stopPropagation();
              setPalettePos({ x: e.clientX - 200, y: e.clientY - 200 });
              setShowPalette(!showPalette);
            }}
          >
            <Plus className="h-5 w-5" />
          </button>

          {/* Redesigned Floating Palette Popover */}
          {showPalette && (
            <div
              className="absolute z-50 w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-stripe-card"
              style={{ left: palettePos.x, top: palettePos.y }}
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-[#635bff]" /> Add Action Node
                </span>
                <button
                  onClick={() => setShowPalette(false)}
                  className="text-slate-400 hover:text-slate-600 rounded-full p-1"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>

              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                {PALETTE_GROUPS.map((group) => (
                  <div key={group.title} className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">{group.title}</p>
                    <div className="space-y-0.5">
                      {group.items.map((key) => {
                        const nt = NODE_TYPES[key];
                        if (!nt) return null;
                        return (
                          <button
                            key={key}
                            className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors cursor-pointer"
                            onClick={() => handleAddNode(key)}
                          >
                            <span
                              className="grid h-6 w-6 shrink-0 place-items-center rounded-md"
                              style={{ backgroundColor: `${nt.color}15`, color: nt.color }}
                            >
                              <nt.icon className="h-3.5 w-3.5" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate leading-tight">{nt.label}</p>
                              <p className="truncate text-[9px] text-slate-400 font-normal leading-none mt-0.5">
                                {nt.description}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Tabbed Inspector Sidebar */}
        <div className="w-72 border-l border-slate-200 bg-white overflow-y-auto shrink-0 shadow-sm flex flex-col">
          {selectedNode ? (
            <NodeConfigPanel
              node={selectedNode}
              edges={canvasEdges.filter(
                (e) => e.sourceNodeId === selectedNode._id || e.targetNodeId === selectedNode._id
              )}
              onUpdate={(config) => {
                updateNode({ nodeId: selectedNode._id as any, config: JSON.stringify(config) });
              }}
              onDelete={() => {
                removeNode({ nodeId: selectedNode._id as any });
                setSelectedNodeId(null);
                toast.info("Node deleted successfully");
              }}
              onLabelChange={(label) => {
                updateNode({ nodeId: selectedNode._id as any, label });
              }}
              onAddEdge={() => {
                setConnectingFrom(selectedNode._id);
                toast.info("Click port or drag target to connect");
              }}
            />
          ) : (
            /* Redesigned Global Sidebar Panel */
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Workflow Overview</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Set up keyword-based messaging automation rules for Instagram and simulate campaign runs.
                  </p>
                </div>

                <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
                  <p className="text-xs font-semibold text-slate-700">Automation Rule Status</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border",
                        workflow.status === "active"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : workflow.status === "paused"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                      )}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {workflow.status.toUpperCase()}
                    </span>

                    <select
                      value={workflow.status}
                      onChange={(e) => updateWorkflow({ workflowId: id as any, status: e.target.value as any })}
                      className="rounded border border-slate-200 px-2 py-1 text-xs bg-white text-slate-700 focus:outline-none"
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                    </select>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-5">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Simulation History</h4>
                    <button onClick={handleTrigger} className="text-xs font-semibold text-[#635bff] hover:underline">
                      Run Test
                    </button>
                  </div>

                  <div className="space-y-2">
                    {/* Styled list of simulated executions */}
                    <div className="rounded-lg border border-slate-100 p-3 bg-slate-50/20 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-emerald-600 flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Completed
                        </span>
                        <span className="text-slate-400 text-[10px]">Just now</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                        Processed comment trigger successfully.
                      </p>
                    </div>

                    <div className="rounded-lg border border-slate-100 p-3 bg-slate-50/20 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-emerald-600 flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Completed
                        </span>
                        <span className="text-slate-400 text-[10px]">2 mins ago</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                        Triggered from comment keywords by user @creator_test.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-slate-100 bg-[#f8f9fc] p-3 text-[10px] text-slate-400 leading-normal flex items-start gap-2">
                <Sparkles className="h-4.5 w-4.5 text-[#635bff] shrink-0 mt-0.5 animate-pulse" />
                <span>Tip: Right-click anywhere on the canvas to open the quick node insert palette instantly.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NodeConfigPanel({
  node,
  edges,
  onUpdate,
  onDelete,
  onLabelChange,
  onAddEdge,
}: {
  node: any;
  edges: CanvasEdge[];
  onUpdate: (config: Record<string, any>) => void;
  onDelete: () => void;
  onLabelChange: (label: string) => void;
  onAddEdge: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"setup" | "connections">("setup");

  let config: Record<string, any> = {};
  try {
    config = node.config ? JSON.parse(node.config) : {};
  } catch (e) {
    console.error("Failed to parse node config", e);
  }
  const nt = NODE_TYPES[node.type] || NODE_TYPES.log;

  return (
    <div className="flex flex-col h-full">
      {/* Sidebar header */}
      <div className="border-b border-slate-100 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="grid h-7 w-7 place-items-center rounded-md"
            style={{ backgroundColor: `${nt.color}15`, color: nt.color }}
          >
            <nt.icon className="h-4 w-4" />
          </span>
          <h3 className="text-sm font-bold text-slate-800">{nt.label}</h3>
        </div>
        <button
          onClick={onDelete}
          className="rounded-lg p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
          title="Delete Node"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Redesigned Tab Switches */}
      <div className="flex border-b border-slate-100">
        <button
          onClick={() => setActiveTab("setup")}
          className={cn(
            "flex-1 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer",
            activeTab === "setup"
              ? "border-[#635bff] text-[#635bff]"
              : "border-transparent text-slate-400 hover:text-slate-600"
          )}
        >
          <Settings className="h-3.5 w-3.5" />
          Setup
        </button>
        <button
          onClick={() => setActiveTab("connections")}
          className={cn(
            "flex-1 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer",
            activeTab === "connections"
              ? "border-[#635bff] text-[#635bff]"
              : "border-transparent text-slate-400 hover:text-slate-600"
          )}
        >
          <Activity className="h-3.5 w-3.5" />
          Connections
        </button>
      </div>

      {/* Inspector Body content */}
      <div className="p-4 flex-1 overflow-y-auto">
        {activeTab === "setup" ? (
          <div className="space-y-4">
            {/* Card description */}
            {nt.description && <p className="text-[11px] text-slate-400 leading-normal">{nt.description}</p>}

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Node Name / Label</label>
              <input
                value={node.label}
                onChange={(e) => onLabelChange(e.target.value)}
                className="w-full rounded-stripe-input border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-[#635bff] focus:ring-1 focus:ring-[#635bff] outline-none shadow-sm transition-all"
              />
            </div>

            {/* Type-specific configs */}
            {node.type === "trigger" && (
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Trigger Type</label>
                  <select
                    value={config.triggerType || "instagram_comment"}
                    onChange={(e) => onUpdate({ ...config, triggerType: e.target.value })}
                    className="w-full rounded-stripe-input border border-slate-200 px-3 py-2 text-xs text-slate-800 bg-white focus:border-[#635bff] focus:ring-1 focus:ring-[#635bff] outline-none shadow-sm transition-all"
                  >
                    <option value="instagram_comment">Instagram Comment</option>
                    <option value="instagram_dm">Instagram DM</option>
                    <option value="instagram_story_reply">Instagram Story Reply</option>
                    <option value="webhook">Webhook</option>
                    <option value="schedule">Schedule (Cron)</option>
                  </select>
                </div>
                {["instagram_comment", "instagram_dm", "instagram_story_reply"].includes(
                  config.triggerType || "instagram_comment"
                ) && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Keywords (comma-separated)
                    </label>
                    <input
                      value={config.keywords || ""}
                      onChange={(e) => onUpdate({ ...config, keywords: e.target.value })}
                      className="w-full rounded-stripe-input border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-[#635bff] focus:ring-1 focus:ring-[#635bff] outline-none shadow-sm transition-all"
                      placeholder="e.g. guide, promo, discount"
                    />
                    <p className="text-[9px] text-slate-400 font-normal leading-normal">
                      Leave empty to reply to all comments/DMs.
                    </p>
                  </div>
                )}
                {(config.triggerType || "instagram_comment") === "instagram_comment" && (
                  <div className="flex items-center gap-2 pt-1.5">
                    <input
                      type="checkbox"
                      id="scanOldPosts"
                      checked={!!config.scanOldPosts}
                      onChange={(e) => onUpdate({ ...config, scanOldPosts: e.target.checked })}
                      className="h-4 w-4 rounded-sm border-slate-300 text-[#635bff] focus:ring-[#635bff] cursor-pointer"
                    />
                    <label htmlFor="scanOldPosts" className="text-xs text-slate-600 select-none cursor-pointer">
                      Scan older posts / Re-trigger
                    </label>
                  </div>
                )}
              </div>
            )}

            {node.type === "follow_gate" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Prompt if not following
                </label>
                <textarea
                  value={config.promptIfNotFollowing || ""}
                  onChange={(e) => onUpdate({ ...config, promptIfNotFollowing: e.target.value })}
                  rows={4}
                  className="w-full rounded-stripe-input border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-[#635bff] focus:ring-1 focus:ring-[#635bff] outline-none shadow-sm transition-all"
                  placeholder="Please follow our account first so we can send you the link!"
                />
              </div>
            )}

            {node.type === "data_capture" && (
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Field to Collect</label>
                  <select
                    value={config.fieldToCollect || "email"}
                    onChange={(e) => onUpdate({ ...config, fieldToCollect: e.target.value })}
                    className="w-full rounded-stripe-input border border-slate-200 px-3 py-2 text-xs text-slate-800 bg-white focus:border-[#635bff] focus:ring-1 focus:ring-[#635bff] outline-none shadow-sm transition-all"
                  >
                    <option value="email">Email Address</option>
                    <option value="phone">Phone Number</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Question Prompt</label>
                  <textarea
                    value={config.prompt || ""}
                    onChange={(e) => onUpdate({ ...config, prompt: e.target.value })}
                    rows={3}
                    className="w-full rounded-stripe-input border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-[#635bff] focus:ring-1 focus:ring-[#635bff] outline-none shadow-sm transition-all"
                    placeholder="Please reply with your email address to receive the PDF!"
                  />
                </div>
              </div>
            )}

            {node.type === "ai_reply" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">AI System Prompt</label>
                <textarea
                  value={config.prompt || ""}
                  onChange={(e) => onUpdate({ ...config, prompt: e.target.value })}
                  rows={5}
                  className="w-full rounded-stripe-input border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-[#635bff] focus:ring-1 focus:ring-[#635bff] outline-none shadow-sm transition-all"
                  placeholder="You are a friendly customer service agent. Answer questions about..."
                />
              </div>
            )}

            {node.type === "send_dm" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Message Content</label>
                <textarea
                  value={config.message || ""}
                  onChange={(e) => onUpdate({ ...config, message: e.target.value })}
                  rows={5}
                  className="w-full rounded-stripe-input border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-[#635bff] focus:ring-1 focus:ring-[#635bff] outline-none shadow-sm transition-all"
                  placeholder="Hello! Thanks for your comment. Here is your free copy..."
                />
              </div>
            )}

            {node.type === "http_request" && (
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Method</label>
                  <select
                    value={config.method || "GET"}
                    onChange={(e) => onUpdate({ ...config, method: e.target.value })}
                    className="w-full rounded-stripe-input border border-slate-200 px-3 py-2 text-xs text-slate-800 bg-white focus:border-[#635bff] focus:ring-1 focus:ring-[#635bff] outline-none shadow-sm transition-all"
                  >
                    <option>GET</option>
                    <option>POST</option>
                    <option>PUT</option>
                    <option>DELETE</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Request URL</label>
                  <input
                    value={config.url || ""}
                    onChange={(e) => onUpdate({ ...config, url: e.target.value })}
                    className="w-full rounded-stripe-input border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-[#635bff] focus:ring-1 focus:ring-[#635bff] outline-none shadow-sm transition-all"
                    placeholder="https://api.yourdomain.com/endpoint"
                  />
                </div>
              </div>
            )}

            {node.type === "delay" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Wait Duration (seconds)
                </label>
                <input
                  type="number"
                  value={(config.durationMs || 1000) / 1000}
                  onChange={(e) => onUpdate({ ...config, durationMs: parseInt(e.target.value) * 1000 })}
                  min={0}
                  className="w-full rounded-stripe-input border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-[#635bff] focus:ring-1 focus:ring-[#635bff] outline-none shadow-sm transition-all"
                />
              </div>
            )}

            {node.type === "condition" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Condition Expression</label>
                <input
                  value={config.expression || ""}
                  onChange={(e) => onUpdate({ ...config, expression: e.target.value })}
                  className="w-full rounded-stripe-input border border-slate-200 px-3 py-2 text-xs text-slate-800 font-mono focus:border-[#635bff] focus:ring-1 focus:ring-[#635bff] outline-none shadow-sm transition-all"
                  placeholder='payload.text contains "guide"'
                />
                <p className="text-[9px] text-slate-400 font-normal leading-normal">
                  E.g. payload.text == "YES" or payload.follows == true
                </p>
              </div>
            )}

            {node.type === "webhook" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Webhook URL</label>
                <input
                  value={config.url || ""}
                  onChange={(e) => onUpdate({ ...config, url: e.target.value })}
                  className="w-full rounded-stripe-input border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-[#635bff] focus:ring-1 focus:ring-[#635bff] outline-none shadow-sm transition-all"
                  placeholder="https://make.com/webhooks/your-hook"
                />
              </div>
            )}

            {node.type === "log" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Log Message</label>
                <input
                  value={config.message || ""}
                  onChange={(e) => onUpdate({ ...config, message: e.target.value })}
                  className="w-full rounded-stripe-input border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-[#635bff] focus:ring-1 focus:ring-[#635bff] outline-none shadow-sm transition-all"
                  placeholder="Trigger completed"
                />
              </div>
            )}
          </div>
        ) : (
          /* Tab 2: Connections details */
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Connections</h4>
            {edges.length === 0 ? (
              <p className="text-xs text-slate-400">No active ports are connected to this node yet.</p>
            ) : (
              <div className="space-y-2">
                {edges.map((edge) => (
                  <div
                    key={edge._id}
                    className="flex flex-col gap-1.5 rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-xs text-slate-600 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 font-bold text-slate-700">
                        <Link2 className="h-3.5 w-3.5 text-[#635bff]" /> Connection ID
                      </span>
                      <span className="text-[9px] font-mono text-slate-400">{edge._id}</span>
                    </div>
                    {edge.label && (
                      <p className="text-[10px] text-slate-500 leading-normal">
                        Condition: <span className="font-bold text-[#635bff] bg-indigo-50/50 px-1 py-0.5 rounded border border-indigo-100">{edge.label}</span>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={onAddEdge}
              className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-[#a5b4fc] py-2.5 text-xs font-bold text-[#635bff] hover:bg-indigo-50/50 hover:border-[#635bff] transition-all cursor-pointer"
            >
              <Link2 className="h-3.5 w-3.5" />
              Add Connection Line
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
