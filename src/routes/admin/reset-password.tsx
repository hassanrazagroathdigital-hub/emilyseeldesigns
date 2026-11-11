import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/admin/ui";
import { FullScreenSpinner, useAuth } from "@/components/admin/auth";
import { requireSupabase } from "@/lib/supabase/client";

/** Landing page for the password-reset email link. */
export default function ResetPasswordPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (auth.status === "loading") return <FullScreenSpinner />;

  if (auth.status === "signed-out") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream p-6 font-sans">
        <div className="max-w-sm rounded-2xl border border-border bg-card p-8 text-center">
          <h1 className="font-sans text-xl font-semibold">Link expired</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This reset link is invalid or has expired. Request a new one from the sign-in page.
          </p>
          <Button asChild className="mt-6">
            <Link to="/admin/login">Go to sign in</Link>
          </Button>
        </div>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) return setError("Use at least 8 characters.");
    if (password !== confirm) return setError("The passwords don't match.");
    setBusy(true);
    const { error } = await requireSupabase().auth.updateUser({ password });
    setBusy(false);
    if (error) {
      setError(error.message || "Couldn't update the password.");
      return;
    }
    toast.success("Password updated");
    navigate("/admin", { replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream p-6 font-sans">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm"
      >
        <h1 className="font-display text-3xl text-ink">Choose a new password</h1>
        <FormField label="New password" htmlFor="pw" help="At least 8 characters.">
          <Input
            id="pw"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormField>
        <FormField label="Confirm password" htmlFor="pw2">
          <Input
            id="pw2"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </FormField>
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={busy}>
          {busy && <Loader2 className="animate-spin" />}
          Update password
        </Button>
      </form>
    </div>
  );
}
