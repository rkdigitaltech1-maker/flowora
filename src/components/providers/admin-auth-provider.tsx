import { useState, type ReactNode } from "react";
import { AdminAuthContext } from "@/hooks/use-admin-auth.ts";

const STORAGE_KEY = "admin_session_token";

export default function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    return sessionStorage.getItem(STORAGE_KEY);
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return Boolean(sessionStorage.getItem(STORAGE_KEY));
  });

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Standard default credentials or custom credentials check
    const expectedUsername = "admin";
    const expectedPassword = "admin";

    if (username === expectedUsername && password === expectedPassword) {
      const sessionToken = "admin_session_" + Math.random().toString(36).substring(2);
      sessionStorage.setItem(STORAGE_KEY, sessionToken);
      setToken(sessionToken);
      setIsAuthenticated(true);
      return { success: true };
    }
    return { success: false, error: "Invalid username or password." };
  };

  const logout = async (): Promise<void> => {
    sessionStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setIsAuthenticated(false);
  };

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, token, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

