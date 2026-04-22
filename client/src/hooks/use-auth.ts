import { useEffect, useState, useCallback } from "react";

export type AuthRole = "admin" | "user";

export interface AuthState {
  user: any | null;
  loading: boolean;
  role: AuthRole | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    role: null,
    isAuthenticated: false,
    isAdmin: false,
  });

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setState((prev) => ({ ...prev, loading: false }));
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error();

      const user = await res.json();

      setState({
        user,
        loading: false,
        role: user.role,
        isAuthenticated: true,
        isAdmin: user.role === "admin",
      });
    } catch {
      localStorage.removeItem("token");
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    checkAuth();

    window.addEventListener("storage", checkAuth);

    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  const signOut = async () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const checkAuth = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setState({
        user: null,
        loading: false,
        role: null,
        isAuthenticated: false,
        isAdmin: false,
      });
      return;
    }

    try {
      const decoded: any = JSON.parse(atob(token.split(".")[1]));

      setState({
        user: decoded,
        loading: false,
        role: decoded.role,
        isAuthenticated: true,
        isAdmin: decoded.role === "admin",
      });
    } catch {
      setState({
        user: null,
        loading: false,
        role: null,
        isAuthenticated: false,
        isAdmin: false,
      });
    }
  };
  return { ...state, signOut };
}