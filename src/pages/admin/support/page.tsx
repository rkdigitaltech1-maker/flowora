import { useState } from "react";
import { useAdminSupportTickets } from "@/lib/supabase-hooks.ts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import { HeadphonesIcon, ArrowLeft, Send, User, MessageSquare } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils.ts";

type TicketStatus = "open" | "in_progress" | "waiting_on_user" | "resolved" | "closed";

const STATUS_CONFIG: Record<TicketStatus, { label: string; cls: string }> = {
  open:            { label: "Open",           cls: "bg-blue-100 text-blue-700" },
  in_progress:     { label: "In Progress",    cls: "bg-purple-100 text-purple-700" },
  waiting_on_user: { label: "Awaiting Reply", cls: "bg-orange-100 text-orange-700" },
  resolved:        { label: "Resolved",       cls: "bg-green-100 text-green-700" },
  closed:          { label: "Closed",         cls: "bg-gray-100 text-gray-500" },
};

const PRIORITY_CONFIG = {
  low:    { label: "Low",    cls: "bg-gray-100 text-gray-600" },
  medium: { label: "Medium", cls: "bg-blue-100 text-blue-700" },
  high:   { label: "High",   cls: "bg-orange-100 text-orange-700" },
  urgent: { label: "Urgent", cls: "bg-red-100 text-red-700" },
};

const CATEGORIES: Record<string, string> = {
  instagram_connect: "Instagram Connection",
  billing: "Billing & Subscriptions",
  campaigns: "Automations & Campaigns",
  products: "Digital Products / Sales",
  technical: "Technical Issue",
  other: "Other",
};

// ── Ticket detail ─────────────────────────────────────────────────────────────

