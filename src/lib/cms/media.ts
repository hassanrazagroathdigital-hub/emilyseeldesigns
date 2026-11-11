/**
 * Supabase Storage helpers for the cms-media bucket (admin only).
 */
import { requireSupabase, supabaseAnonKey, supabaseUrl } from "@/lib/supabase/client";

export const MEDIA_BUCKET = "cms-media";
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};
const ICON_TYPES: Record<string, string> = {
  "image/x-icon": "ico",
  "image/vnd.microsoft.icon": "ico",
};

export const MEDIA_FOLDERS = ["projects", "gallery", "settings", "library", "imports"] as const;
export type MediaFolder = (typeof MEDIA_FOLDERS)[number];

export function publicUrlForPath(path: string): string {
  return `${supabaseUrl}/storage/v1/object/public/${MEDIA_BUCKET}/${path
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}

/** Storage path for a public URL of this bucket, or null for other URLs. */
export function pathFromPublicUrl(url: string | null | undefined): string | null {
  if (!url || !supabaseUrl) return null;
  const prefix = `${supabaseUrl}/storage/v1/object/public/${MEDIA_BUCKET}/`;
  if (!url.startsWith(prefix)) return null;
  try {
    return decodeURIComponent(url.slice(prefix.length).split("?")[0]);
  } catch {
    return null;
  }
}

export function validateImageFile(file: File, opts?: { allowIcon?: boolean }): string | null {
  const types = opts?.allowIcon ? { ...ALLOWED_IMAGE_TYPES, ...ICON_TYPES } : ALLOWED_IMAGE_TYPES;
  if (!types[file.type]) {
    return `"${file.name}" is not a supported image. Use JPG, PNG, WebP${opts?.allowIcon ? ", ICO" : ""} or GIF.`;
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return `"${file.name}" is ${(file.size / 1024 / 1024).toFixed(1)} MB — the limit is 10 MB.`;
  }
  return null;
}

const MAX_DIMENSION = 2400;

/**
 * Downscale very large photos and re-encode as WebP before upload.
 * Returns the original file when it is already small or optimisation fails.
 */
export async function optimizeImage(file: File): Promise<File> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return file;
  if (file.size < 600 * 1024) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/webp", 0.86));
    if (!blob || blob.size >= file.size) return file;
    const name = file.name.replace(/\.[^.]+$/, "") + ".webp";
    return new File([blob], name, { type: "image/webp" });
  } catch {
    return file;
  }
}

function slugifyFileName(name: string): string {
  const base = name
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
  return base || "image";
}

export type UploadResult = { path: string; url: string };

/**
 * Upload a file with progress reporting. Uses the Storage REST endpoint via
 * XHR because supabase-js does not expose upload progress. The user's own
 * access token is used, so storage RLS (admins only) applies.
 */
export async function uploadMedia(
  file: File,
  folder: MediaFolder,
  onProgress?: (fraction: number) => void,
  opts?: { allowIcon?: boolean; fixedPath?: string; skipOptimize?: boolean },
): Promise<UploadResult> {
  const problem = validateImageFile(file, opts);
  if (problem) throw new Error(problem);

  const toUpload = opts?.skipOptimize ? file : await optimizeImage(file);
  const types = { ...ALLOWED_IMAGE_TYPES, ...ICON_TYPES };
  const ext = types[toUpload.type] ?? "bin";
  const path =
    opts?.fixedPath ??
    `${folder}/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID().slice(0, 8)}-${slugifyFileName(file.name)}.${ext}`;

  const sb = requireSupabase();
  const { data: sessionData } = await sb.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) throw new Error("Your session has expired. Please sign in again.");

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      `${supabaseUrl}/storage/v1/object/${MEDIA_BUCKET}/${path.split("/").map(encodeURIComponent).join("/")}`,
    );
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.setRequestHeader("apikey", supabaseAnonKey);
    xhr.setRequestHeader("Content-Type", toUpload.type);
    xhr.setRequestHeader("Cache-Control", "max-age=31536000");
    xhr.setRequestHeader("x-upsert", "false");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(e.loaded / e.total);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) return resolve();
      let msg = `Upload failed (${xhr.status}).`;
      try {
        const body = JSON.parse(xhr.responseText);
        if (body?.statusCode === "409" || xhr.status === 409) {
          return reject(Object.assign(new Error("File already exists."), { code: "exists" }));
        }
        if (xhr.status === 403 || xhr.status === 401)
          msg = "You don't have permission to upload files.";
        else if (xhr.status === 413) msg = "That file is too large.";
        else if (body?.message) msg = `Upload failed: ${body.message}`;
      } catch {
        /* keep generic message */
      }
      reject(new Error(msg));
    };
    xhr.onerror = () => reject(new Error("Network error while uploading. Check your connection."));
    xhr.send(toUpload);
  });

  onProgress?.(1);
  return { path, url: publicUrlForPath(path) };
}

export type MediaObject = {
  path: string;
  name: string;
  folder: string;
  size: number;
  mimetype: string;
  created_at: string;
  url: string;
};

/** List every object in the bucket (walks one level of sub-folders). */
export async function listAllMedia(): Promise<MediaObject[]> {
  const sb = requireSupabase();
  const out: MediaObject[] = [];

  async function walk(prefix: string, depth: number) {
    let offset = 0;
    for (;;) {
      const { data, error } = await sb.storage
        .from(MEDIA_BUCKET)
        .list(prefix, { limit: 1000, offset, sortBy: { column: "created_at", order: "desc" } });
      if (error) throw error;
      for (const item of data ?? []) {
        const full = prefix ? `${prefix}/${item.name}` : item.name;
        if (item.id === null) {
          if (depth < 3) await walk(full, depth + 1);
        } else if (item.name !== ".emptyFolderPlaceholder") {
          const meta = (item.metadata ?? {}) as { size?: number; mimetype?: string };
          out.push({
            path: full,
            name: item.name,
            folder: full.split("/")[0],
            size: meta.size ?? 0,
            mimetype: meta.mimetype ?? "",
            created_at: item.created_at ?? "",
            url: publicUrlForPath(full),
          });
        }
      }
      if (!data || data.length < 1000) break;
      offset += 1000;
    }
  }

  await walk("", 0);
  return out;
}

export async function deleteMedia(paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  const sb = requireSupabase();
  for (let i = 0; i < paths.length; i += 100) {
    const { error } = await sb.storage.from(MEDIA_BUCKET).remove(paths.slice(i, i + 100));
    if (error) throw error;
  }
}
