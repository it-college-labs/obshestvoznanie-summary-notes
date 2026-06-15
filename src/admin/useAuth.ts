import { useEffect, useState } from "react";
import { api } from "../api/client";
import { login as loginApi, logout as logoutApi } from "../api/admin";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      await api.get<{ authenticated: boolean }>("/api/admin/me");
      setIsAuthenticated(true);
    } catch {
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (password: string) => {
    await loginApi(password);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await logoutApi();
    setIsAuthenticated(false);
  };

  return { isAuthenticated, loading, login, logout, checkAuth };
}