function AdminTicketDetail({
  ticket,
  onBack,
  adminReply,
}: {
  ticket: { _id: string; subject: string; status: string; priority: string; category: string; description: string; referenceId?: string; replies?: Array<{ authorId: string; authorName: string; message: string; isAdmin: boolean; createdAt: string }>; createdAt: string; userName: string; userEmail: string };
  onBack: () => void;
  adminReply: (args: { ticketId: string; message: string; newStatus: TicketStatus }) => Promise<any>;
}) {
  const [replyText, setReplyText] = useState("");
  const [newStatus, setNewStatus] = useState<TicketStatus>(ticket.status as TicketStatus);
  const [sending, setSending] = useState(false);

  async function handleReply() {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      await adminReply({ ticketId: ticket._id, message: replyText.trim(), newStatus });
      setReplyText("");
      toast.success("Reply sent");
      onBack();
    } catch {
      toast.error("Failed to send reply");
    } finally {
      setSending(false);
    }
  }

  const statusCfg = STATUS_CONFIG[ticket.status as TicketStatus] ?? STATUS_CONFIG.open;
  const priorityCfg = PRIORITY_CONFIG[ticket.priority as keyof typeof PRIORITY_CONFIG] ?? PRIORITY_CONFIG.medium;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-1.5 rounded-md hover:bg-muted cursor-pointer">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-sm font-semibold">{ticket.subject}</h2>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <Badge className={cn("text-[10px] px-1.5 py-0", statusCfg.cls)}>{statusCfg.label}</Badge>
            <Badge className={cn("text-[10px] px-1.5 py-0", priorityCfg.cls)}>{priorityCfg.label}</Badge>
            <span className="text-[11px] text-muted-foreground">{CATEGORIES[ticket.category] ?? ticket.category}</span>
            {ticket.referenceId && <span className="text-[11px] text-muted-foreground">Ref: {ticket.referenceId}</span>}
          </div>
        </div>
      </div>

      {/* User info */}
      <Card>
        <CardContent className="pt-3 flex items-center gap-2">
          <User className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="text-xs font-medium">{ticket.userName}</p>
            <p className="text-[11px] text-muted-foreground">{ticket.userEmail}</p>
          </div>
          <span className="ml-auto text-[11px] text-muted-foreground">
            {format(new Date(ticket.createdAt), "dd MMM yyyy, hh:mm a")}
          </span>
        </CardContent>
      </Card>

      {/* Description */}
      <Card>
        <CardContent className="pt-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">Original message</p>
          <p className="text-sm whitespace-pre-wrap">{ticket.description}</p>
        </CardContent>
      </Card>

      {/* Thread */}
      {(ticket.replies ?? []).length > 0 && (
        <div className="space-y-2">
          {(ticket.replies ?? []).map((r, i) => (
            <div key={i} className={cn("rounded-lg border p-3", r.isAdmin ? "bg-primary/5 border-primary/20" : "bg-muted/30")}>
              <div className="flex items-center gap-2 mb-1">
                <span className={cn("text-xs font-medium", r.isAdmin ? "text-primary" : "")}>
                  {r.isAdmin ? "Support Team" : r.authorName}
                </span>
                {r.isAdmin && <Badge className="bg-primary/10 text-primary text-[9px] px-1 py-0">Staff</Badge>}
                <span className="ml-auto text-[11px] text-muted-foreground">
                  {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}
                </span>
              </div>
              <p className="text-xs whitespace-pre-wrap">{r.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Admin reply */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Reply & Update Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder="Write your reply to the merchant..."
            className="text-xs min-h-[80px] resize-none"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />
          <div className="flex items-center gap-3">
            <div className="space-y-1">
              <p className="text-[11px] text-muted-foreground">Update status to:</p>
              <Select value={newStatus} onValueChange={(v) => setNewStatus(v as TicketStatus)}>
                <SelectTrigger className="h-8 text-xs w-44"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                    <SelectItem key={k} value={k} className="text-xs">{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button size="sm" className="h-8 text-xs gap-1.5 mt-4" onClick={handleReply} disabled={!replyText.trim() || sending}>
              <Send className="w-3.5 h-3.5" /> {sending ? "Sending..." : "Send Reply"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Main admin tickets page ───────────────────────────────────────────────────

type EnrichedTicket = {
  _id: string;
  subject: string; status: string; priority: string; category: string;
  description: string; referenceId?: string;
  replies?: Array<{ authorId: string; authorName: string; message: string; isAdmin: boolean; createdAt: string }>;
  createdAt: string; updatedAt: string;
  userName: string; userEmail: string;
};

export default function AdminSupportPage() {
  const [statusFilter, setStatusFilter] = useState("open");
  const [selectedTicket, setSelectedTicket] = useState<EnrichedTicket | null>(null);

  const { tickets, loading, adminReply } = useAdminSupportTickets({
    status: statusFilter,
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
          <HeadphonesIcon className="w-4.5 h-4.5 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-bold">Support Tickets</h1>
          <p className="text-xs text-muted-foreground">Manage merchant support requests</p>
        </div>
      </div>

      {selectedTicket ? (
        <AdminTicketDetail ticket={selectedTicket} onBack={() => setSelectedTicket(null)} adminReply={adminReply as any} />
      ) : (
        <>
          {/* Filter tabs */}
          <div className="flex gap-1 flex-wrap">
            {[
              { value: "all", label: "All" },
              { value: "open", label: "Open" },
              { value: "in_progress", label: "In Progress" },
              { value: "waiting_on_user", label: "Awaiting Reply" },
              { value: "resolved", label: "Resolved" },
              { value: "closed", label: "Closed" },
            ].map((f) => (
              <button key={f.value} onClick={() => setStatusFilter(f.value)}
                className={cn(
                  "px-3 py-1.5 text-xs rounded-md font-medium transition-colors cursor-pointer",
                  statusFilter === f.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >{f.label}</button>
            ))}
          </div>

          {!tickets || loading ? (
            <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
          ) : tickets.length === 0 ? (
            <div className="py-16 text-center">
              <HeadphonesIcon className="w-10 h-10 mx-auto mb-3 text-muted-foreground/20" />
              <p className="text-sm text-muted-foreground">No tickets in this category</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tickets.map((t) => {
                const statusCfg = STATUS_CONFIG[t.status as TicketStatus] ?? STATUS_CONFIG.open;
                const priorityCfg = PRIORITY_CONFIG[t.priority as keyof typeof PRIORITY_CONFIG] ?? PRIORITY_CONFIG.medium;
                const replyCount = (t.replies ?? []).length;
                return (
                  <div key={t._id} className="border rounded-lg p-3 hover:bg-muted/20 cursor-pointer"
                    onClick={() => setSelectedTicket(t)}>
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate">{t.subject}</p>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <Badge className={cn("text-[10px] px-1.5 py-0", statusCfg.cls)}>{statusCfg.label}</Badge>
                          <Badge className={cn("text-[10px] px-1.5 py-0", priorityCfg.cls)}>{priorityCfg.label}</Badge>
                          <span className="text-[11px] text-muted-foreground">{CATEGORIES[t.category]}</span>
                          <span className="text-[11px] text-muted-foreground">· {t.userName}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-[11px] text-muted-foreground">
                          {formatDistanceToNow(new Date(t.createdAt), { addSuffix: true })}
                        </p>
                        {replyCount > 0 && (
                          <div className="flex items-center gap-1 justify-end mt-1 text-muted-foreground">
                            <MessageSquare className="w-3 h-3" />
                            <span className="text-[11px]">{replyCount}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
