import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  DownloadCloud,
  FolderKanban,
  Images,
  Loader2,
  Mail,
  MailOpen,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  adminKeys,
  fetchProjects,
  fetchRecentInquiries,
  fetchStats,
  friendlyError,
} from "@/lib/cms/admin";
import { importDefaultContent, type ImportProgress } from "@/lib/cms/seed";
import {
  AdminPageHeader,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  StatusBadge,
  relativeTime,
} from "@/components/admin/ui";
import { cn } from "@/lib/utils";

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  to,
  loading,
  highlight,
}: {
  label: string;
  value: number | undefined;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  to: string;
  loading: boolean;
  highlight?: boolean;
}) {
  return (
    <Link to={to} className="group">
      <Card className="h-full p-5 transition-shadow group-hover:shadow-md">
        <div className="flex items-start justify-between">
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
          <span
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg",
              highlight ? "bg-terracotta/10 text-terracotta" : "bg-linen text-ink/70",
            )}
          >
            <Icon className="h-4 w-4" />
          </span>
        </div>
        {loading ? (
          <div className="mt-3 h-8 w-16 animate-pulse rounded bg-linen" />
        ) : (
          <p className="mt-2 text-3xl font-semibold tracking-tight text-ink">{value ?? "—"}</p>
        )}
        {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
      </Card>
    </Link>
  );
}

