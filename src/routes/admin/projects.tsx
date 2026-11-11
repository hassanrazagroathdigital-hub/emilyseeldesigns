import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  FolderKanban,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  adminKeys,
  deleteProject,
  fetchProjects,
  friendlyError,
  reorder,
  updateProject,
} from "@/lib/cms/admin";
import type { Project } from "@/lib/cms/types";
import {
  AdminPageHeader,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  StatusBadge,
  TableSkeleton,
  formatDate,
} from "@/components/admin/ui";

type SortKey = "order" | "title" | "updated";

export default function ProjectsPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const q = useQuery({ queryKey: adminKeys.projects, queryFn: fetchProjects });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "published" | "draft">("all");
  const [sort, setSort] = useState<SortKey>("order");
  const [toDelete, setToDelete] = useState<Project | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["cms"] });

  const toggle = useMutation({
    mutationFn: (p: { id: string; patch: Partial<Project> }) => updateProject(p.id, p.patch),
    onSuccess: (_d, v) => {
      if ("published" in v.patch)
        toast.success(v.patch.published ? "Published" : "Moved to drafts");
      else toast.success(v.patch.featured ? "Shown on home page" : "Hidden from home page");
      void invalidate();
    },
    onError: (e) => toast.error(friendlyError(e)),
  });

  const move = useMutation({
    mutationFn: (ordered: Project[]) => reorder("projects", ordered),
    onSuccess: () => void invalidate(),
    onError: (e) => {
      toast.error(friendlyError(e));
      void invalidate();
    },
  });

  const rows = useMemo(() => {
    let list = q.data ?? [];
    const s = search.trim().toLowerCase();
    if (s)
      list = list.filter((p) =>
        [p.title, p.slug, p.category, p.description, ...p.tags].some((x) =>
          x.toLowerCase().includes(s),
        ),
      );
    if (status !== "all") list = list.filter((p) => p.published === (status === "published"));
    if (sort === "title") list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    if (sort === "updated")
      list = [...list].sort((a, b) => b.updated_at.localeCompare(a.updated_at));
    return list;
  }, [q.data, search, status, sort]);

  const canReorder = sort === "order" && !search && status === "all";

  function moveBy(p: Project, delta: number) {
    const list = [...(q.data ?? [])];
    const i = list.findIndex((x) => x.id === p.id);
    const j = i + delta;
    if (j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    // Optimistic update for a snappy feel.
    qc.setQueryData(adminKeys.projects, list);
    move.mutate(list);
  }

  return (
    <div>
      <AdminPageHeader
        title="Projects"
        description="Industrial design work shown on the home and Industrial Design pages."
        actions={
          <Button asChild>
            <Link to="/admin/projects/new">
              <Plus />
              New project
            </Link>
          </Button>
        }
      />

      <Card>
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search projects…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              aria-label="Search projects"
            />
          </div>
          <div className="flex gap-2">
            <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
              <SelectTrigger className="w-[140px]" aria-label="Filter by status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Drafts</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger className="w-[160px]" aria-label="Sort by">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="order">Display order</SelectItem>
                <SelectItem value="title">Title A–Z</SelectItem>
                <SelectItem value="updated">Recently updated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {q.isPending ? (
          <TableSkeleton />
        ) : q.isError ? (
          <ErrorState message={friendlyError(q.error)} onRetry={() => void q.refetch()} />
        ) : (q.data ?? []).length === 0 ? (
          <EmptyState
            icon={<FolderKanban className="h-5 w-5" />}
            title="No projects yet"
            description="The website is currently showing its built-in projects. Import them from the Dashboard to edit them, or create a new one."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button asChild variant="outline">
                  <Link to="/admin">Go to Dashboard</Link>
                </Button>
                <Button asChild>
                  <Link to="/admin/projects/new">
                    <Plus />
                    New project
                  </Link>
                </Button>
              </div>
            }
          />
        ) : rows.length === 0 ? (
          <EmptyState title="No matches" description="Try a different search or filter." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Project</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="hidden px-4 py-3 font-medium md:table-cell">Images</th>
                  <th className="hidden px-4 py-3 font-medium md:table-cell">Updated</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((p, idx) => {
                  const thumb = p.gallery[0]?.url || p.cover_image;
                  return (
                    <tr key={p.id} className="hover:bg-linen/40">
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/projects/${p.id}`)}
                          className="flex items-center gap-3 text-left"
                        >
                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-border bg-linen">
                            {thumb && (
                              <img
                                src={thumb}
                                alt=""
                                className="h-full w-full object-cover"
                                loading="lazy"
                              />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-ink">{p.title}</p>
                            <p className="truncate text-xs text-muted-foreground">/{p.slug}</p>
                          </div>
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-start gap-1">
                          <StatusBadge published={p.published} />
                          {p.featured && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                              <Star className="h-3 w-3 fill-current" /> Home page
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                        {p.gallery.length}
                      </td>
                      <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                        {formatDate(p.updated_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {canReorder && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Move up"
                                disabled={idx === 0 || move.isPending}
                                onClick={() => moveBy(p, -1)}
                              >
                                <ArrowUp />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Move down"
                                disabled={idx === rows.length - 1 || move.isPending}
                                onClick={() => moveBy(p, 1)}
                              >
                                <ArrowDown />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={p.featured ? "Hide from home page" : "Show on home page"}
                            title={p.featured ? "Hide from home page" : "Show on home page"}
                            disabled={toggle.isPending}
                            onClick={() =>
                              toggle.mutate({ id: p.id, patch: { featured: !p.featured } })
                            }
                          >
                            <Star className={p.featured ? "fill-current text-terracotta" : ""} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={p.published ? "Unpublish" : "Publish"}
                            title={p.published ? "Unpublish" : "Publish"}
                            disabled={toggle.isPending}
                            onClick={() =>
                              toggle.mutate({ id: p.id, patch: { published: !p.published } })
                            }
                          >
                            {p.published ? <EyeOff /> : <Eye />}
                          </Button>
                          <Button variant="ghost" size="icon" aria-label="Edit" asChild>
                            <Link to={`/admin/projects/${p.id}`}>
                              <Pencil />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Delete"
                            className="hover:text-destructive"
                            onClick={() => setToDelete(p)}
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {!canReorder && (q.data ?? []).length > 1 && (
          <p className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
            Clear search/filters and sort by "Display order" to reorder projects.
          </p>
        )}
      </Card>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title={`Delete "${toDelete?.title}"?`}
        description={
          <>
            This permanently removes the project from your website. Its images stay in the Media
            Library so you can reuse them (or clean them up there). This can't be undone.
          </>
        }
        onConfirm={async () => {
          if (!toDelete) return;
          try {
            await deleteProject(toDelete.id);
            toast.success("Project deleted");
            void invalidate();
          } catch (e) {
            toast.error(friendlyError(e));
            throw e;
          }
        }}
      />
    </div>
  );
}
