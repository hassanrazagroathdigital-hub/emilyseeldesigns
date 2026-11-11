import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { uploadMedia, validateImageFile } from "@/lib/cms/media";
import type { Slide, SlideFit, SlidePosition } from "@/lib/cms/types";

type Uploading = { name: string; progress: number };

/** Ordered image gallery editor for a project's carousel. */
export function SlidesEditor({
  value,
  onChange,
}: {
  value: Slide[];
  onChange: (s: Slide[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<Uploading[]>([]);
  // Keep the latest list for async uploads that finish one after another.
  const latest = useRef(value);
  latest.current = value;

  const update = (i: number, patch: Partial<Slide>) =>
    onChange(value.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));

  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  async function addFiles(files: FileList | null) {
    if (!files?.length) return;
    const list = Array.from(files);
    const valid = list.filter((f) => {
      const problem = validateImageFile(f);
      if (problem) toast.error(problem);
      return !problem;
    });
    setUploading(valid.map((f) => ({ name: f.name, progress: 0 })));
    let ok = 0;
    for (let k = 0; k < valid.length; k++) {
      const f = valid[k];
      try {
        const res = await uploadMedia(f, "projects", (p) =>
          setUploading((u) => u.map((x, i) => (i === k ? { ...x, progress: p } : x))),
        );
        const slide: Slide = {
          url: res.url,
          path: res.path,
          alt: f.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "),
          fit: "cover",
          enhance: false,
          position: "center",
          bg: null,
        };
        latest.current = [...latest.current, slide];
        onChange(latest.current);
        ok++;
      } catch (e) {
        toast.error(e instanceof Error ? e.message : `Upload of ${f.name} failed`);
      }
    }
    setUploading([]);
    if (ok) toast.success(`${ok} image${ok > 1 ? "s" : ""} added`);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-3">
      {value.length === 0 && uploading.length === 0 && (
        <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
          No gallery images yet. The card will show the cover image instead.
        </p>
      )}

      <ul className="space-y-3">
        {value.map((s, i) => (
          <li
            key={`${s.url}-${i}`}
            className="flex flex-col gap-3 rounded-lg border border-border bg-cream/40 p-3 sm:flex-row"
          >
            <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-md border border-border bg-white sm:w-36">
              <img
                src={s.url}
                alt={s.alt}
                className="h-full w-full"
                style={{
                  objectFit: s.fit,
                  objectPosition: s.position,
                  filter: s.enhance ? "contrast(1.15) brightness(1.05)" : undefined,
                  backgroundColor: s.bg ?? undefined,
                }}
              />
              <span className="absolute left-1.5 top-1.5 rounded bg-ink/70 px-1.5 text-[11px] font-medium text-cream">
                {i + 1}
              </span>
            </div>
            <div className="grid flex-1 gap-2 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-muted-foreground" htmlFor={`alt-${i}`}>
                  Description (alt text)
                </label>
                <Input
                  id={`alt-${i}`}
                  value={s.alt}
                  onChange={(e) => update(i, { alt: e.target.value })}
                  placeholder="Describe the image for screen readers"
                  className="h-8"
                />
              </div>
              <div>
                <span className="text-xs font-medium text-muted-foreground">Fit</span>
                <Select value={s.fit} onValueChange={(v) => update(i, { fit: v as SlideFit })}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cover">Fill (crop)</SelectItem>
                    <SelectItem value="contain">Fit whole image</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <span className="text-xs font-medium text-muted-foreground">Focus</span>
                <Select
                  value={s.position}
                  onValueChange={(v) => update(i, { position: v as SlidePosition })}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="top">Top</SelectItem>
                    <SelectItem value="bottom">Bottom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <Switch checked={s.enhance} onCheckedChange={(c) => update(i, { enhance: c })} />
                Boost contrast (for sketches)
              </label>
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="color"
                  value={s.bg || "#ffffff"}
                  onChange={(e) => update(i, { bg: e.target.value })}
                  className="h-7 w-9 cursor-pointer rounded border border-border bg-transparent"
                  aria-label="Background colour"
                />
                Background
                {s.bg && (
                  <button
                    type="button"
                    className="underline"
                    onClick={() => update(i, { bg: null })}
                  >
                    reset
                  </button>
                )}
              </label>
            </div>
            <div className="flex shrink-0 gap-1 sm:flex-col">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Move up"
                disabled={i === 0}
                onClick={() => move(i, -1)}
              >
                <ArrowUp />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Move down"
                disabled={i === value.length - 1}
                onClick={() => move(i, 1)}
              >
                <ArrowDown />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Remove image"
                className="hover:text-destructive"
                onClick={() => onChange(value.filter((_, idx) => idx !== i))}
              >
                <Trash2 />
              </Button>
            </div>
          </li>
        ))}
      </ul>

      {uploading.length > 0 && (
        <ul className="space-y-2 rounded-lg border border-border p-3">
          {uploading.map((u, i) => (
            <li key={i} className="flex items-center gap-3 text-xs">
              <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-terracotta" />
              <span className="w-40 truncate">{u.name}</span>
              <Progress value={u.progress * 100} className="h-1.5 flex-1" />
            </li>
          ))}
        </ul>
      )}

      <Button
        type="button"
        variant="outline"
        onClick={() => inputRef.current?.click()}
        disabled={uploading.length > 0}
      >
        <ImagePlus />
        Add images
      </Button>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => void addFiles(e.target.files)}
      />
    </div>
  );
}
