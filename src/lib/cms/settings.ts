/**
 * Website settings: the schema that drives both the admin Settings form and
 * the typed defaults the public site falls back to.
 *
 * Stored in public.site_settings as one row per section (key = section key,
 * value = JSON object). Saving one section never overwrites another, and only
 * changed fields are sent (merged server-side by merge_site_setting()).
 */
import { asset } from "./defaults";

export type FieldType = "text" | "textarea" | "image" | "url" | "email" | "list" | "boolean";

export type FieldDef = {
  key: string;
  label: string;
  type: FieldType;
  help?: string;
  required?: boolean;
  rows?: number;
};

export type SectionDef = {
  key: SettingsKey;
  title: string;
  description: string;
  group: "Site" | "Pages" | "SEO";
  fields: FieldDef[];
};

const defaults = {
  general: {
    siteName: "Emily Seel Designs",
    logoUrl: asset("emily-seel-designs-logo.png"),
    faviconUrl: "",
    footerTagline: "Small-batch, big love. Handmade and one-of-a-kind.",
    copyright: "© 2026 Emily Seel Designs. All rights reserved.",
  },
  contact: {
    email: "seeldesigns@gmail.com",
    instagramUrl: "https://www.instagram.com/matkaandmethreads/",
    instagramHandle: "@matkaandmethreads",
    location: "Portland, Oregon — Handmade in the USA",
    responseTime: "We typically respond within 1 to 2 business days.",
  },
  navigation: {
    home: "Home",
    industrialDesign: "Industrial Design",
    softGoods: "Soft Goods",
    otherWork: "Other Work",
    contact: "Contact",
  },
  marquee: {
    items: [
      "Industrial Design",
      "Soft Goods",
      "Fine Art",
      "Portland Oregon",
      "Handmade",
      "One of a Kind",
      "Emily Seel Designs",
      "Children's Products",
      "Mosaic",
      "Sewing",
      "Carpentry",
      "Ceramics",
    ] as string[],
  },
  home: {
    heroEyebrow: "Industrial Design — Portfolio",
    heroTitleLine1: "Where craft",
    heroTitleLine2: "meets",
    heroTitleEmphasis: "intention.",
    heroIntro:
      "Emily Seel is an Industrial Designer based in Portland, Oregon. She holds a Bachelor of Science in Industrial Design from The Art Institute of Seattle, where she focused on designing and building products for children. Every piece she creates is grounded in thoughtful problem-solving, tactile materials, and the belief that great design makes everyday life more joyful.",
    heroCtaLabel: "view the work",
    heroImage: asset("pattern-blocks-3.jpg"),
    heroImageAlt: "Wooden geometric Pattern Blocks",
    workTitle: "Industrial Design Work",
    workSubtitle: "Designing for children. Building for life.",
    aboutEyebrow: "About",
    aboutTitle: "Hi, I am Emily.",
    aboutBody:
      "Emily Seel is a Cabinet Designer and multidisciplinary maker based out of Portland, Oregon. She completed her Bachelor of Science in Industrial Design from The Art Institute of Seattle, where she focused her studies on designing and building products for children. She enjoys all kinds of creative mediums, including sewing, painting, carpentry, and ceramics. Emily also has a passion for nature and loves houseplants and gardening.",
    aboutImage: asset("emily-portrait-magenta.jpg"),
    aboutCtaLabel: "get in touch",
    moreTitle: "More From Emily",
    moreSubtitle: "Beyond Industrial Design",
  },
  featured: {
    enabled: true,
    eyebrow: "Featured Project",
    title: "Matka and Me Threads",
    subtitle: "Hand crafted softgoods for the whole family",
    body: "Check out companion site featuring hand sewn quilts, baby blankets, aprons, and other products for adults and children.",
    url: "https://www.matkaandmethreads.com/",
    ctaLabel: "visit the site",
  },
  industrial_design: {
    title: "Industrial Design",
    subtitle: "Designing for children. Building for life.",
  },
  soft_goods: {
    title: "Soft Goods",
    subtitle: "Sewn with care. Made to be cherished.",
    intro:
      "This collection of handmade soft goods represents years of sewing with intention. From baby loveys and patchwork quilts to matching aprons for mama and mini, every piece is sewn by hand and made to last through years of use and love.",
    ctaTitle: "Interested in a custom piece?",
    ctaBody:
      "Every item Emily makes can be customized to your fabric, colors, and sizing preferences. Reach out to start a conversation.",
    ctaLabel: "get in touch",
  },
  other_work: {
    title: "Other Work",
    subtitle: "A full creative life — in mosaic, paint, clay, and wood.",
    intro:
      "Emily's creative practice extends far beyond any single medium. This section showcases a decade of making across mosaic art, acrylic painting, ceramics, woodwork, and garden installations. Every piece is an original.",
    quote:
      "“Creativity is not a single discipline. It is a practice, a habit, a way of seeing the world.”",
  },
  contact_page: {
    title: "Say Hello",
    subtitle: "Reach out with questions, commissions, or just to connect.",
    formTitle: "Send a message",
    thankYouTitle: "Thank you!",
    thankYouBody: "Your message is on its way. Emily typically responds within 1–2 business days.",
    detailsTitle: "Studio details",
    aboutEyebrow: "About the Designer",
    aboutTitle: "About the Designer",
    aboutBody:
      "Emily Seel is a Cabinet Designer based out of Portland, Oregon. She completed her Bachelor of Science in Industrial Design from The Art Institute of Seattle. While there, she focused her studies on designing and building products for children. She enjoys all kinds of creative mediums, including sewing, painting, carpentry, and ceramics. Emily also has a passion for nature and loves houseplants and gardening.",
    aboutImage: asset("emily-portrait-magenta.jpg"),
  },
  seo: {
    homeTitle: "Emily Seel Designs — Industrial Design Portfolio",
    homeDescription:
      "Industrial designer and multidisciplinary maker based in Portland, Oregon. Thoughtful, handmade products for children — where craft meets intention.",
    industrialDesignTitle: "Industrial Design — Emily Seel Designs",
    industrialDesignDescription:
      "Industrial design work by Emily Seel: thoughtful, handmade products for children.",
    softGoodsTitle: "Soft Goods — Emily Seel Designs",
    softGoodsDescription:
      "Handmade baby loveys, patchwork quilts, blankets, and children's aprons sewn with care by Emily Seel in Portland, Oregon.",
    otherWorkTitle: "Other Work — Emily Seel Designs",
    otherWorkDescription:
      "A decade of creative making across mosaic art, acrylic painting, ceramics, and woodwork by Emily Seel.",
    contactTitle: "Contact — Emily Seel Designs",
    contactDescription:
      "Get in touch with Emily Seel — questions, commissions, or custom handmade pieces. Based in Portland, Oregon.",
  },
  /** Internal: which collections the CMS manages (see useCollectionManaged). */
  cms_state: {
    projects: false,
    soft_goods: false,
    other_work: false,
  },
};

