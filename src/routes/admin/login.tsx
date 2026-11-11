import { useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/admin/ui";
import { FullScreenSpinner, useAuth } from "@/components/admin/auth";
import { requireSupabase } from "@/lib/supabase/client";
import { useSiteSettings } from "@/lib/cms/public";

function safeNext(raw: string | null) {
  // Only allow internal admin paths (prevents open redirects).
  if (raw && raw.startsWith("/admin") && !raw.startsWith("//")) return raw;
  return "/admin";
}

export default function LoginPage() {
  const auth = useAuth();
  const { general } = useSiteSettings();
  const [params] = useSearchParams();
  const next = safeNext(params.get("next"));
  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(
    params.get("expired") ? "Your session has ended. Please sign in again." : null,
  );
  const [notice, setNotice] = useState<string | null>(null);

  if (auth.status === "loading") return <FullScreenSpinner />;
  if (auth.status === "signed-in") return <Navigate to={next} replace />;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (!email.trim()) return setError("Enter your email address.");
    setBusy(true);
    try {
      const sb = requireSupabase();
      if (mode === "login") {
        if (!password) return setError("Enter your password.");
        const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
        if (error) {
          if (/invalid login credentials/i.test(error.message))
            setError("Incorrect email or password.");
          else if (/email not confirmed/i.test(error.message))
            setError("This email address hasn't been confirmed yet.");
          else if (error.status === 429)
            setError("Too many attempts. Wait a minute and try again.");
          else setError("Couldn't sign in. Check your connection and try again.");
        }
      } else {
        const { error } = await sb.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/admin/reset-password`,
        });
        if (error && error.status === 429) setError("Too many requests. Try again later.");
        else setNotice("If an account exists for that email, a password reset link is on its way.");
      }
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream p-6 font-sans">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <img
            src={general.logoUrl}
            alt={general.siteName}
            className="h-14 w-auto object-contain"
          />
          <h1 className="mt-6 font-display text-3xl text-ink">
            {mode === "login" ? "Welcome back" : "Reset password"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "login"
              ? "Sign in to manage your website."
              : "We'll email you a link to choose a new password."}
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.18)]"
          noValidate
        >
          <FormField label="Email" htmlFor="email">
            <Input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
          </FormField>
          {mode === "login" && (
            <FormField label="Password" htmlFor="password">
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormField>
          )}

          {error && (
            <p
              className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
              role="alert"
            >
              {error}
            </p>
          )}
          {notice && (
            <p className="rounded-md bg-forest/10 px-3 py-2 text-sm text-forest" role="status">
              {notice}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={busy}>
            {busy && <Loader2 className="animate-spin" />}
            {mode === "login" ? "Sign in" : "Send reset link"}
          </Button>

          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "forgot" : "login");
              setError(null);
              setNotice(null);
            }}
            className="block w-full text-center text-sm text-muted-foreground hover:text-terracotta"
          >
            {mode === "login" ? "Forgot your password?" : "Back to sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <a href="/" className="hover:text-terracotta">
            ← Back to website
          </a>
        </p>
      </div>
    </div>
  );
}
