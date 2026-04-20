import { useEffect, useState, useCallback } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AuthRole = "admin" | "user";

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  role: AuthRole | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    role: null,
    isAuthenticated: false,
    isAdmin: false,
  });

  const fetchRole = useCallback(async (userId: string): Promise<AuthRole | null> => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .order("role", { ascending: true });
    if (!data || data.length === 0) return null;
    if (data.some((r) => r.role === "admin")) return "admin";
    return "user";
  }, []);

  useEffect(() => {
    // Set up listener FIRST
    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setState((prev) => ({
          ...prev,
          session,
          user: session?.user ?? null,
          isAuthenticated: !!session,
        }));
        if (session?.user) {
          // Defer role fetch to avoid deadlock
          setTimeout(() => {
            fetchRole(session.user.id).then((role) => {
              setState((prev) => ({
                ...prev,
                role,
                isAdmin: role === "admin",
                loading: false,
              }));
            });
          }, 0);
        } else {
          setState((prev) => ({
            ...prev,
            role: null,
            isAdmin: false,
            loading: false,
          }));
        }
      },
    );

    // THEN check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setState((prev) => ({
          ...prev,
          session,
          user: session.user,
          isAuthenticated: true,
        }));
        fetchRole(session.user.id).then((role) => {
          setState((prev) => ({
            ...prev,
            role,
            isAdmin: role === "admin",
            loading: false,
          }));
        });
      } else {
        setState((prev) => ({ ...prev, loading: false }));
      }
    });

    return () => subscription.subscription.unsubscribe();
  }, [fetchRole]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return { ...state, signOut };
}
