/**
 * Admin data access. Every call runs with the signed-in user's JWT; the
 * database's RLS policies decide whether it is allowed (admins only).
 * Admin screens only ever show real database rows — never defaults.
 */
import type { PostgrestError } from "@supabase/supabase-js";
import { requireSupabase } from "@/lib/supabase/client";
import type {
  CmsStats,
  GalleryCollection,
  GalleryImage,
  Inquiry,
  InquiryStatus,
  Project,
  ProjectInput,
} from "./types";
import { isPersistedId } from "./types";
import type { SettingsKey } from "./settings";
import { mergeSettings } from "./settings";
import { pathFromPublicUrl } from "./media";

export const adminKeys = {
  all: ["cms", "admin"] as const,
  stats: ["cms", "admin", "stats"] as const,
  projects: ["cms", "admin", "projects"] as const,
  project: (id: string) => ["cms", "admin", "project", id] as const,
  gallery: (c: GalleryCollection) => ["cms", "admin", "gallery", c] as const,
  inquiries: (params: unknown) => ["cms", "admin", "inquiries", params] as const,
  inquiriesAll: ["cms", "admin", "inquiries"] as const,
  settings: ["cms", "admin", "settings"] as const,
  media: ["cms", "admin", "media"] as const,
};

/** Human-friendly message for a Supabase/Postgres error. Never leaks internals. */
export function friendlyError(
  e: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  const err = e as Partial<PostgrestError> & { message?: string; status?: number };
  const code = err?.code;
  const msg = err?.message ?? "";
  if (code === "23505") return "That slug is already used by another item. Choose a different one.";
  if (code === "23514") return "Some values are not valid. Check the highlighted fields.";
  if (code === "42501" || /row-level security|permission denied|not authorized/i.test(msg))
    return "You don't have permission to do that. Make sure your account is an administrator.";
  if (code === "PGRST301" || /JWT|token.*expired/i.test(msg))
    return "Your session has expired. Please sign in again.";
  if (/Failed to fetch|NetworkError|network/i.test(msg))
    return "Network problem — check your connection and try again.";
  if (e instanceof Error && msg && !code) return msg;
  return fallback;
}

function assertPersisted(id: string) {
  if (!isPersistedId(id))
    throw new Error("This item is default content and is not saved in the database.");
}

async function markManaged(flag: "projects" | "soft_goods" | "other_work") {
  const sb = requireSupabase();
  const { error } = await sb.rpc("merge_site_setting", {
    p_key: "cms_state",
    p_patch: { [flag]: true },
  });
  if (error) throw error;
}

// ---------------------------------------------------------------- stats

export async function fetchStats(): Promise<CmsStats> {
  const { data, error } = await requireSupabase().rpc("cms_stats");
  if (error) throw error;
  return data as CmsStats;
}

// ---------------------------------------------------------------- projects

export async function fetchProjects(): Promise<Project[]> {
  const { data, error } = await requireSupabase()
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data as Project[];
}

