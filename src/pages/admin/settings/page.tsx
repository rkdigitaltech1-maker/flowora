import { useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { toast } from "sonner";
import {
  Settings, Save, CheckCircle2, Globe, Shield, ShieldCheck, Mail, Key, Database, Server
} from "lucide-react";

export default function AdminSettingsPage() {
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Settings saved successfully");
    }, 800);
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">Platform Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">System configuration and integrations status.</p>
        </div>
      </div>

      {/* Integration Status */}
      <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Server className="w-4 h-4 text-blue-500" />
            Integration Status
          </CardTitle>
          <CardDescription>Current connection status of all platform integrations.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatusItem label="Supabase Database" status="connected" />
            <StatusItem label="Meta/Instagram API" status="connected" />
            <StatusItem label="Google OAuth" status="connected" />
            <StatusItem label="Stripe Payments" status="pending" />
            <StatusItem label="Email Service (Resend)" status="pending" />
            <StatusItem label="Webhook Delivery" status="connected" />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Shield className="w-4 h-4 text-red-500" />
            Security Configuration
          </CardTitle>
          <CardDescription>Admin access and security parameters.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Admin Panel URL</label>
              <Input value="/_sys/ctrl-panel" disabled className="font-mono text-xs bg-slate-50" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Session Storage</label>
              <Input value="sessionStorage (browser tab only)" disabled className="text-xs bg-slate-50" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Auth Method</label>
              <Input value="Username + Password (hashed)" disabled className="text-xs bg-slate-50" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">/admin Route</label>
              <div className="flex items-center gap-2">
                <Input value="Returns 404 (hidden)" disabled className="text-xs bg-slate-50" />
                <Badge className="bg-green-100 text-green-700 text-[9px]">Secure</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Platform Info */}
      <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Database className="w-4 h-4 text-purple-500" />
            Platform Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Platform Name</label>
              <Input value="Flowora" disabled className="text-xs bg-slate-50" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Domain</label>
              <Input value="flowora.tech" disabled className="text-xs bg-slate-50" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Supabase Project</label>
              <Input value="dbksekhsnerhkmqoxcrq" disabled className="font-mono text-xs bg-slate-50" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Hosting</label>
              <Input value="Vercel (Auto-deploy on push)" disabled className="text-xs bg-slate-50" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Flags */}
      <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Key className="w-4 h-4 text-amber-500" />
            Feature Flags
          </CardTitle>
          <CardDescription>Toggle features across the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <FeatureFlag label="Instagram DM Automation" enabled={true} />
            <FeatureFlag label="Story Reply Automation" enabled={true} />
            <FeatureFlag label="Lead Collection Forms" enabled={true} />
            <FeatureFlag label="Digital Product Store" enabled={true} />
            <FeatureFlag label="AI-Powered Replies" enabled={false} />
            <FeatureFlag label="Multi-Account Support" enabled={true} />
            <FeatureFlag label="Stripe Checkout" enabled={false} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusItem({ label, status }: { label: string; status: "connected" | "pending" | "error" }) {
  const config = {
    connected: { badge: "Connected", cls: "bg-green-100 text-green-700", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
    pending: { badge: "Not Configured", cls: "bg-amber-100 text-amber-700", icon: <Globe className="w-3.5 h-3.5" /> },
    error: { badge: "Error", cls: "bg-red-100 text-red-700", icon: <Shield className="w-3.5 h-3.5" /> },
  };
  const c = config[status];
  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{label}</span>
      <Badge className={`${c.cls} text-[9px] gap-1`}>
        {c.icon} {c.badge}
      </Badge>
    </div>
  );
}

function FeatureFlag({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{label}</span>
      <Badge className={`text-[9px] ${enabled ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-500"}`}>
        {enabled ? "Enabled" : "Disabled"}
      </Badge>
    </div>
  );
}
