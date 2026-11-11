import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { Navigate, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

type AuthState =
  | { status: "loading" }
  | { status: "signed-out"; reason?: "expired" }
  | { status: "signed-in"; session: Session; isAdmin: boolean; adminCheckFailed?: boolean };

type AuthContextValue = AuthState & {
  signOut: () => Promise<void>;
  recheckAdmin: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function checkAdmin(): Promise<{ isAdmin: boolean; failed: boolean }> {
  // Authorization is decided by the database (admin_users + is_admin()),
  // never by anything stored in the browser.
  const { data, error } = await supabase!.rpc("is_admin");
  if (error) return { isAdmin: false, failed: true };
  return { isAdmin: data === true, failed: false };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading" });
  const queryClient = useQueryClient();

  const applySession = useCallback(async (session: Session | null, expired = false) => {
    if (!session) {
      setState({ status: "signed-out", reason: expired ? "expired" : undefined });
      return;
    }
    const { isAdmin, failed } = await checkAdmin();
    setState({ status: "signed-in", session, isAdmin, adminCheckFailed: failed });
  }, []);

  useEffect(() => {
    if (!supabase) {
      setState({ status: "signed-out" });
      return;
    }
    let active = true;
    let hadSession = false;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      hadSession = !!data.session;
      void applySession(data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === "SIGNED_OUT") {
        queryClient.removeQueries({ queryKey: ["cms", "admin"] });
        setState({ status: "signed-out", reason: hadSession ? "expired" : undefined });
        hadSession = false;
        return;
      }
      if (
        event === "SIGNED_IN" ||
        event === "PASSWORD_RECOVERY" ||
        event === "TOKEN_REFRESHED" ||
        event === "USER_UPDATED"
      ) {
        const firstSignIn = !hadSession;
        hadSession = !!session;
        // Avoid re-checking on every silent token refresh.
        if (firstSignIn || event !== "TOKEN_REFRESHED") {
          // Defer: calling Supabase inside the callback can deadlock auth-js.
          setTimeout(() => void applySession(session), 0);
        }
      }
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [applySession, queryClient]);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    queryClient.removeQueries({ queryKey: ["cms", "admin"] });
    setState({ status: "signed-out" });
  }, [queryClient]);

  const recheckAdmin = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase.auth.getSession();
    await applySession(data.session);
  }, [applySession]);

  const value = useMemo(
    () => ({ ...state, signOut, recheckAdmin }),
    [state, signOut, recheckAdmin],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

export function FullScreenSpinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-cream text-sm text-muted-foreground">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-terracotta border-t-transparent" />
      {label}
    </div>
  );
}

/** Route guard: signed in AND listed as an admin in the database. */
export function RequireAdmin({
  children,
  notAuthorized,
}: {
  children: React.ReactNode;
  notAuthorized: React.ReactNode;
}) {
  const auth = useAuth();
  const location = useLocation();
  if (auth.status === "loading") return <FullScreenSpinner label="Checking your session…" />;
  if (auth.status === "signed-out") {
    const next = encodeURIComponent(location.pathname + location.search);
    const reason = auth.reason === "expired" ? "&expired=1" : "";
    return <Navigate to={`/admin/login?next=${next}${reason}`} replace />;
  }
  if (!auth.isAdmin) return <>{notAuthorized}</>;
  return <>{children}</>;
}
