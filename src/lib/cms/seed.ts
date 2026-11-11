/**
 * NON-DESTRUCTIVE importer: copies the website's original (bundled) content
 * into Supabase so it becomes editable.
 *
 *  - Runs only when an admin explicitly clicks "Import".
 *  - Never deletes or overwrites anything.
 *  - Projects are matched by slug, gallery images by seed_key; existing rows
 *    (including ones the admin has edited) are skipped.
 *  - Images are uploaded to cms-media/imports/<original-file-name>; a file
 *    that already exists there is reused, so re-running is safe.
 */
import { requireSupabase } from "@/lib/supabase/client";
import { assetNameFromUrl, defaultGalleries, defaultProjects } from "./defaults";
import { publicUrlForPath, uploadMedia } from "./media";
import type { GalleryCollection, Slide } from "./types";

export type ImportProgress = { done: number; total: number; label: string };
export type ImportSummary = { projectsAdded: number; imagesAdded: number; skipped: number };

async function importAsset(url: string): Promise<{ url: string; path: string }> {
  const name = assetNameFromUrl(url);
  if (!name) throw new Error("Unknown bundled image.");
  const path = `imports/${name}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not read bundled image ${name}.`);
  const blob = await res.blob();
  const type = blob.type || (name.endsWith(".png") ? "image/png" : "image/jpeg");
  const file = new File([blob], name, { type });
  try {
    return await uploadMedia(file, "imports", undefined, { fixedPath: path, skipOptimize: true });
  } catch (e) {
    if ((e as { code?: string }).code === "exists") return { path, url: publicUrlForPath(path) };
    throw e;
  }
}

export async function importDefaultContent(
  onProgress: (p: ImportProgress) => void,
): Promise<ImportSummary> {
  const sb = requireSupabase();
  const summary: ImportSummary = { projectsAdded: 0, imagesAdded: 0, skipped: 0 };

  const [{ data: existingProjects, error: pErr }, { data: existingGallery, error: gErr }] =
    await Promise.all([
      sb.from("projects").select("slug"),
      sb.from("gallery_images").select("seed_key").not("seed_key", "is", null),
    ]);
  if (pErr) throw pErr;
  if (gErr) throw gErr;

  const haveSlugs = new Set((existingProjects ?? []).map((r) => r.slug as string));
  const haveKeys = new Set((existingGallery ?? []).map((r) => r.seed_key as string));

  const projectsTodo = defaultProjects.filter((p) => !haveSlugs.has(p.slug));
  const galleryTodo = (Object.keys(defaultGalleries) as GalleryCollection[]).flatMap((c) =>
    defaultGalleries[c].filter((g) => !haveKeys.has(g.seed_key!)),
  );
  summary.skipped =
    defaultProjects.length -
    projectsTodo.length +
    (defaultGalleries["soft-goods"].length +
      defaultGalleries["other-work"].length -
      galleryTodo.length);

  const total = projectsTodo.reduce((n, p) => n + 1 + p.gallery.length, 0) + galleryTodo.length;
  let done = 0;
  const tick = (label: string) => onProgress({ done: ++done, total, label });
  onProgress({ done: 0, total, label: "Starting…" });

  for (const p of projectsTodo) {
    const cover = p.cover_image ? await importAsset(p.cover_image) : null;
    tick(`${p.title}: cover image`);
    const gallery: Slide[] = [];
    for (const s of p.gallery) {
      const up = await importAsset(s.url);
      gallery.push({ ...s, url: up.url, path: up.path });
      tick(`${p.title}: image ${gallery.length}/${p.gallery.length}`);
    }
    const { error } = await sb.from("projects").insert({
      title: p.title,
      slug: p.slug,
      description: p.description,
      category: p.category,
      tags: p.tags,
      cover_image: cover?.url ?? null,
      gallery,
      featured: p.featured,
      published: true,
      sort_order: p.sort_order,
    });
    // 23505 = someone inserted the same slug meanwhile: skip, don't overwrite.
    if (error && error.code !== "23505") throw error;
    if (!error) summary.projectsAdded++;
  }

  for (const g of galleryTodo) {
    const up = await importAsset(g.image_url);
    const { error } = await sb.from("gallery_images").insert({
      collection: g.collection,
      image_url: up.url,
      image_path: up.path,
      alt: g.alt,
      caption: g.caption,
      seed_key: g.seed_key,
      published: true,
      sort_order: g.sort_order,
    });
    if (error && error.code !== "23505") throw error;
    if (!error) summary.imagesAdded++;
    tick(`${g.collection === "soft-goods" ? "Soft Goods" : "Other Work"} gallery`);
  }

  const { error: flagErr } = await sb.rpc("merge_site_setting", {
    p_key: "cms_state",
    p_patch: { projects: true, soft_goods: true, other_work: true },
  });
  if (flagErr) throw flagErr;

  return summary;
}
