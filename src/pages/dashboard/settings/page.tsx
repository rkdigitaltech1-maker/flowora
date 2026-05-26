import { Camera, CreditCard, KeyRound, MessageCircle, ShieldCheck, RefreshCw, Trash2, CheckCircle2, AlertTriangle, Loader2, ExternalLink, X, QrCode, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button.tsx";
import { useSettings } from "@/lib/supabase-hooks.ts";
import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";

export default function SettingsPage() {
  const {
    accounts,
    workspace,
    loading,
    createOAuthUrl
  } = useSettings();

  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [initialAccounts, setInitialAccounts] = useState<string[]>([]);
  const [countdown, setCountdown] = useState(300);
  const [oauthUrl, setOauthUrl] = useState("");

  const handleOpenConnectModal = () => {
    setInitialAccounts(accounts?.map((a: any) => a._id) || []);
    setCountdown(300);
    setIsConnectModalOpen(true);
  };

  useEffect(() => {
    if (isConnectModalOpen && workspace?.id) {
      createOAuthUrl({ state: `qr_conn:${workspace.id}` })
        .then((url) => setOauthUrl(url))
        .catch((err: any) => toast.error(err.message || "Failed to generate connection URL"));
    }
  }, [isConnectModalOpen, workspace?.id, createOAuthUrl]);

  useEffect(() => {
    if (!isConnectModalOpen || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isConnectModalOpen, countdown]);

  useEffect(() => {
    if (!isConnectModalOpen || !accounts) return;
    const newAccount = accounts.find((a: any) => !initialAccounts.includes(a._id));
    if (newAccount) {
      toast.success(`Successfully connected @${newAccount.username}!`);
      setIsConnectModalOpen(false);
    }
  }, [accounts, isConnectModalOpen, initialAccounts]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Settings</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-950">Workspace and integrations</h1>
        <p className="mt-1 text-sm text-slate-500">Manage connected accounts, billing, and workspace settings.</p>
      </div>

      <div className="mt-6 space-y-6">
        {/* Instagram Accounts */}
        <div className="rounded-2xl border border-[#dfdbea] bg-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Camera className="h-6 w-6 text-[#6d48ff]" />
              <div>
                <h2 className="font-semibold text-[#171126]">Instagram Accounts</h2>
                <p className="text-sm text-[#82799b]">Connect Instagram Business accounts for automation</p>
              </div>
            </div>
            <button
              onClick={handleOpenConnectModal}
              className="flex items-center gap-2 rounded-xl bg-[#6d48ff] px-4 py-2 text-sm font-semibold text-white hover:bg-[#5a3ae0]"
            >
              <ExternalLink className="h-4 w-4" />
              Connect Instagram
            </button>
          </div>

          {loading ? (
            <div className="mt-4 flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-[#6d48ff]" />
            </div>
          ) : accounts.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-[#dfdbea] p-8 text-center">
              <Camera className="mx-auto h-10 w-10 text-[#dfdbea]" />
              <p className="mt-2 text-sm text-[#82799b]">No Instagram accounts connected yet</p>
              <p className="text-xs text-[#82799b]">Connect to start building automation workflows</p>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {(accounts as any[]).map((acc: any) => (
                <InstagramAccountCard key={acc._id} account={acc} />
              ))}
            </div>
          )}
        </div>

        {/* Billing & Sandbox */}
        <BillingSection />

        {/* Other integrations */}
        <div className="grid gap-6 lg:grid-cols-2">
          {[
            {
              icon: MessageCircle,
              title: "WhatsApp Cloud API",
              status: "Coming soon",
              body: "Click-to-chat links and opt-in capture for WhatsApp follow-up sequences.",
              action: "Configure WhatsApp",
            },
            {
              icon: ShieldCheck,
              title: "Safety Controls",
              status: "Active",
              body: "DM rate limits, keyword blacklist, 24-hour messaging window enforcement.",
              action: "Configure Safety",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-[#dfdbea] bg-white p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <item.icon className="h-6 w-6 text-[#6d48ff]" />
                  <div>
                    <h3 className="font-semibold text-[#171126]">{item.title}</h3>
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                      {item.status}
                    </span>
                  </div>
                </div>
                <button className="rounded-xl bg-[#f4f1fb] px-3 py-1.5 text-sm font-medium text-[#6d48ff] hover:bg-[#e8e3f5]">
                  {item.action}
                </button>
              </div>
              <p className="mt-3 text-sm text-[#82799b]">{item.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Connect Instagram Modal Overlay */}
      {isConnectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl rounded-3xl border border-[#dfdbea] bg-white p-6 shadow-2xl animate-rise md:p-8">
            {/* Close button */}
            <button
              onClick={() => setIsConnectModalOpen(false)}
              className="absolute right-4 top-4 rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div>
              <span className="rounded-full bg-[#f0edf8] px-3 py-1 text-xs font-bold text-[#6d48ff]">
                Meta Authorization Flow
              </span>
              <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900">Connect Instagram Account</h2>
              <p className="mt-1 text-sm text-slate-500">
                Link your Instagram Business account to start building automation workflows and auto-responding to DMs.
              </p>
            </div>

            {/* Timer / Connection status banner */}
            <div className="mt-6 flex items-center justify-between rounded-2xl bg-[#f4f1fb] p-4 border border-[#e8e3f5]">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-[#6d48ff]" />
                <div>
                  <p className="text-sm font-bold text-slate-900">Waiting for connection...</p>
                  <p className="text-xs text-slate-500">Scan the QR code or click the direct button to link.</p>
                </div>
              </div>
              <div className="rounded-xl bg-slate-900 px-3 py-1.5 font-mono text-sm font-bold text-white">
                {formatTime(countdown)}
              </div>
            </div>

            {countdown <= 0 && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600 border border-red-100">
                <AlertTriangle className="h-4 w-4" />
                Connection session expired. Please close this modal and click Connect again.
              </div>
            )}

            {/* Connection methods */}
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {/* Method 1: QR Code Scan */}
              <div className="flex flex-col items-center rounded-2xl border border-dashed border-[#dfdbea] bg-[#fafbfc] p-6 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e7efff] text-blue-600">
                  <QrCode className="h-5 w-5" />
                </div>
                <h3 className="mt-3 text-sm font-bold text-slate-900">Option 1: Scan QR Code</h3>
                <p className="mt-1 text-xs text-slate-500 leading-normal">
                  Open your phone's camera, scan the code, and log in to Facebook to authorize.
                </p>
                
                <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                  {oauthUrl ? (
                    <QRCodeSVG value={oauthUrl} size={150} level="H" includeMargin={true} />
                  ) : (
                    <div className="flex h-[150px] w-[150px] items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
                    </div>
                  )}
                </div>
              </div>

              {/* Method 2: Direct Link */}
              <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fbe5ff] text-[#ec149e]">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-slate-900">Option 2: Connect Directly</h3>
                  <p className="mt-1 text-xs text-slate-500 leading-normal">
                    Click below to complete authorization using your current desktop browser session.
                  </p>
                </div>

                <div className="mt-6">
                  <a
                    href={oauthUrl || "#"}
                    onClick={(e) => {
                      if (!oauthUrl) e.preventDefault();
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#6d48ff] py-3 text-sm font-bold text-white hover:bg-[#5a3ae0] transition duration-200"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Connect Instagram
                  </a>
                  <p className="mt-2 text-center text-[10px] text-slate-400">
                    Requires logging in to Facebook.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Help notes */}
            <div className="mt-6 border-t border-slate-100 pt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">How it works</h4>
              <ol className="mt-2 list-decimal pl-4 text-xs text-slate-500 space-y-1">
                <li>Select the Facebook page connected to your Instagram Business account.</li>
                <li>Grant all requested permissions so the workflow engine can respond to messages.</li>
                <li>Once approved, the modal will automatically close.</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InstagramAccountCard({ account }: { account: any }) {
  const {
    removeAccount,
    refreshToken,
    validatePermissions,
    setupWebhook
  } = useSettings();

  const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    connected: { label: "Connected", color: "text-green-600 bg-green-50", icon: CheckCircle2 },
    needs_reauth: { label: "Reauth needed", color: "text-yellow-600 bg-yellow-50", icon: AlertTriangle },
    missing_permissions: { label: "Missing permissions", color: "text-red-600 bg-red-50", icon: AlertTriangle },
    webhook_error: { label: "Webhook error", color: "text-red-600 bg-red-50", icon: AlertTriangle },
    disabled: { label: "Disabled", color: "text-gray-500 bg-gray-100", icon: AlertTriangle },
  };

  const config = statusConfig[account.status] || statusConfig.disabled;
  const StatusIcon = config.icon;

  const handleReauth = async () => {
    const appId = import.meta.env.VITE_META_APP_ID;
    if (!appId) { toast.error("Missing VITE_META_APP_ID"); return; }

    const redirectUri =
      (import.meta.env.VITE_META_REDIRECT_URI as string | undefined) ??
      `${window.location.origin}/auth/meta/callback`;

    const state = `reauth:${Date.now()}`;

    const url = new URL("https://www.instagram.com/oauth/authorize");
    url.searchParams.set("force_reauth", "true");
    url.searchParams.set("client_id", appId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("state", state);
    url.searchParams.set("scope", "instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish,instagram_business_manage_insights");
    window.location.href = url.toString();
  };

  const handleRefresh = async () => {
    toast.promise(refreshToken({ accountId: account._id }), {
      loading: "Refreshing token...",
      success: "Token refreshed!",
      error: "Failed to refresh token",
    });
  };

  const handleValidatePermissions = async () => {
    const result = await validatePermissions({ accountId: account._id });
    if (result.valid) {
      toast.success("All permissions valid");
    } else {
      toast.error(`Missing: ${result.missing.join(", ")}`);
    }
  };

  const handleSetupWebhook = async () => {
    toast.promise(setupWebhook({ accountId: account._id }), {
      loading: "Setting up webhooks...",
      success: "Webhooks configured!",
      error: "Webhook setup failed",
    });
  };

  const tokenExpiring = account.tokenExpiresAt &&
    new Date(account.tokenExpiresAt).getTime() - Date.now() < 7 * 86400000;

  return (
    <div className="flex items-center justify-between rounded-xl border border-[#dfdbea] bg-white p-4">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-[#f0edf8]">
          <Camera className="h-5 w-5 text-[#6d48ff]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-[#171126]">{account.username}</span>
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${config.color}`}>
              <StatusIcon className="h-3 w-3" />
              {config.label}
            </span>
          </div>
          <p className="text-xs text-[#82799b]">
            ID: {account.instagramUserId?.slice(0, 12)}...
            {account.tokenExpiresAt && ` · Token expires ${new Date(account.tokenExpiresAt).toLocaleDateString()}`}
            {tokenExpiring && <span className="ml-1 text-yellow-600">(expiring soon)</span>}
          </p>
          {account.errorMessage && (
            <p className="mt-0.5 text-xs text-red-500">{account.errorMessage}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {account.status === "connected" && (
          <>
            <button onClick={handleRefresh} className="rounded-lg p-2 text-[#665d82] hover:bg-[#f4f1fb]" title="Refresh token">
              <RefreshCw className="h-4 w-4" />
            </button>
            <button onClick={handleValidatePermissions} className="rounded-lg p-2 text-[#665d82] hover:bg-[#f4f1fb]" title="Validate permissions">
              <ShieldCheck className="h-4 w-4" />
            </button>
            <button onClick={handleSetupWebhook} className="rounded-lg p-2 text-[#665d82] hover:bg-[#f4f1fb]" title="Setup webhooks">
              <KeyRound className="h-4 w-4" />
            </button>
          </>
        )}
        {account.status === "needs_reauth" && (
          <button onClick={handleReauth} className="rounded-lg bg-yellow-100 px-3 py-1.5 text-xs font-medium text-yellow-700 hover:bg-yellow-200">
            Reconnect
          </button>
        )}
        {account.status === "missing_permissions" && (
          <button onClick={handleReauth} className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200">
            Re-authorize
          </button>
        )}
        <button
          onClick={() => { removeAccount({ accountId: account._id }); toast.success("Account removed"); }}
          className="rounded-lg p-2 text-red-500 hover:bg-red-50"
          title="Remove account"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function BillingSection() {
  const { usage, loading, simulateUpgrade } = useSettings();

  if (loading || !usage) {
    return (
      <div className="rounded-2xl border border-[#dfdbea] bg-white p-6 flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-[#6d48ff]" />
      </div>
    );
  }

  const planName = {
    free: "Free",
    pro: "Pro Monthly",
    pro_annual: "Pro Annual",
    enterprise: "Enterprise",
  }[usage.plan as string] || "Free";

  const handleUpgrade = async (planKey: string) => {
    try {
      await simulateUpgrade({ plan: planKey as any });
      toast.success(`Plan updated to ${planKey} successfully!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update plan");
    }
  };

  const formatLimit = (limitVal: number) => {
    return limitVal >= 999999 ? "Unlimited" : limitVal.toLocaleString();
  };

  const dmsPercent = usage.limits.dmsPerMonth >= 999999 ? 100 : Math.min((usage.dmsThisMonth / usage.limits.dmsPerMonth) * 100, 100);
  const contactsPercent = usage.limits.contacts >= 999999 ? 100 : Math.min((usage.contactsTotal / usage.limits.contacts) * 100, 100);
  const workflowsPercent = usage.limits.workflows >= 999999 ? 100 : Math.min((usage.workflowsCount / usage.limits.workflows) * 100, 100);
  const productsPercent = usage.limits.products >= 999999 ? 100 : Math.min((usage.productsCount / usage.limits.products) * 100, 100);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#dfdbea] bg-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CreditCard className="h-6 w-6 text-[#6d48ff]" />
            <div>
              <h2 className="font-semibold text-[#171126]">Billing & Plan</h2>
              <p className="text-sm text-[#82799b]">Manage your subscription and usage</p>
            </div>
          </div>
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-[#6d48ff]">
            {planName} Plan
          </span>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-[#dfdbea] p-4 bg-slate-50/50">
            <p className="text-xs font-medium text-[#82799b]">DMs / month</p>
            <p className="mt-1 text-2xl font-bold text-[#171126]">
              {usage.dmsThisMonth.toLocaleString()} <span className="text-xs font-normal text-slate-400">/ {formatLimit(usage.limits.dmsPerMonth)}</span>
            </p>
            <div className="mt-2 h-1.5 rounded-full bg-[#e6e2ee] overflow-hidden">
              <div 
                className="h-1.5 rounded-full bg-indigo-600 transition-all duration-500" 
                style={{ width: `${dmsPercent}%` }} 
              />
            </div>
          </div>
          <div className="rounded-xl border border-[#dfdbea] p-4 bg-slate-50/50">
            <p className="text-xs font-medium text-[#82799b]">Contacts</p>
            <p className="mt-1 text-2xl font-bold text-[#171126]">
              {usage.contactsTotal.toLocaleString()} <span className="text-xs font-normal text-slate-400">/ {formatLimit(usage.limits.contacts)}</span>
            </p>
            <div className="mt-2 h-1.5 rounded-full bg-[#e6e2ee] overflow-hidden">
              <div 
                className="h-1.5 rounded-full bg-emerald-500 transition-all duration-500" 
                style={{ width: `${contactsPercent}%` }} 
              />
            </div>
          </div>
          <div className="rounded-xl border border-[#dfdbea] p-4 bg-slate-50/50">
            <p className="text-xs font-medium text-[#82799b]">Workflows</p>
            <p className="mt-1 text-2xl font-bold text-[#171126]">
              {usage.workflowsCount.toLocaleString()} <span className="text-xs font-normal text-slate-400">/ {formatLimit(usage.limits.workflows)}</span>
            </p>
            <div className="mt-2 h-1.5 rounded-full bg-[#e6e2ee] overflow-hidden">
              <div 
                className="h-1.5 rounded-full bg-cyan-500 transition-all duration-500" 
                style={{ width: `${workflowsPercent}%` }} 
              />
            </div>
          </div>
          <div className="rounded-xl border border-[#dfdbea] p-4 bg-slate-50/50">
            <p className="text-xs font-medium text-[#82799b]">Products</p>
            <p className="mt-1 text-2xl font-bold text-[#171126]">
              {usage.productsCount.toLocaleString()} <span className="text-xs font-normal text-slate-400">/ {formatLimit(usage.limits.products)}</span>
            </p>
            <div className="mt-2 h-1.5 rounded-full bg-[#e6e2ee] overflow-hidden">
              <div 
                className="h-1.5 rounded-full bg-rose-500 transition-all duration-500" 
                style={{ width: `${productsPercent}%` }} 
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="https://linkplease.co/pricing"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl border border-[#dfdbea] px-4 py-2.5 text-sm font-medium text-[#665d82] hover:bg-[#f4f1fb] transition"
          >
            <ExternalLink className="h-4 w-4" />
            View Pricing Details
          </a>
        </div>
      </div>

      <SandboxUpgradeSection currentPlan={usage.plan} onUpgrade={handleUpgrade} />
    </div>
  );
}

function SandboxUpgradeSection({ currentPlan, onUpgrade }: { currentPlan: string; onUpgrade: (plan: string) => void }) {
  const plans = [
    { key: "free", name: "Free Plan", price: "$0", desc: "1,000 monthly DMs, 1,000 contacts, unlimited workflows" },
    { key: "pro", name: "Pro Monthly", price: "$14.90", desc: "Unlimited DMs & contacts, story automation, AI reply" },
    { key: "pro_annual", name: "Pro Annual", price: "$9.99/mo", desc: "Billed annually ($119.88/yr), unlimited access" },
    { key: "enterprise", name: "Enterprise", price: "Custom", desc: "Custom features, dedicated account manager, WhatsApp" },
  ];

  return (
    <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50/30 p-6">
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-6 w-6 text-amber-600" />
        <div>
          <h2 className="font-semibold text-slate-900 flex items-center gap-2">
            Developer Sandbox Upgrades
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 uppercase tracking-wider">
              Local Dev Only
            </span>
          </h2>
          <p className="text-sm text-slate-500">Test dashboard quotas and limits instantly by switching plans.</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((p) => {
          const isActive = currentPlan === p.key;
          return (
            <button
              key={p.key}
              onClick={() => onUpgrade(p.key)}
              className={`flex flex-col justify-between rounded-xl border p-4 text-left transition duration-200 ${
                isActive
                  ? "border-amber-500 bg-amber-50 shadow-sm ring-1 ring-amber-500"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{p.name}</span>
                <p className="mt-1 text-lg font-black text-slate-900">{p.price}</p>
                <p className="mt-1.5 text-xs text-slate-500 leading-normal">{p.desc}</p>
              </div>
              <span
                className={`mt-4 inline-flex w-max items-center justify-center rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                  isActive
                    ? "bg-amber-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {isActive ? "Active Plan" : "Select Plan"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
