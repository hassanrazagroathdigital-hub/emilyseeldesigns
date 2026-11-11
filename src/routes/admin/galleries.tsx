import { useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Eye,
  EyeOff,
  ImagePlus,
  Images,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  addGalleryImages,
  adminKeys,
  deleteGalleryImage,
  fetchGallery,
  friendlyError,
  reorder,
  updateGalleryImage,
} from "@/lib/cms/admin";
import { uploadMedia, validateImageFile } from "@/lib/cms/media";
import { GALLERY_COLLECTIONS, type GalleryCollection, type GalleryImage } from "@/lib/cms/types";
import {
  AdminPageHeader,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  FormField,
} from "@/components/admin/ui";
import { cn } from "@/lib/utils";

export default function GalleriesPage() {
  const [params, setParams] = useSearchParams();
  const requested = params.get("c");
  const collection: GalleryCollection =
    GALLERY_COLLECTIONS.find((c) => c.key === requested)?.key ?? "soft-goods";
  const meta = GALLERY_COLLECTIONS.find((c) => c.key === collection) ?? GALLERY_COLLECTIONS[0];

  const qc = useQueryClient();
  const q = useQuery({
    queryKey: adminKeys.gallery(collection),
    queryFn: () => fetchGallery(collection),
  });
  const [filter, setFilter] = useState<"all" | "visible" | "hidden">("all");
  const [editing, setEditing] = useState<GalleryImage | null>(null);
  const [toDelete, setToDelete] = useState<GalleryImage | null>(null);
  const [uploads, setUploads] = useState<Array<{ name: string; progress: number }>>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["cms"] });

  const toggle = useMutation({
    mutationFn: (img: GalleryImage) => updateGalleryImage(img.id, { published: !img.published }),
    onSuccess: (_d, img) => {
      toast.success(
        img.published ? "Image hidden from the website" : "Image visible on the website",
      );
      void invalidate();
    },
    onError: (e) => toast.error(friendlyError(e)),
  });

  const move = useMutation({
    mutationFn: (list: GalleryImage[]) => reorder("gallery_images", list),
    onSuccess: () => void invalidate(),
    onError: (e) => {
      toast.error(friendlyError(e));
      void invalidate();
    },
  });

  const all = q.data ?? [];
  const items = all.filter((i) =>
    filter === "all" ? true : filter === "visible" ? i.published : !i.published,
  );
  const canReorder = filter === "all";

  function moveBy(img: GalleryImage, d: number) {
    const list = [...all];
    const i = list.findIndex((x) => x.id === img.id);
    const j = i + d;
    if (j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    qc.setQueryData(adminKeys.gallery(collection), list);
    move.mutate(list);
  }

  async function addFiles(files: FileList | null) {
    if (!files?.length) return;
    const valid = Array.from(files).filter((f) => {
      const p = validateImageFile(f);
      if (p) toast.error(p);
      return !p;
    });
    if (!valid.length) return;
    setUploads(valid.map((f) => ({ name: f.name, progress: 0 })));
    const uploaded: Array<{ image_url: string; image_path: string }> = [];
    for (let k = 0; k < valid.length; k++) {
      try {
        const r = await uploadMedia(valid[k], "gallery", (p) =>
          setUploads((u) => u.map((x, i) => (i === k ? { ...x, progress: p } : x))),
        );
        uploaded.push({ image_url: r.url, image_path: r.path });
      } catch (e) {
        toast.error(e instanceof Error ? e.message : `Upload of ${valid[k].name} failed`);
      }
    }
    try {
      if (uploaded.length) {
        const start = Math.max(-10, ...all.map((i) => i.sort_order)) + 10;
        await addGalleryImages(collection, uploaded, start);
        toast.success(
          `${uploaded.length} image${uploaded.length > 1 ? "s" : ""} added to ${meta.label}`,
        );
        await invalidate();
      }
    } catch (e) {
      toast.error(friendlyError(e));
    } finally {
      setUploads([]);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Galleries"
        description="Image walls on the Soft Goods and Other Work pages."
        actions={
          <>
            <Button asChild variant="ghost" size="sm">
              <a href={meta.path} target="_blank" rel="noreferrer">
                <ExternalLink /> View page
              </a>
            </Button>
            <Button onClick={() => inputRef.current?.click()} disabled={uploads.length > 0}>
              {uploads.length ? <Loader2 className="animate-spin" /> : <ImagePlus />}
              Upload images
            </Button>
          </>
        }
      />
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => void addFiles(e.target.files)}
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={collection} onValueChange={(v) => setParams({ c: v })}>
          <TabsList>
            {GALLERY_COLLECTIONS.map((c) => (
              <TabsTrigger key={c.key} value={c.key}>
                {c.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList>
            <TabsTrigger value="all">All ({all.length})</TabsTrigger>
            <TabsTrigger value="visible">Visible</TabsTrigger>
            <TabsTrigger value="hidden">Hidden</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

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

      <Card className="p-4">
        {q.isPending ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="aspect-square animate-pulse rounded-lg bg-linen" />
            ))}
          </div>
        ) : q.isError ? (
          <ErrorState message={friendlyError(q.error)} onRetry={() => void q.refetch()} />
        ) : all.length === 0 ? (
          <EmptyState
            icon={<Images className="h-5 w-5" />}
            title={`No ${meta.label} images in the database`}
            description="The page is showing its built-in images. Import them from the Dashboard, or upload new ones — once you add images here, the page shows exactly what's in this gallery."
            action={
              <Button onClick={() => inputRef.current?.click()}>
                <ImagePlus /> Upload images
              </Button>
            }
          />
        ) : items.length === 0 ? (
          <EmptyState title="Nothing here" description="No images match this filter." />
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((img) => {
              const idx = all.findIndex((x) => x.id === img.id);
              return (
                <li
                  key={img.id}
                  className="group overflow-hidden rounded-lg border border-border bg-cream/40"
                >
                  <div className="relative aspect-square bg-linen">
                    <img
                      src={img.image_url}
                      alt={img.alt}
                      loading="lazy"
                      className={cn(
                        "h-full w-full object-cover",
                        !img.published && "opacity-40 grayscale",
                      )}
                    />
                    <span className="absolute left-2 top-2 rounded bg-ink/70 px-1.5 text-[11px] font-medium text-cream">
                      {idx + 1}
                    </span>
                    {!img.published && (
                      <span className="absolute right-2 top-2 rounded bg-ink/80 px-1.5 py-0.5 text-[11px] font-medium text-cream">
                        Hidden
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-1 p-1.5">
                    <div className="flex">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        aria-label="Move earlier"
                        disabled={!canReorder || idx === 0 || move.isPending}
                        onClick={() => moveBy(img, -1)}
                      >
                        <ArrowLeft />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        aria-label="Move later"
                        disabled={!canReorder || idx === all.length - 1 || move.isPending}
                        onClick={() => moveBy(img, 1)}
                      >
                        <ArrowRight />
                      </Button>
                    </div>
                    <div className="flex">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        aria-label={img.published ? "Hide" : "Show"}
                        title={img.published ? "Hide from website" : "Show on website"}
                        onClick={() => toggle.mutate(img)}
                        disabled={toggle.isPending}
                      >
                        {img.published ? <EyeOff /> : <Eye />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        aria-label="Edit details"
                        onClick={() => setEditing(img)}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:text-destructive"
                        aria-label="Delete"
                        onClick={() => setToDelete(img)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <EditImageDialog
        image={editing}
        onClose={() => setEditing(null)}
        onSaved={() => void invalidate()}
      />

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Remove this image from the gallery?"
        description={
          <div className="space-y-3">
            {toDelete && (
              <img
                src={toDelete.image_url}
                alt=""
                className="h-32 w-full rounded-md object-cover"
              />
            )}
            <p>
              It will no longer appear on the {meta.label} page. The file stays in the Media Library
              until you clean it up there. To hide it temporarily instead, use the eye icon.
            </p>
          </div>
        }
        confirmLabel="Remove"
        onConfirm={async () => {
          if (!toDelete) return;
          try {
            await deleteGalleryImage(toDelete.id, collection);
            toast.success("Image removed");
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

function EditImageDialog({
  image,
  onClose,
  onSaved,
}: {
  image: GalleryImage | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [alt, setAlt] = useState("");
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const [lastId, setLastId] = useState<string | null>(null);
  if (image && image.id !== lastId) {
    setLastId(image.id);
    setAlt(image.alt);
    setCaption(image.caption);
  }

  return (
    <Dialog open={!!image} onOpenChange={(o) => !o && !busy && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-sans">Image details</DialogTitle>
          <DialogDescription>
            Describe the image for screen readers and search engines.
          </DialogDescription>
        </DialogHeader>
        {image && (
          <img
            src={image.image_url}
            alt=""
            className="max-h-56 w-full rounded-md object-contain bg-linen"
          />
        )}
        <FormField label="Description (alt text)" htmlFor="g-alt">
          <Input id="g-alt" value={alt} onChange={(e) => setAlt(e.target.value)} maxLength={300} />
        </FormField>
        <FormField label="Caption" htmlFor="g-cap" help="Shown when hovering the image.">
          <Input
            id="g-cap"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={300}
          />
        </FormField>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button
            disabled={busy}
            onClick={async () => {
              if (!image) return;
              setBusy(true);
              try {
                await updateGalleryImage(image.id, { alt: alt.trim(), caption: caption.trim() });
                toast.success("Image details saved");
                onSaved();
                onClose();
              } catch (e) {
                toast.error(friendlyError(e));
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy && <Loader2 className="animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
