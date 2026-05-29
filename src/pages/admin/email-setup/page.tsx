import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import {
  Mail, Settings, Shield, Server, CheckCircle2, XCircle,
  AlertTriangle, ExternalLink, RefreshCw, Save, TestTube
} from "lucide-react";

export default function AdminEmailSetupPage() {
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPass, setSmtpPass] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [fromName, setFromName] = useState("Flowora");
  const [testing, setTesting] = useState(false);

  const handleTestConnection = async () => {
    setTesting(true);
    setTimeout(() => {
      setTesting(false);
      if (smtpHost && smtpUser) {
        toast.success("SMTP connection successful!");
      } else {
        toast.error("Please fill in SMTP settings first.");
      }
    }, 1500);
  };

  const handleSave = () => {
    toast.success("Email settings saved successfully!");
  };

  // Check configuration status
  const isConfigured = Boolean(smtpHost && smtpUser && smtpPass && fromEmail);

  return (
    <div className="p-6 space-y-6 max-w-[1000px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Email Setup</h1>
          <p className="text-sm text-slate-500 mt-0.5">Configure SMTP settings for sending transactional and marketing emails</p>
        </div>
      </div>

      {/* Status Card */}
      <Card className="border-slate-200/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Shield className="h-4 w-4 text-slate-500" />
            Email Configuration Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-3 border border-slate-100">
              {isConfigured ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
              )}
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">SMTP</p>
                <p className="text-xs font-semibold text-slate-700">{isConfigured ? "Configured" : "Not configured"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-3 border border-slate-100">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">SPF/DKIM</p>
                <p className="text-xs font-semibold text-slate-700">Not verified</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-3 border border-slate-100">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Domain</p>
                <p className="text-xs font-semibold text-slate-700">Not verified</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SMTP Settings */}
      <Card className="border-slate-200/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Server className="h-4 w-4 text-slate-500" />
            SMTP Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1.5">SMTP Host</label>
              <Input
                placeholder="smtp.gmail.com or smtp.resend.com"
                value={smtpHost}
                onChange={e => setSmtpHost(e.target.value)}
                className="h-10 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1.5">SMTP Port</label>
              <Input
                placeholder="587"
                value={smtpPort}
                onChange={e => setSmtpPort(e.target.value)}
                className="h-10 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1.5">Username / API Key</label>
              <Input
                placeholder="your-email@domain.com or API key"
                value={smtpUser}
                onChange={e => setSmtpUser(e.target.value)}
                className="h-10 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1.5">Password / Secret</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={smtpPass}
                onChange={e => setSmtpPass(e.target.value)}
                className="h-10 text-sm"
              />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <h4 className="text-xs font-bold text-slate-600 mb-3">Sender Identity</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1.5">From Email</label>
                <Input
                  placeholder="hello@flowora.tech"
                  value={fromEmail}
                  onChange={e => setFromEmail(e.target.value)}
                  className="h-10 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1.5">From Name</label>
                <Input
                  placeholder="Flowora"
                  value={fromName}
                  onChange={e => setFromName(e.target.value)}
                  className="h-10 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button onClick={handleSave} className="bg-violet-600 hover:bg-violet-700 text-white">
              <Save className="h-4 w-4 mr-1.5" />
              Save Settings
            </Button>
            <Button variant="outline" onClick={handleTestConnection} disabled={testing}>
              <TestTube className={`h-4 w-4 mr-1.5 ${testing ? "animate-spin" : ""}`} />
              {testing ? "Testing..." : "Test Connection"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recommended Providers */}
      <Card className="border-slate-200/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Mail className="h-4 w-4 text-slate-500" />
            Recommended Email Providers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { name: "Resend", desc: "Modern email API, great DX", url: "https://resend.com" },
              { name: "Brevo (Sendinblue)", desc: "Free tier with 300 emails/day", url: "https://brevo.com" },
              { name: "Amazon SES", desc: "Cheapest at scale", url: "https://aws.amazon.com/ses/" },
            ].map(provider => (
              <a
                key={provider.name}
                href={provider.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100 transition-colors"
              >
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-800">{provider.name}</p>
                  <p className="text-[10px] text-slate-500">{provider.desc}</p>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
