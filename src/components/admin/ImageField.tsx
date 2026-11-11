import { useRef, useState } from "react";
import { ImagePlus, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  uploadMedia,
  validateImageFile,
  type MediaFolder,
  type UploadResult,
} from "@/lib/cms/media";
import { cn } from "@/lib/utils";

/**
 * Single-image picker with drag & drop, validation, progress and preview.
 * The previous image is only replaced AFTER the new upload succeeds; old files
 * are left in storage (clean them up safely from the Media Library).
 */
export function ImageField({
  value,
  onChange,
  folder,
  fallbackUrl,
  allowIcon,
  aspect = "aspect-[4/3]",
  removable = true,
  id,
}: {
  value: string | null;
  onChange: (next: UploadResult | null) => void;
  folder: MediaFolder;
  /** Shown (dimmed, labelled "default") when value is empty. */
  fallbackUrl?: string;
  allowIcon?: boolean;
  aspect?: string;
  removable?: boolean;
  id?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    const problem = validateImageFile(file, { allowIcon });
    if (problem) {
      toast.error(problem);
      return;
    }
    setProgress(0);
    try {
      const res = await uploadMedia(file, folder, setProgress, { allowIcon });
      onChange(res);
      toast.success("Image uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setProgress(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const shown = value || fallbackUrl;
  const uploading = progress !== null;

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void handleFile(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          "relative overflow-hidden rounded-lg border border-dashed bg-linen/50 transition-colors",
          aspect,
          dragOver ? "border-terracotta bg-terracotta/5" : "border-border",
        )}
      >
        {shown ? (
          <img
            src={shown}
            alt=""
            className={cn("h-full w-full object-contain", !value && "opacity-60")}
          />
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-full w-full flex-col items-center justify-center gap-2 text-sm text-muted-foreground hover:text-ink"
          >
            <ImagePlus className="h-6 w-6" />
            Click or drop an image
          </button>
        )}
        {!value && fallbackUrl && (
          <span className="absolute left-2 top-2 rounded bg-ink/70 px-2 py-0.5 text-[11px] font-medium text-cream">
            Default image
          </span>
        )}
        {uploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-card/85 px-6">
            <Loader2 className="h-5 w-5 animate-spin text-terracotta" />
            <Progress value={(progress ?? 0) * 100} className="h-1.5 w-full max-w-[200px]" />
            <span className="text-xs text-muted-foreground">
              {Math.round((progress ?? 0) * 100)}%
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          id={id}
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {value ? <RefreshCw /> : <ImagePlus />}
          {value ? "Replace" : "Upload"}
        </Button>
        {value && removable && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={uploading}
            onClick={() => onChange(null)}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 />
            {fallbackUrl ? "Use default" : "Remove"}
          </Button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={
          allowIcon
            ? "image/jpeg,image/png,image/webp,image/gif,image/x-icon,.ico"
            : "image/jpeg,image/png,image/webp,image/gif"
        }
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
