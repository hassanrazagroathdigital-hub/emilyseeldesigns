/**
 * Public (visitor-facing) CMS data access.
 *
 * Rules:
 *  - Only PUBLISHED rows are requested (RLS enforces this too).
 *  - Supabase missing / failing never breaks the page: we fall back to the
 *    bundled defaults.
 *  - A collection that has never been managed by the CMS (cms_state flag is
 *    false) and is empty shows the defaults; once the owner manages it, the
 *    database is the single source of truth (no mixing).
 */
import { useQuery } from "@tanstack/react-query";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { publicDb } from "@/lib/supabase/public-client";
import { defaultGalleries, defaultProjects } from "./defaults";
import { defaultSettings, mergeSettings, type SiteSettings } from "./settings";
import type { ContentSource, GalleryCollection, GalleryImage, Project } from "./types";

export const cmsKeys = {
  all: ["cms"] as const,
  settings: ["cms", "public", "settings"] as const,
  projects: ["cms", "public", "projects"] as const,
  gallery: (c: GalleryCollection) => ["cms", "public", "gallery", c] as const,
};

const SETTINGS_CACHE_KEY = "esd.cms.settings.v1";
const PUBLIC_STALE_MS = 60_000;

/** Retry once on transient errors, but not after a timeout (fall back fast). */
const publicRetry = (failureCount: number, error: unknown) =>
  failureCount < 1 && !/abort/i.test(String((error as { message?: string })?.message ?? error));

function readSettingsCache(): SiteSettings | undefined {
  try {
    const raw = window.localStorage.getItem(SETTINGS_CACHE_KEY);
    if (!raw) return undefined;
    return mergeSettings(JSON.parse(raw));
  } catch {
    return undefined;
  }
}

// Read the render cache once per page load, not on every render.
let cachedSettings: SiteSettings | undefined | null = null;
function getCachedSettings(): SiteSettings | undefined {
  if (cachedSettings === null)
    cachedSettings = isSupabaseConfigured ? readSettingsCache() : undefined;
  return cachedSettings;
}

function writeSettingsCache(rows: unknown) {
  try {
    window.localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(rows));
  } catch {
    /* storage unavailable — fine, it is only a render cache */
  }
}

async function fetchSettings(): Promise<SiteSettings> {
  if (!publicDb) return defaultSettings;
  const { data, error } = await publicDb.from("site_settings").select("key,value");
  if (error) throw error;
  writeSettingsCache(data);
  return mergeSettings(data ?? []);
}

/** Global website settings. Always returns a complete object. */
export function useSiteSettings(): SiteSettings {
  const { data } = useQuery({
    queryKey: cmsKeys.settings,
    queryFn: fetchSettings,
    enabled: isSupabaseConfigured,
    staleTime: PUBLIC_STALE_MS,
    retry: publicRetry,
    // Render instantly from the last known settings, then refresh.
    initialData: getCachedSettings,
    initialDataUpdatedAt: 0,
  });
  return data ?? defaultSettings;
}

type CollectionResult<T> = { items: T[]; source: ContentSource; loading: boolean };

function useSettingsReady() {
  return useQuery({
    queryKey: cmsKeys.settings,
    queryFn: fetchSettings,
    enabled: isSupabaseConfigured,
    staleTime: PUBLIC_STALE_MS,
    retry: publicRetry,
  });
}

export function usePublicProjects(opts?: { featuredOnly?: boolean }): CollectionResult<Project> {
  const settings = useSettingsReady();
  const q = useQuery({
    queryKey: cmsKeys.projects,
    enabled: isSupabaseConfigured,
    staleTime: PUBLIC_STALE_MS,
    retry: publicRetry,
    queryFn: async () => {
      const { data, error } = await publicDb!
        .from("projects")
        .select(
          "id,title,slug,description,category,tags,cover_image,gallery,featured,published,sort_order,created_at,updated_at",
        )
        .eq("published", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Project[];
    },
  });

  const managed = settings.data?.cms_state.projects ?? false;
  let result: CollectionResult<Project>;
  if (!isSupabaseConfigured || q.isError) {
    result = { items: defaultProjects, source: "default", loading: false };
  } else if (q.isPending || settings.isPending) {
    result = { items: [], source: "cms", loading: true };
  } else if (q.data.length === 0 && !managed) {
    result = { items: defaultProjects, source: "default", loading: false };
  } else {
    result = { items: q.data, source: "cms", loading: false };
  }
  if (opts?.featuredOnly) result = { ...result, items: result.items.filter((p) => p.featured) };
  return result;
}

const MANAGED_FLAG: Record<GalleryCollection, "soft_goods" | "other_work"> = {
  "soft-goods": "soft_goods",
  "other-work": "other_work",
};

export function usePublicGallery(collection: GalleryCollection): CollectionResult<GalleryImage> {
  const settings = useSettingsReady();
  const q = useQuery({
    queryKey: cmsKeys.gallery(collection),
    enabled: isSupabaseConfigured,
    staleTime: PUBLIC_STALE_MS,
    retry: publicRetry,
    queryFn: async () => {
      const { data, error } = await publicDb!
        .from("gallery_images")
        .select("*")
        .eq("collection", collection)
        .eq("published", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as GalleryImage[];
    },
  });

  const managed = settings.data?.cms_state[MANAGED_FLAG[collection]] ?? false;
  if (!isSupabaseConfigured || q.isError)
    return { items: defaultGalleries[collection], source: "default", loading: false };
  if (q.isPending || settings.isPending) return { items: [], source: "cms", loading: true };
  if (q.data.length === 0 && !managed)
    return { items: defaultGalleries[collection], source: "default", loading: false };
  return { items: q.data, source: "cms", loading: false };
}

export { MANAGED_FLAG };

export type InquiryPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
  /** Honeypot — must stay empty. */
  website?: string;
};

export class InquiryError extends Error {
  constructor(
    message: string,
    /** true when the server rejected the content (don't retry elsewhere). */
    public readonly rejected: boolean,
  ) {
    super(message);
  }
}

/** Store an inquiry through the validated, rate-limited RPC. */
export async function submitInquiry(p: InquiryPayload): Promise<void> {
  if (!publicDb) throw new InquiryError("CMS not configured", false);
  const { error } = await publicDb.rpc("submit_inquiry", {
    p_name: p.name,
    p_email: p.email,
    p_message: p.message,
    p_subject: p.subject,
    p_phone: p.phone ?? null,
    p_website: p.website ?? "",
  });
  if (error) {
    const rejected = error.code === "22023" || error.code === "P0429";
    throw new InquiryError(rejected ? error.message : "Could not save message", rejected);
  }
}
