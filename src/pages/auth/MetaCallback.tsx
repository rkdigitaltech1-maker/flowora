import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, TriangleAlert, Loader2, ArrowRight, RefreshCw } from "lucide-react";
import { exchangeMetaCode, selectMetaPage, setupWebhookSubscriptions } from "@/lib/supabase-hooks.ts";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function MetaCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const code = searchParams.get("code");
  const error = searchParams.get("error_message") ?? searchParams.get("error");
  const state = searchParams.get("state");

  const exchangeCode = exchangeMetaCode;
  const [status, setStatus] = useState<"exchanging" | "needs_page" | "done" | "error">(
    code ? "exchanging" : "error"
  );
  const [pages, setPages] = useState<any[]>([]);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!code) return;

    // Use state if available, otherwise generate a fallback
    const effectiveState = state || `fallback:${Date.now()}`;

    exchangeCode({ code, state: effectiveState })
      .then((result) => {
        setAccountId(result.accountId);
        if (result.pages && result.pages.length > 0) {
          setPages(result.pages);
          setStatus("needs_page");
        } else {
          setStatus("done");
          toast.success("Instagram account connected!");
          // Auto-redirect to onboarding or dashboard
          setTimeout(() => {
            const onboardingDone = localStorage.getItem("cs_onboarding_done");
            if (!onboardingDone) {
              navigate("/onboarding", { replace: true });
            } else {
              navigate("/dashboard/settings", { replace: true });
            }
          }, 1500);
        }
      })
      .catch((err) => {
        setErrorMsg(err.message || "Failed to exchange authorization code");
        setStatus("error");
      });
  }, [code, state]);

  if (!code && !error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8fb] px-4">
        <section className="w-full max-w-xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <TriangleAlert className="h-8 w-8 text-amber-500" />
          <h1 className="mt-3 text-xl font-semibold text-slate-950">No authorization code received</h1>
          <p className="mt-1 text-sm text-slate-500">Meta did not return an authorization code. Please try again.</p>
          <Link to="/dashboard/settings" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white">
            Back to settings
          </Link>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8fb] px-4">
        <section className="w-full max-w-xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <TriangleAlert className="h-8 w-8 text-red-500" />
          <h1 className="mt-3 text-xl font-semibold text-slate-950">Authorization failed</h1>
          <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-800">{error}</div>
          <Link to="/dashboard/settings" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white">
            Try again
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8fb] px-4">
      <section className="w-full max-w-xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        {status === "exchanging" && (
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#6d48ff]" />
            <h1 className="mt-3 text-xl font-semibold text-slate-950">Connecting Instagram...</h1>
            <p className="mt-1 text-sm text-slate-500">Exchanging authorization code and fetching your pages.</p>
          </div>
        )}

        {status === "needs_page" && (
          <PageSelector
            pages={pages}
            accountId={accountId!}
            onDone={() => {
              setStatus("done");
              toast.success("Instagram account connected!");
              setTimeout(() => {
                const onboardingDone = localStorage.getItem("cs_onboarding_done");
                if (!onboardingDone) {
                  navigate("/onboarding", { replace: true });
                } else {
                  navigate("/dashboard/settings", { replace: true });
                }
              }, 1500);
            }}
            onError={(msg) => { setErrorMsg(msg); setStatus("error"); }}
          />
        )}

        {status === "done" && (
          <div className="text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
            <h1 className="mt-3 text-xl font-semibold text-slate-950">Instagram connected!</h1>
            <p className="mt-1 text-sm text-slate-500">Redirecting you to complete setup...</p>
          </div>
        )}

        {status === "error" && (
          <div>
            <TriangleAlert className="h-8 w-8 text-red-500" />
            <h1 className="mt-3 text-xl font-semibold text-slate-950">Connection failed</h1>
            <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-800">{errorMsg}</div>
            <button
              onClick={() => navigate("/dashboard/settings")}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

function PageSelector({
  pages,
  accountId,
  onDone,
  onError,
}: {
  pages: any[];
  accountId: string;
  onDone: () => void;
  onError: (msg: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const selectPage = selectMetaPage;
  const setupWebhook = setupWebhookSubscriptions;


  const handleConnect = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      const page = pages.find((p) => p.pageId === selected);
      if (!page) return;

      if (page.instagramBusinessAccountId) {
        await selectPage({
          accountId: accountId as any,
          pageId: page.pageId,
          instagramBusinessAccountId: page.instagramBusinessAccountId,
          username: page.instagramUsername || page.pageName,
        });
      }

      try {
        await setupWebhook({ accountId: accountId as any });
      } catch { }

      onDone();
    } catch (err: any) {
      onError(err.message || "Failed to connect page");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-950">Select Facebook Page</h1>
      <p className="mt-1 text-sm text-slate-500">Choose which Facebook page's Instagram account to connect.</p>

      <div className="mt-4 space-y-2">
        {pages.map((page) => (
          <button
            key={page.pageId}
            onClick={() => setSelected(page.pageId)}
            className={`w-full rounded-lg border p-3 text-left text-sm transition-colors ${
              selected === page.pageId
                ? "border-[#6d48ff] bg-[#f0edf8]"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="font-medium text-slate-900">{page.pageName}</div>
            {page.instagramBusinessAccountId ? (
              <div className="mt-0.5 text-xs text-green-600">✓ Instagram Business account connected</div>
            ) : (
              <div className="mt-0.5 text-xs text-amber-600">No Instagram Business account linked to this page</div>
            )}
          </button>
        ))}
      </div>

      {selected && (
        <button
          onClick={handleConnect}
          disabled={loading}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#6d48ff] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#5a3ae0] disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          {loading ? "Connecting..." : "Connect Instagram"}
        </button>
      )}
    </div>
  );
}