export default function DashboardPage() {
  const qc = useQueryClient();
  const stats = useQuery({ queryKey: adminKeys.stats, queryFn: fetchStats });
  const recent = useQuery({
    queryKey: [...adminKeys.inquiriesAll, "recent"],
    queryFn: () => fetchRecentInquiries(5),
  });
  const projects = useQuery({ queryKey: adminKeys.projects, queryFn: fetchProjects });

  const [confirmImport, setConfirmImport] = useState(false);
  const [progress, setProgress] = useState<ImportProgress | null>(null);

  const s = stats.data;
  const isEmpty = s && s.projects_total === 0 && s.gallery_total === 0;
  const recentlyUpdated = [...(projects.data ?? [])]
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    .slice(0, 5);

  async function runImport() {
    setProgress({ done: 0, total: 1, label: "Starting…" });
    try {
      const res = await importDefaultContent(setProgress);
      toast.success(
        `Imported ${res.projectsAdded} projects and ${res.imagesAdded} gallery images` +
          (res.skipped ? ` (${res.skipped} already existed and were left unchanged).` : "."),
      );
      await qc.invalidateQueries({ queryKey: ["cms"] });
    } catch (e) {
      toast.error(
        `Import stopped: ${friendlyError(e)} Anything already imported was kept — you can run it again safely.`,
      );
      throw e;
    } finally {
      setProgress(null);
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        description="An overview of your website content."
        actions={
          !isEmpty && !progress && stats.isSuccess ? (
            <Button variant="outline" size="sm" onClick={() => setConfirmImport(true)}>
              <DownloadCloud />
              Import missing original content
            </Button>
          ) : undefined
        }
      />

      {stats.isError ? (
        <Card>
          <ErrorState message={friendlyError(stats.error)} onRetry={() => void stats.refetch()} />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Projects"
            value={s?.projects_total}
            sub={s ? `${s.projects_published} published · ${s.projects_draft} draft` : undefined}
            icon={FolderKanban}
            to="/admin/projects"
            loading={stats.isPending}
          />
          <StatCard
            label="Gallery images"
            value={s?.gallery_total}
            sub={
              s
                ? `${s.gallery_soft_goods} soft goods · ${s.gallery_other_work} other work`
                : undefined
            }
            icon={Images}
            to="/admin/galleries"
            loading={stats.isPending}
          />
          <StatCard
            label="Inquiries"
            value={s?.inquiries_total}
            sub={s ? `${s.inquiries_new} with status "new"` : undefined}
            icon={Mail}
            to="/admin/inquiries"
            loading={stats.isPending}
          />
          <StatCard
            label="Unread inquiries"
            value={s?.inquiries_unread}
            sub="Messages waiting for you"
            icon={MailOpen}
            to="/admin/inquiries"
            loading={stats.isPending}
            highlight={!!s?.inquiries_unread}
          />
        </div>
      )}

      {/* Importer */}
      {(isEmpty || progress) && (
        <Card className="mt-6 border-terracotta/30 bg-terracotta/[0.03] p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <h2 className="font-sans text-base font-semibold text-ink">
                Start by importing your current website content
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Your database is empty, so the website is showing its built-in content. Import it
                once to make every project and gallery image editable here. Nothing is deleted or
                overwritten, and it's safe to run again.
              </p>
            </div>
            <Button
              onClick={() => setConfirmImport(true)}
              disabled={!!progress}
              className="shrink-0"
            >
              {progress ? <Loader2 className="animate-spin" /> : <DownloadCloud />}
              Import site content
            </Button>
          </div>
          {progress && (
            <div className="mt-5 space-y-2">
              <Progress
                value={(progress.done / Math.max(progress.total, 1)) * 100}
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                {progress.done}/{progress.total} · {progress.label}
              </p>
            </div>
          )}
        </Card>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-sans text-sm font-semibold">Latest inquiries</h2>
            <Link
              to="/admin/inquiries"
              className="inline-flex items-center gap-1 text-xs font-medium text-terracotta hover:underline"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {recent.isPending ? (
            <div className="space-y-3 p-5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-10 animate-pulse rounded bg-linen" />
              ))}
            </div>
          ) : recent.isError ? (
            <ErrorState
              message={friendlyError(recent.error)}
              onRetry={() => void recent.refetch()}
            />
          ) : recent.data.length === 0 ? (
            <EmptyState
              title="No inquiries yet"
              description="Messages from your contact form will appear here."
            />
          ) : (
            <ul className="divide-y divide-border">
              {recent.data.map((m) => (
                <li key={m.id}>
                  <Link
                    to={`/admin/inquiries?open=${m.id}`}
                    className="flex items-start gap-3 px-5 py-3 hover:bg-linen/50"
                  >
                    <span
                      className={cn(
                        "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                        m.is_read ? "bg-transparent" : "bg-terracotta",
                      )}
                      aria-label={m.is_read ? undefined : "Unread"}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className={cn("truncate text-sm", !m.is_read && "font-semibold")}>
                          {m.name}
                        </p>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {relativeTime(m.created_at)}
                        </span>
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        {m.subject || m.message}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-sans text-sm font-semibold">Recently updated projects</h2>
            <Link
              to="/admin/projects"
              className="inline-flex items-center gap-1 text-xs font-medium text-terracotta hover:underline"
            >
              Manage <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {projects.isPending ? (
            <div className="space-y-3 p-5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-10 animate-pulse rounded bg-linen" />
              ))}
            </div>
          ) : projects.isError ? (
            <ErrorState
              message={friendlyError(projects.error)}
              onRetry={() => void projects.refetch()}
            />
          ) : recentlyUpdated.length === 0 ? (
            <EmptyState
              title="No projects in the database"
              description="Import your current content or add a new project."
              action={
                <Button asChild size="sm" variant="outline">
                  <Link to="/admin/projects/new">Add a project</Link>
                </Button>
              }
            />
          ) : (
            <ul className="divide-y divide-border">
              {recentlyUpdated.map((p) => (
                <li key={p.id}>
                  <Link
                    to={`/admin/projects/${p.id}`}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-linen/50"
                  >
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-linen">
                      {(p.gallery[0]?.url || p.cover_image) && (
                        <img
                          src={p.gallery[0]?.url || p.cover_image!}
                          alt=""
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{p.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Updated {relativeTime(p.updated_at)}
                      </p>
                    </div>
                    <StatusBadge published={p.published} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <ConfirmDialog
        open={confirmImport}
        onOpenChange={setConfirmImport}
        title="Import current website content?"
        destructive={false}
        confirmLabel="Import"
        description={
          <>
            This uploads the website's built-in images to your media library and creates the 7
            projects and 39 gallery images as editable records. Existing records are never changed
            or deleted. It can take a minute — keep this tab open.
          </>
        }
        onConfirm={() => {
          // Close the dialog and show progress on the page instead.
          void runImport().catch(() => undefined);
        }}
      />
    </div>
  );
}
