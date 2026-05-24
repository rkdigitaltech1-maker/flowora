import { createContext, useContext } from "react";

export type AdminAuthContextType = {
  isAuthenticated: boolean;
  token: string | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
};

export const AdminAuthContext = createContext<AdminAuthContextType>({
  isAuthenticated: false,
  token: null,
  login: async () => ({ success: false }),
  logout: async () => {},
});

export const useAdminAuth = () => useContext(AdminAuthContext);
