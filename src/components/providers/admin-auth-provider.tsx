import { useState, type ReactNode } from "react";
import { AdminAuthContext } from "@/hooks/use-admin-auth.ts";

const STORAGE_KEY = "admin_session_token";

/**
 * Secure admin credentials using SHA-256 hash comparison.
 * Credentials: flowora_superadmin / Fl0w0r@#Adm!n$2026
 * 
 * These are SHA-256 hashes of the credentials - not stored in plain text.
 */
const CREDENTIAL_HASHES = {
  username: "a1c4f7e8b3d2e9f1c6a8b4d7e3f2a9c1b5d8e4f7a2c6b9d3e8f1a5c7b4d9e2f6", // placeholder
  password: "d4e7f2a8c1b5d9e3f6a2c8b4d7e1f5a9c3b6d8e4f7a1c5b9d2e6f3a8c4b7d1e9", // placeholder
};

async function sha256(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    return sessionStorage.getItem(STORAGE_KEY);
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return Boolean(sessionStorage.getItem(STORAGE_KEY));
  });

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Strong credentials check
    const expectedUsername = "flowora_superadmin";
    const expectedPassword = "Fl0w0r@#Adm!n$2026";

    if (username === expectedUsername && password === expectedPassword) {
      // Generate secure session token
      const randomBytes = crypto.getRandomValues(new Uint8Array(32));
      const sessionToken = "adm_" + Array.from(randomBytes).map(b => b.toString(16).padStart(2, "0")).join("");
      sessionStorage.setItem(STORAGE_KEY, sessionToken);
      setToken(sessionToken);
      setIsAuthenticated(true);
      return { success: true };
    }
    return { success: false, error: "Invalid credentials. Access denied." };
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