export async function fetchProject(id: string): Promise<Project | null> {
  assertPersisted(id);
  const { data, error } = await requireSupabase()
    .from("projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as Project | null;
}

export async function createProject(input: ProjectInput): Promise<Project> {
  const sb = requireSupabase();
  const { data, error } = await sb.from("projects").insert(input).select("*").single();
  if (error) throw error;
  await markManaged("projects");
  return data as Project;
}

export async function updateProject(id: string, patch: Partial<ProjectInput>): Promise<Project> {
  assertPersisted(id);
  const { data, error } = await requireSupabase()
    .from("projects")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as Project;
}

export async function deleteProject(id: string): Promise<void> {
  assertPersisted(id);
  const sb = requireSupabase();
  const { error } = await sb.from("projects").delete().eq("id", id);
  if (error) throw error;
  await markManaged("projects");
}

/** Persist a new order. Only rows whose sort_order changes are written. */
export async function reorder(
  table: "projects" | "gallery_images",
  ordered: Array<{ id: string; sort_order: number }>,
): Promise<void> {
  const sb = requireSupabase();
  const changes = ordered
    .map((row, i) => ({ id: row.id, from: row.sort_order, to: i * 10 }))
    .filter((c) => c.from !== c.to);
  for (const c of changes) {
    assertPersisted(c.id);
    const { error } = await sb.from(table).update({ sort_order: c.to }).eq("id", c.id);
    if (error) throw error;
  }
}

// ---------------------------------------------------------------- gallery

export async function fetchGallery(collection: GalleryCollection): Promise<GalleryImage[]> {
  const { data, error } = await requireSupabase()
    .from("gallery_images")
    .select("*")
    .eq("collection", collection)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data as GalleryImage[];
}

const GALLERY_FLAG = { "soft-goods": "soft_goods", "other-work": "other_work" } as const;

export async function addGalleryImages(
  collection: GalleryCollection,
  images: Array<{ image_url: string; image_path: string | null; alt?: string }>,
  startOrder: number,
): Promise<void> {
  const rows = images.map((img, i) => ({
    collection,
    image_url: img.image_url,
    image_path: img.image_path,
    alt: img.alt ?? "",
    published: true,
    sort_order: startOrder + i * 10,
  }));
  const { error } = await requireSupabase().from("gallery_images").insert(rows);
  if (error) throw error;
  await markManaged(GALLERY_FLAG[collection]);
}

export async function updateGalleryImage(
  id: string,
  patch: Partial<Pick<GalleryImage, "alt" | "caption" | "published" | "image_url" | "image_path">>,
): Promise<void> {
  assertPersisted(id);
  const { error } = await requireSupabase().from("gallery_images").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteGalleryImage(id: string, collection: GalleryCollection): Promise<void> {
  assertPersisted(id);
  const { error } = await requireSupabase().from("gallery_images").delete().eq("id", id);
  if (error) throw error;
  await markManaged(GALLERY_FLAG[collection]);
}

// ---------------------------------------------------------------- inquiries

export type InquiryQuery = {
  search: string;
  status: InquiryStatus | "all";
  unreadOnly: boolean;
  sort: "newest" | "oldest";
  page: number;
  pageSize: number;
};

export async function fetchInquiries(q: InquiryQuery): Promise<{ rows: Inquiry[]; total: number }> {
  let query = requireSupabase()
    .from("inquiries")
    .select("id,name,email,phone,subject,message,status,is_read,created_at,updated_at", {
      count: "exact",
    });
  if (q.status !== "all") query = query.eq("status", q.status);
  if (q.unreadOnly) query = query.eq("is_read", false);
  const s = q.search
    .trim()
    .replace(/[%_,()*\\]/g, " ")
    .trim();
  if (s) {
    const like = `%${s}%`;
    query = query.or(
      `name.ilike.${like},email.ilike.${like},subject.ilike.${like},message.ilike.${like}`,
    );
  }
  const from = q.page * q.pageSize;
  const { data, error, count } = await query
    .order("created_at", { ascending: q.sort === "oldest" })
    .range(from, from + q.pageSize - 1);
  if (error) throw error;
  return { rows: (data ?? []) as Inquiry[], total: count ?? 0 };
}

export async function fetchInquiry(id: string): Promise<Inquiry | null> {
  assertPersisted(id);
  const { data, error } = await requireSupabase()
    .from("inquiries")
    .select("id,name,email,phone,subject,message,status,is_read,created_at,updated_at")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as Inquiry | null;
}

export async function updateInquiry(
  id: string,
  patch: Partial<Pick<Inquiry, "status" | "is_read">>,
): Promise<void> {
  assertPersisted(id);
  const { error } = await requireSupabase().from("inquiries").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteInquiry(id: string): Promise<void> {
  assertPersisted(id);
  const { error } = await requireSupabase().from("inquiries").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchRecentInquiries(limit = 5): Promise<Inquiry[]> {
  const { data, error } = await requireSupabase()
    .from("inquiries")
    .select("id,name,email,phone,subject,message,status,is_read,created_at,updated_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as Inquiry[];
}

// ---------------------------------------------------------------- settings

export type SettingsRows = Array<{
  key: string;
  value: Record<string, unknown>;
  updated_at: string;
}>;

export async function fetchSettingsRows(): Promise<SettingsRows> {
  const { data, error } = await requireSupabase()
    .from("site_settings")
    .select("key,value,updated_at");
  if (error) throw error;
  return (data ?? []) as SettingsRows;
}

export function settingsFromRows(rows: SettingsRows) {
  return mergeSettings(rows);
}

/** Merge only the changed fields into one settings section. */
export async function saveSettingsSection(
  key: SettingsKey,
  patch: Record<string, unknown>,
): Promise<void> {
  if (Object.keys(patch).length === 0) return;
  const { error } = await requireSupabase().rpc("merge_site_setting", {
    p_key: key,
    p_patch: patch,
  });
  if (error) throw error;
}

// ---------------------------------------------------------------- media usage

/** Every storage path referenced by CMS content (for safe cleanup). */
export async function fetchReferencedMediaPaths(): Promise<Map<string, string[]>> {
  const sb = requireSupabase();
  const [projects, gallery, settings] = await Promise.all([
    sb.from("projects").select("title,cover_image,gallery"),
    sb.from("gallery_images").select("collection,image_url,image_path"),
    sb.from("site_settings").select("key,value"),
  ]);
  if (projects.error) throw projects.error;
  if (gallery.error) throw gallery.error;
  if (settings.error) throw settings.error;

  const refs = new Map<string, string[]>();
  const add = (url: string | null | undefined, where: string, path?: string | null) => {
    const p = path || pathFromPublicUrl(url);
    if (!p) return;
    refs.set(p, [...(refs.get(p) ?? []), where]);
  };

  for (const p of projects.data ?? []) {
    add(p.cover_image, `Project: ${p.title}`);
    for (const s of (p.gallery ?? []) as Array<{ url: string; path?: string | null }>)
      add(s.url, `Project: ${p.title}`, s.path);
  }
  for (const g of gallery.data ?? []) add(g.image_url, `Gallery: ${g.collection}`, g.image_path);
  for (const s of settings.data ?? []) {
    for (const v of Object.values((s.value ?? {}) as Record<string, unknown>))
      if (typeof v === "string") add(v, `Settings: ${s.key}`);
  }
  return refs;
}