export type SiteSettings = typeof defaults;
export type SettingsKey = keyof SiteSettings;

export const defaultSettings: SiteSettings = defaults;

export const SETTINGS_SECTIONS: SectionDef[] = [
  {
    key: "general",
    title: "General",
    description: "Site name, logo, favicon and footer text.",
    group: "Site",
    fields: [
      { key: "siteName", label: "Website name", type: "text", required: true },
      {
        key: "logoUrl",
        label: "Logo",
        type: "image",
        help: "PNG with transparent background works best.",
      },
      {
        key: "faviconUrl",
        label: "Favicon",
        type: "image",
        help: "Square PNG or ICO, at least 64×64.",
      },
      { key: "footerTagline", label: "Footer tagline", type: "textarea", rows: 2 },
      { key: "copyright", label: "Copyright text", type: "text" },
    ],
  },
  {
    key: "contact",
    title: "Contact details",
    description: "Shown in the navigation, footer and contact page.",
    group: "Site",
    fields: [
      { key: "email", label: "Contact email", type: "email", required: true },
      { key: "instagramUrl", label: "Instagram URL", type: "url" },
      { key: "instagramHandle", label: "Instagram handle", type: "text" },
      { key: "location", label: "Location", type: "text" },
      { key: "responseTime", label: "Response time note", type: "text" },
    ],
  },
  {
    key: "navigation",
    title: "Navigation labels",
    description: "Menu labels in the header and footer.",
    group: "Site",
    fields: [
      { key: "home", label: "Home", type: "text", required: true },
      { key: "industrialDesign", label: "Industrial Design", type: "text", required: true },
      { key: "softGoods", label: "Soft Goods", type: "text", required: true },
      { key: "otherWork", label: "Other Work", type: "text", required: true },
      { key: "contact", label: "Contact", type: "text", required: true },
    ],
  },
  {
    key: "marquee",
    title: "Scrolling banner",
    description: "Words in the navy scrolling band on the home page.",
    group: "Site",
    fields: [{ key: "items", label: "Banner words", type: "list", help: "One per line." }],
  },
  {
    key: "home",
    title: "Home page",
    description: "Hero, work section and about strip.",
    group: "Pages",
    fields: [
      { key: "heroEyebrow", label: "Hero eyebrow", type: "text" },
      { key: "heroTitleLine1", label: "Hero title — line 1", type: "text" },
      { key: "heroTitleLine2", label: "Hero title — line 2", type: "text" },
      { key: "heroTitleEmphasis", label: "Hero title — highlighted word", type: "text" },
      { key: "heroIntro", label: "Hero introduction", type: "textarea", rows: 5 },
      { key: "heroCtaLabel", label: "Hero button label", type: "text" },
      { key: "heroImage", label: "Hero image", type: "image" },
      { key: "heroImageAlt", label: "Hero image description (alt text)", type: "text" },
      { key: "workTitle", label: "Work section title", type: "text" },
      { key: "workSubtitle", label: "Work section subtitle", type: "text" },
      { key: "aboutEyebrow", label: "About eyebrow", type: "text" },
      { key: "aboutTitle", label: "About title", type: "text" },
      { key: "aboutBody", label: "About text", type: "textarea", rows: 6 },
      { key: "aboutImage", label: "About portrait", type: "image" },
      { key: "aboutCtaLabel", label: "About button label", type: "text" },
      { key: "moreTitle", label: "'More from Emily' title", type: "text" },
      { key: "moreSubtitle", label: "'More from Emily' subtitle", type: "text" },
    ],
  },
  {
    key: "featured",
    title: "Featured link",
    description: "The companion-site card on the home page.",
    group: "Pages",
    fields: [
      { key: "enabled", label: "Show featured card", type: "boolean" },
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "title", label: "Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "text" },
      { key: "body", label: "Description", type: "textarea", rows: 3 },
      { key: "url", label: "Link URL", type: "url" },
      { key: "ctaLabel", label: "Button label", type: "text" },
    ],
  },
  {
    key: "industrial_design",
    title: "Industrial Design page",
    description: "Page header.",
    group: "Pages",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "text" },
    ],
  },
  {
    key: "soft_goods",
    title: "Soft Goods page",
    description: "Header and call-to-action band.",
    group: "Pages",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "text" },
      { key: "intro", label: "Introduction", type: "textarea", rows: 4 },
      { key: "ctaTitle", label: "Call-to-action title", type: "text" },
      { key: "ctaBody", label: "Call-to-action text", type: "textarea", rows: 3 },
      { key: "ctaLabel", label: "Call-to-action button", type: "text" },
    ],
  },
  {
    key: "other_work",
    title: "Other Work page",
    description: "Header and closing quote.",
    group: "Pages",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "text" },
      { key: "intro", label: "Introduction", type: "textarea", rows: 4 },
      { key: "quote", label: "Quote", type: "textarea", rows: 3 },
    ],
  },
  {
    key: "contact_page",
    title: "Contact page",
    description: "Header, form copy and about section.",
    group: "Pages",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "text" },
      { key: "formTitle", label: "Form title", type: "text" },
      { key: "thankYouTitle", label: "Thank-you title", type: "text" },
      { key: "thankYouBody", label: "Thank-you message", type: "textarea", rows: 2 },
      { key: "detailsTitle", label: "Details card title", type: "text" },
      { key: "aboutEyebrow", label: "About eyebrow", type: "text" },
      { key: "aboutTitle", label: "About title", type: "text" },
      { key: "aboutBody", label: "About text", type: "textarea", rows: 6 },
      { key: "aboutImage", label: "About portrait", type: "image" },
    ],
  },
  {
    key: "seo",
    title: "Search engine (SEO)",
    description: "Browser tab titles and search descriptions for each page.",
    group: "SEO",
    fields: [
      { key: "homeTitle", label: "Home — title", type: "text" },
      { key: "homeDescription", label: "Home — description", type: "textarea", rows: 2 },
      { key: "industrialDesignTitle", label: "Industrial Design — title", type: "text" },
      {
        key: "industrialDesignDescription",
        label: "Industrial Design — description",
        type: "textarea",
        rows: 2,
      },
      { key: "softGoodsTitle", label: "Soft Goods — title", type: "text" },
      { key: "softGoodsDescription", label: "Soft Goods — description", type: "textarea", rows: 2 },
      { key: "otherWorkTitle", label: "Other Work — title", type: "text" },
      { key: "otherWorkDescription", label: "Other Work — description", type: "textarea", rows: 2 },
      { key: "contactTitle", label: "Contact — title", type: "text" },
      { key: "contactDescription", label: "Contact — description", type: "textarea", rows: 2 },
    ],
  },
];

const imageFields = new Set(
  SETTINGS_SECTIONS.flatMap((s) =>
    s.fields.filter((f) => f.type === "image").map((f) => `${s.key}.${f.key}`),
  ),
);

/**
 * Merge stored rows over the defaults. Only keys known to the defaults are
 * accepted and only when the stored value has the same type. Empty image
 * fields fall back to the bundled default image.
 */
export function mergeSettings(rows: Array<{ key: string; value: unknown }>): SiteSettings {
  const out = structuredClone(defaultSettings) as Record<string, Record<string, unknown>>;
  for (const row of rows) {
    const section = out[row.key];
    if (!section || !row.value || typeof row.value !== "object") continue;
    for (const [k, v] of Object.entries(row.value as Record<string, unknown>)) {
      if (!(k in section)) continue;
      const def = section[k];
      if (Array.isArray(def)) {
        if (Array.isArray(v)) section[k] = v.filter((x) => typeof x === "string");
      } else if (typeof v === typeof def) {
        if (imageFields.has(`${row.key}.${k}`) && v === "") continue;
        section[k] = v;
      }
    }
  }
  return out as unknown as SiteSettings;
}
