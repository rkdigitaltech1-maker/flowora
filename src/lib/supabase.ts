import { createClient } from "@supabase/supabase-js";
import type { Database } from "./supabase-types.ts";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

console.log("Supabase Env Debug:", {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? "EXISTS" : "MISSING",
  supabaseUrl,
  supabaseAnonKey: supabaseAnonKey ? "EXISTS" : "MISSING"
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "⚠️ Supabase is not configured yet.\n" +
    "Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env.local file.\n" +
    "Get these from: https://supabase.com/dashboard → Project Settings → API"
  );
}

export const supabase = createClient<Database>(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key",
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);

export default supabase;
