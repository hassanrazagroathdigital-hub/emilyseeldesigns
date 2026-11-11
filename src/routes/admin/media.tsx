import { useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, ImagePlus, Image as ImageIcon, Loader2, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminKeys, fetchReferencedMediaPaths, friendlyError } from "@/lib/cms/admin";
import {
  deleteMedia,
  listAllMedia,
  uploadMedia,
  validateImageFile,
  type MediaObject,
} from "@/lib/cms/media";
import {
  AdminPageHeader,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  formatDate,
} from "@/components/admin/ui";
import { cn } from "@/lib/utils";

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export default function MediaPage() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: adminKeys.media,
    queryFn: async () => {
      const [files, refs] = await Promise.all([listAllMedia(), fetchReferencedMediaPaths()]);
      return { files, refs };
    },
  });
  const [filter, setFilter] = useState<"all" | "used" | "unused">("all");
  const [selected, setSelected] = useState<MediaObject | null>(null);
  const [confirm, setConfirm] = useState<{ paths: string[]; label: string } | null>(null);
  const [uploads, setUploads] = useState<Array<{ name: string; progress: number }>>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const files = useMemo(() => q.data?.files ?? [], [q.data]);
  const refs = useMemo(() => q.data?.refs ?? new Map<string, string[]>(), [q.data]);
  const unused = useMemo(() => files.filter((f) => !refs.has(f.path)), [files, refs]);
  const shown =
    filter === "all" ? files : filter === "unused" ? unused : files.filter((f) => refs.has(f.path));
  const totalSize = files.reduce((n, f) => n + f.size, 0);

  async function addFiles(list: FileList | null) {
    if (!list?.length) return;
    const valid = Array.from(list).filter((f) => {
      const p = validateImageFile(f, { allowIcon: true });
      if (p) toast.error(p);
      return !p;
    });
    setUploads(valid.map((f) => ({ name: f.name, progress: 0 })));
    let ok = 0;
    for (let k = 0; k < valid.length; k++) {
      try {
        await uploadMedia(
          valid[k],
          "library",
          (p) => setUploads((u) => u.map((x, i) => (i === k ? { ...x, progress: p } : x))),
          { allowIcon: true },
        );
        ok++;
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Upload failed");
      }
    }
    setUploads([]);
    if (inputRef.current) inputRef.current.value = "";
    if (ok) {
      toast.success(`${ok} file${ok > 1 ? "s" : ""} uploaded`);
      void qc.invalidateQueries({ queryKey: adminKeys.media });
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Media Library"
        description="Every image stored for your website. Files in use can't be deleted here."
        actions={
          <>
            {unused.length > 0 && (
              <Button
                variant="outline"
                onClick={() =>
                  setConfirm({
                    paths: unused.map((f) => f.path),
                    label: `${unused.length} unused file${unused.length > 1 ? "s" : ""}`,
                  })
                }
              >
                <Sparkles /> Clean up unused ({unused.length})
              </Button>
            )}
            <Button onClick={() => inputRef.current?.click()} disabled={uploads.length > 0}>
              {uploads.length ? <Loader2 className="animate-spin" /> : <ImagePlus />}
              Upload
            </Button>
          </>
        }
      />
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/gif,image/x-icon,.ico"
        className="hidden"
        onChange={(e) => void addFiles(e.target.files)}
      />

      {uploads.length > 0 && (
        <Card className="mb-4 space-y-2 p-4">
          {uploads.map((u, i) => (
            <div key={i} className="flex items-center gap-3 text-xs">
              <span className="w-48 truncate">{u.name}</span>
              <Progress value={u.progress * 100} className="h-1.5 flex-1" />
            </div>
          ))}
        </Card>
      )}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList>
            <TabsTrigger value="all">All ({files.length})</TabsTrigger>
            <TabsTrigger value="used">In use ({files.length - unused.length})</TabsTrigger>
            <TabsTrigger value="unused">Unused ({unused.length})</TabsTrigger>
          </TabsList>
        </Tabs>
        {files.length > 0 && (
          <span className="text-xs text-muted-foreground">{formatBytes(totalSize)} total</span>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <Card className="p-4">
          {q.isPending ? (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 xl:grid-cols-5">
              {Array.from({ length: 10 }, (_, i) => (
                <div key={i} className="aspect-square animate-pulse rounded-lg bg-linen" />
              ))}
            </div>
          ) : q.isError ? (
            <ErrorState message={friendlyError(q.error)} onRetry={() => void q.refetch()} />
          ) : shown.length === 0 ? (
            <EmptyState
              icon={<ImageIcon className="h-5 w-5" />}
              title={files.length === 0 ? "No files yet" : "Nothing here"}
              description={
                files.length === 0
                  ? "Images you upload in projects, galleries and settings are stored here."
                  : "No files match this filter."
              }
            />
          ) : (
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 xl:grid-cols-5">
              {shown.map((f) => {
                const used = refs.has(f.path);
                return (
                  <li key={f.path}>
                    <button
                      type="button"
                      onClick={() => setSelected(f)}
                      className={cn(
                        "relative block aspect-square w-full overflow-hidden rounded-lg border bg-linen",
                        selected?.path === f.path
                          ? "border-terracotta ring-2 ring-terracotta/30"
                          : "border-border",
                      )}
                    >
                      <img
                        src={f.url}
                        alt={f.name}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                      {!used && (
                        <span className="absolute bottom-1 left-1 rounded bg-ink/75 px-1.5 text-[10px] font-medium text-cream">
                          Unused
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card className="h-fit p-4 lg:sticky lg:top-6">
          {!selected ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Select a file to see its details.
            </p>
          ) : (
            <div className="space-y-4">
              <img
                src={selected.url}
                alt=""
                className="max-h-48 w-full rounded-md bg-linen object-contain"
              />
              <dl className="space-y-2 text-xs">
                <div>
                  <dt className="text-muted-foreground">File</dt>
                  <dd className="break-all font-medium">{selected.path}</dd>
                </div>
                <div className="flex gap-6">
                  <div>
                    <dt className="text-muted-foreground">Size</dt>
                    <dd>{formatBytes(selected.size)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Uploaded</dt>
                    <dd>{formatDate(selected.created_at)}</dd>
                  </div>
                </div>
                <div>
                  <dt className="text-muted-foreground">Used by</dt>
                  <dd>
                    {refs.get(selected.path)?.length ? (
                      <ul className="mt-1 list-disc space-y-0.5 pl-4">
                        {[...new Set(refs.get(selected.path))].map((r) => (
                          <li key={r}>{r}</li>
                        ))}
                      </ul>
                    ) : (
                      "Not used anywhere"
                    )}
                  </dd>
                </div>
              </dl>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(selected.url);
                      toast.success("URL copied");
                    } catch {
                      toast.error("Couldn't copy — select and copy the URL manually.");
                    }
                  }}
                >
                  <Copy /> Copy URL
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  disabled={refs.has(selected.path)}
                  title={
                    refs.has(selected.path)
                      ? "Remove it from the content that uses it first"
                      : undefined
                  }
                  onClick={() => setConfirm({ paths: [selected.path], label: selected.name })}
                >
                  <Trash2 /> Delete file
                </Button>
                {refs.has(selected.path) && (
                  <p className="text-[11px] text-muted-foreground">
                    This file is in use. Remove it from the content above before deleting.
                  </p>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>

      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={`Permanently delete ${confirm?.label}?`}
        description="These files aren't used by any project, gallery or setting. Deleting them frees storage and can't be undone."
        onConfirm={async () => {
          if (!confirm) return;
          try {
            // Re-check usage right before deleting to avoid races with other edits.
            const fresh = await fetchReferencedMediaPaths();
            const safe = confirm.paths.filter((p) => !fresh.has(p));
            await deleteMedia(safe);
            toast.success(`Deleted ${safe.length} file${safe.length === 1 ? "" : "s"}`);
            if (safe.length < confirm.paths.length)
              toast.info(
                `${confirm.paths.length - safe.length} file(s) became in use and were kept.`,
              );
            setSelected(null);
            void qc.invalidateQueries({ queryKey: adminKeys.media });
          } catch (e) {
            toast.error(friendlyError(e));
            throw e;
          }
        }}
      />
    </div>
  );
}
