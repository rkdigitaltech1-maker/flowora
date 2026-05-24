import { useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { toast } from "sonner";
import {
  Settings, Save, CheckCircle2, XCircle, Globe, Shield, ShieldCheck, Mail, HelpCircle
} from "lucide-react";

export default function AdminSettingsPage() {
  const [platformTitle, setPlatformTitle] = useState("Creator DM & Commerce");
  const [supportEmail, setSupportEmail] = useState("support@creatordm.com");
  const [betaInstagram, setBetaInstagram] = useState(true);
  const [betaCommerce, setBetaCommerce] = useState(true);
  const [betaAI, setBetaAI] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Platform settings saved successfully");
    }, 800);
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">Platform Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage global parameters, integration status, and feature flags.</p>
        </div>
      </div>

      {/* System configuration card */}
      <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="text-base font-bold">General Configuration</CardTitle>
          <CardDescription>Configure branding and communication details for the SaaS platform.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Platform Title</label>
              <Input
                value={platformTitle}
                onChange={(e) => setPlatformTitle(e.target.value)}
                placeholder="e.g. Creator DM"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Support Contact Email</label>
              <Input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                placeholder="e.g. support@company.com"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature flags & toggles */}
      <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="text-base font-bold">Feature Gates & Toggles</CardTitle>
          <CardDescription>Enable or disable major subsystems globally across all workspaces.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3.5">
            {[
              {
                id: "insta",
                title: "Instagram DM Automations",
                desc: "Allow creators to link Meta accounts and configure auto-replies.",
                checked: betaInstagram,
                onChange: setBetaInstagram,
              },
              {
                id: "commerce",
                title: "Digital Commerce Checkout",
                desc: "Enable checkout payment pages, product licensing, and digital downloads.",
                checked: betaCommerce,
                onChange: setBetaCommerce,
              },
              {
                id: "ai",
                title: "AI Auto-responder (Beta)",
                desc: "Expose AI prompt configuration and dynamic messaging answers to users.",
                checked: betaAI,
                onChange: setBetaAI,
              },
            ].map((f) => (
              <div key={f.id} className="flex items-start justify-between gap-4 p-3 bg-slate-50/50 dark:bg-slate-800/20 rounded-xl border border-slate-100 dark:border-slate-800/40">
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{f.title}</p>
                  <p className="text-xs text-slate-400 max-w-md">{f.desc}</p>
                </div>
                <button
                  onClick={() => f.onChange(!f.checked)}
                  className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                    f.checked ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      f.checked ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Integration connections status */}
      <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="text-base font-bold">External Integrations</CardTitle>
          <CardDescription>Verify link status and API connection health of third-party backends.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            { name: "Meta Graph API (Instagram)", desc: "Webhooks and message sending endpoints", ok: true },
            { name: "Stripe Payment Gateway", desc: "Digital product checkout and client billing payouts", ok: true },
            { name: "Supabase Postgres Backend", desc: "Database, auth, storage, and realtime services", ok: true },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{item.name}</p>
                <p className="text-xs text-slate-400">{item.desc}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-200 dark:border-emerald-800/40 text-[10px] gap-1 font-semibold">
                  <CheckCircle2 size={11} /> Connected
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="gap-2 px-6">
          <Save size={14} />
          {saving ? "Saving Changes..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
