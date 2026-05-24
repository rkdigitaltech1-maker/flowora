import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner.tsx";
import { useAuth } from "@/hooks/use-auth.ts";
import { toast } from "sonner";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        toast.success("Signed in successfully!");
        // Pass welcome=1 so dashboard shows the welcome modal
        const isNewUser = !localStorage.getItem("cs_onboarding_done");
        navigate(isNewUser ? "/dashboard?welcome=1" : "/dashboard", { replace: true });
      } else {
        // If loading finished and we are not authenticated, give a short grace period
        // for the PKCE code exchange to complete, then fall back to login.
        const timer = setTimeout(() => {
          toast.error("Failed to establish authentication session.");
          navigate("/login", { replace: true });
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [isLoading, isAuthenticated, navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-svh gap-4 bg-slate-50">
      <Spinner className="size-8 text-[#6c48ff]" />
      <p className="text-sm text-slate-500 font-medium">Completing secure sign-in...</p>
    </div>
  );
}
