/**
 * Referral Link Landing Page
 * Route: /ref/:code
 * Handles affiliate link clicks - tracks the click, sets cookie, redirects to signup
 */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { processReferralVisit } from "@/lib/affiliate-api.ts";
import { motion } from "motion/react";
import { Gift, Loader2 } from "lucide-react";

export default function ReferralRedirectPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "valid" | "invalid">("loading");

  useEffect(() => {
    async function handleReferral() {
      if (!code) {
        setStatus("invalid");
        setTimeout(() => navigate("/"), 2000);
        return;
      }

      const result = await processReferralVisit(code);
      
      if (result.valid) {
        setStatus("valid");
        // Redirect to signup after brief pause
        setTimeout(() => navigate("/login?ref=" + code), 1500);
      } else {
        setStatus("invalid");
        setTimeout(() => navigate("/"), 2000);
      }
    }

    handleReferral();
  }, [code, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-sm"
      >
        {status === "loading" && (
          <>
            <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800">Processing referral...</h2>
            <p className="text-gray-500 text-sm mt-2">Redirecting you to Flowora</p>
          </>
        )}
        {status === "valid" && (
          <>
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Welcome!</h2>
            <p className="text-gray-500 text-sm mt-2">
              You were referred by a friend. Redirecting to sign up...
            </p>
          </>
        )}
        {status === "invalid" && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Invalid Referral Link</h2>
            <p className="text-gray-500 text-sm mt-2">
              This referral link is no longer valid. Redirecting to homepage...
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}
