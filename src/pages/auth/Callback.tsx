import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner.tsx";
import { useAuth } from "@/hooks/use-auth.ts";
import { supabase } from "@/lib/supabase.ts";
import { toast } from "sonner";

/**
 * Auth Callback — handles the OAuth redirect after Google sign-in.
 * 
 * Two scenarios:
 * 1. POPUP: Opened in a popup from login.tsx handleGoogleLogin()
 *    → Exchange the code, then close the popup (parent polls for session)
 * 2. REDIRECT: Full-page redirect (popup was blocked)
 *    → Exchange the code, then navigate to /welcome or /dashboard
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const [isPopup] = useState(() => {
    // Detect if we're inside a popup window
    try {
      return window.opener !== null && window.opener !== window;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    // If we're in a popup, wait for Supabase to exchange the code from the URL,
    // then close the popup so the parent window can detect the session.
    if (isPopup) {
      const closeTimer = window.setTimeout(() => {
        window.close();
      }, 5000);

      const finishPopupSignIn = async () => {
        try {
          await supabase.auth.getSessionFromUrl({ storeSession: true });
        } catch {
          // ignore if the session exchange is already handled automatically
        }

        const checkSession = window.setInterval(async () => {
          const { data } = await supabase.auth.getSession();
          if (data?.session) {
            window.clearInterval(checkSession);
            window.clearTimeout(closeTimer);

            if (window.opener && !window.opener.closed) {
              window.opener.postMessage({ type: "supabase-auth-success" }, "*");
            }

            // Small delay so the session gets persisted to localStorage
            window.setTimeout(() => {
              window.open("", "_self");
              window.close();
            }, 300);
          }
        }, 250);

        // If the popup still exists after 5s, try to close it explicitly anyway.
        return () => {
          window.clearInterval(checkSession);
          window.clearTimeout(closeTimer);
        };
      };

      finishPopupSignIn();
    }
  }, [isPopup]);

  // Full-page redirect flow (not in popup)
  useEffect(() => {
    if (isPopup) return; // Skip for popup context

    if (!isLoading) {
      if (isAuthenticated) {
        toast.success("Signed in successfully!");
        const isNewUser = !localStorage.getItem("cs_onboarding_done");
        navigate(isNewUser ? "/welcome" : "/dashboard", { replace: true });
      } else {
        // Give a grace period for the PKCE code exchange to complete
        const timer = setTimeout(() => {
          toast.error("Failed to establish authentication session.");
          navigate("/login", { replace: true });
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [isLoading, isAuthenticated, navigate, isPopup]);

  return (
    <div className="flex flex-col items-center justify-center h-svh gap-4 bg-slate-50">
      <Spinner className="size-8 text-[#6c48ff]" />
      <p className="text-sm text-slate-500 font-medium">
        {isPopup ? "Completing sign-in..." : "Completing secure sign-in..."}
      </p>
    </div>
  );
}
