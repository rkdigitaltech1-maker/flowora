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
      // Supabase's detectSessionInUrl:true will auto-exchange the code.
      // We just need to wait a moment for that to complete, then close.
      const closeTimer = setTimeout(() => {
        window.close();
      }, 1500);

      // Also close immediately once we detect the session is ready
      const checkSession = setInterval(async () => {
        const { data } = await supabase.auth.getSession();
        if (data?.session) {
          clearInterval(checkSession);
          clearTimeout(closeTimer);
          // Small delay so the session gets persisted to localStorage
          setTimeout(() => window.close(), 300);
        }
      }, 200);

      return () => {
        clearInterval(checkSession);
        clearTimeout(closeTimer);
      };
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
