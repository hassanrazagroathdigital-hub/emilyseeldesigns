/** Shared CMS types. Database rows mirror supabase/schema.sql. */

export type SlideFit = "cover" | "contain";
export type SlidePosition = "center" | "top" | "bottom";

export type Slide = {
  url: string;
  /** Storage object path inside the cms-media bucket, when stored there. */
  path?: string | null;
  alt: string;
  fit: SlideFit;
  enhance: boolean;
  position: SlidePosition;
  bg?: string | null;
};

export type Project = {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  tags: string[];
  cover_image: string | null;
  gallery: Slide[];
  featured: boolean;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ProjectInput = Omit<Project, "id" | "created_at" | "updated_at">;

export const GALLERY_COLLECTIONS = [
  { key: "soft-goods", label: "Soft Goods", path: "/soft-goods" },
  { key: "other-work", label: "Other Work", path: "/other-work" },
] as const;

export type GalleryCollection = (typeof GALLERY_COLLECTIONS)[number]["key"];

export type GalleryImage = {
  id: string;
  collection: GalleryCollection;
  image_url: string;
  image_path: string | null;
  alt: string;
  caption: string;
  seed_key: string | null;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export const INQUIRY_STATUSES = [
  { value: "new", label: "New" },
  { value: "in_progress", label: "In progress" },
  { value: "replied", label: "Replied" },
  { value: "archived", label: "Archived" },
] as const;

export type InquiryStatus = (typeof INQUIRY_STATUSES)[number]["value"];

export type Inquiry = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: InquiryStatus;
  is_read: boolean;
  created_at: string;
  updated_at: string;
};

export type CmsStats = {
  projects_total: number;
  projects_published: number;
  projects_draft: number;
  gallery_total: number;
  gallery_soft_goods: number;
  gallery_other_work: number;
  gallery_hidden: number;
  inquiries_total: number;
  inquiries_unread: number;
  inquiries_new: number;
};

/**
 * Where public content came from. "default" = bundled fallback content that
 * does NOT exist in the database and must never be edited/deleted as a record.
 */
export type ContentSource = "cms" | "default";

export const DEFAULT_ID_PREFIX = "default:";

export function isPersistedId(id: string | null | undefined): id is string {
  return !!id && !id.startsWith(DEFAULT_ID_PREFIX);
}
