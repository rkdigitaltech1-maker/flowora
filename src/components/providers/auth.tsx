import React, { createContext, useState, useEffect } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase.ts";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: { id: string; profile: { name: string | null; email: string | null; photoURL: string | null } } | null;
  session: Session | null;
  signinRedirect: () => Promise<void>;
  removeUser: () => Promise<void>;
  error: any;
  // kept for backward compat with admin flow
  firebaseUser: null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Local mock auth for demo accounts (admin demo, creator demo)
  const [localAuth, setLocalAuth] = useState<boolean>(() => {
    return localStorage.getItem("local_auth_authenticated") === "true";
  });

  useEffect(() => {
    // Get current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setSupabaseUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth state changes (sign-in, sign-out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setSupabaseUser(session?.user ?? null);
      setIsLoading(false);

      if (session?.user) {
        // Mark local storage so legacy checks still pass
        localStorage.setItem("local_auth_authenticated", "true");
        setLocalAuth(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const isAuthenticated = !!supabaseUser || localAuth;

  const user = supabaseUser
    ? {
        id: supabaseUser.id,
        profile: {
          name: supabaseUser.user_metadata?.full_name ?? supabaseUser.user_metadata?.name ?? null,
          email: supabaseUser.email ?? null,
          photoURL: supabaseUser.user_metadata?.avatar_url ?? null,
        },
      }
    : localAuth
    ? { id: "local", profile: { name: "Local Creator", email: "creator@local.dev", photoURL: null } }
    : null;

  // Fallback: mock sign-in for demo accounts (called from login page on email submit)
  const signinRedirect = async () => {
    localStorage.setItem("local_auth_authenticated", "true");
    setLocalAuth(true);
    window.location.href = "/dashboard";
  };

  const removeUser = async () => {
    if (supabaseUser) {
      await supabase.auth.signOut();
    }
    localStorage.setItem("local_auth_authenticated", "false");
    setLocalAuth(false);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        session,
        signinRedirect,
        removeUser,
        error: null,
        firebaseUser: null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
