import { lazy, Suspense, useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { AdminShell } from "@/components/admin/AdminShell";
import { AuthProvider, RequireAdmin, useAuth } from "@/components/admin/auth";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import LoginPage from "./login";
import ResetPasswordPage from "./reset-password";

const DashboardPage = lazy(() => import("./dashboard"));
const ProjectsPage = lazy(() => import("./projects"));
const ProjectEditorPage = lazy(() => import("./project-editor"));
const GalleriesPage = lazy(() => import("./galleries"));
const InquiriesPage = lazy(() => import("./inquiries"));
const MediaPage = lazy(() => import("./media"));
const SettingsPage = lazy(() => import("./settings"));

function NotConfigured() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream p-6 font-sans">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 shadow-sm">
        <h1 className="font-display text-3xl text-ink">CMS not connected</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The admin dashboard needs a Supabase project. Add these variables to a{" "}
          <code className="rounded bg-linen px-1">.env</code> file (or your hosting provider's
          environment settings), then restart or rebuild the site:
        </p>
        <pre className="mt-4 overflow-x-auto rounded-lg bg-ink p-4 text-xs text-cream">
          {`VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key`}
        </pre>
        <p className="mt-4 text-sm text-muted-foreground">
          See <code className="rounded bg-linen px-1">CMS_SETUP.md</code> in the project for the
          full setup guide. The public website keeps working with its built-in content meanwhile.
        </p>
      </div>
    </div>
  );
}

function NotAuthorized() {
  const auth = useAuth();
  const email = auth.status === "signed-in" ? auth.session.user.email : "";
  const failed = auth.status === "signed-in" && auth.adminCheckFailed;
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream p-6 font-sans">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h1 className="font-sans text-xl font-semibold text-ink">
          {failed ? "Couldn't verify access" : "Not an administrator"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {failed
            ? "We couldn't reach the database to check your permissions. Check your connection, or confirm the database schema has been installed."
            : `You're signed in as ${email}, but this account doesn't have permission to manage the website.`}
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button variant="outline" onClick={() => void auth.recheckAdmin()}>
            Check again
          </Button>
          <Button onClick={() => void auth.signOut()}>Sign out</Button>
        </div>
      </div>
    </div>
  );
}

function Lazy({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-24">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-terracotta border-t-transparent" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

export default function AdminApp() {
  useEffect(() => {
    const robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex, nofollow";
    document.head.appendChild(robots);
    const prevTitle = document.title;
    document.title = "Admin — Emily Seel Designs";
    return () => {
      robots.remove();
      document.title = prevTitle;
    };
  }, []);

  if (!isSupabaseConfigured) return <NotConfigured />;

  return (
    <AuthProvider>
      <Toaster position="top-right" richColors closeButton />
      <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
        <Route
          element={
            <RequireAdmin notAuthorized={<NotAuthorized />}>
              <AdminShell />
            </RequireAdmin>
          }
        >
          <Route
            index
            element={
              <Lazy>
                <DashboardPage />
              </Lazy>
            }
          />
          <Route
            path="projects"
            element={
              <Lazy>
                <ProjectsPage />
              </Lazy>
            }
          />
          <Route
            path="projects/new"
            element={
              <Lazy>
                <ProjectEditorPage />
              </Lazy>
            }
          />
          <Route
            path="projects/:id"
            element={
              <Lazy>
                <ProjectEditorPage />
              </Lazy>
            }
          />
          <Route
            path="galleries"
            element={
              <Lazy>
                <GalleriesPage />
              </Lazy>
            }
          />
          <Route
            path="inquiries"
            element={
              <Lazy>
                <InquiriesPage />
              </Lazy>
            }
          />
          <Route
            path="media"
            element={
              <Lazy>
                <MediaPage />
              </Lazy>
            }
          />
          <Route
            path="settings"
            element={
              <Lazy>
                <SettingsPage />
              </Lazy>
            }
          />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
