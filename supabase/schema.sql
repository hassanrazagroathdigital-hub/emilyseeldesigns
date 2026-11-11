-- =============================================================================
-- Emily Seel Designs — CMS schema
-- =============================================================================
-- Run this whole file once in Supabase Dashboard → SQL Editor → New query.
--
-- It is idempotent and NON-DESTRUCTIVE: it never drops tables or deletes rows.
-- Re-running it after an update is safe (tables use IF NOT EXISTS, functions
-- use CREATE OR REPLACE, policies are dropped-and-recreated by name only).
--
-- Security model
--   • anon / public visitors  → read PUBLISHED content + site settings,
--                               submit inquiries ONLY through submit_inquiry().
--   • authenticated non-admin → same as anon. Logging in grants nothing.
--   • admins                  → users listed in public.admin_users. Full CMS.
--   The admin allowlist can only be changed from the SQL editor / service role.
-- =============================================================================

create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- Helpers
-- -----------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Admin allowlist
-- -----------------------------------------------------------------------------

create table if not exists public.admin_users (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

-- SECURITY DEFINER so it can read admin_users regardless of the caller's RLS.
-- search_path pinned to prevent hijacking.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users where user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- Admins may see the allowlist (read-only). Nobody can modify it through the
-- API: there are deliberately no insert/update/delete policies.
drop policy if exists "admin_users: admins read" on public.admin_users;
create policy "admin_users: admins read" on public.admin_users
  for select to authenticated
  using (public.is_admin());

revoke insert, update, delete on public.admin_users from anon, authenticated;

-- -----------------------------------------------------------------------------
-- Projects (Industrial Design work)
-- -----------------------------------------------------------------------------
-- gallery: ordered JSON array of slides:
--   [{ "url": text, "path": text|null, "alt": text,
--      "fit": "cover"|"contain", "enhance": bool,
--      "position": "center"|"top"|"bottom", "bg": text|null }]

create table if not exists public.projects (
  id           uuid primary key default gen_random_uuid(),
  title        text not null check (char_length(title) between 1 and 200),
  slug         text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description  text not null default '',
  category     text not null default 'industrial-design',
  tags         text[] not null default '{}',
  cover_image  text,
  gallery      jsonb not null default '[]'::jsonb check (jsonb_typeof(gallery) = 'array'),
  featured     boolean not null default true,   -- shown on the home page
  published    boolean not null default false,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists projects_public_idx
  on public.projects (published, sort_order);

drop trigger if exists projects_updated_at on public.projects;
create trigger projects_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

alter table public.projects enable row level security;

drop policy if exists "projects: public read published" on public.projects;
create policy "projects: public read published" on public.projects
  for select to anon, authenticated
  using (published = true or public.is_admin());

drop policy if exists "projects: admin insert" on public.projects;
create policy "projects: admin insert" on public.projects
  for insert to authenticated with check (public.is_admin());

drop policy if exists "projects: admin update" on public.projects;
create policy "projects: admin update" on public.projects
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "projects: admin delete" on public.projects;
create policy "projects: admin delete" on public.projects
  for delete to authenticated using (public.is_admin());

-- -----------------------------------------------------------------------------
-- Gallery images (Soft Goods / Other Work pages)
-- -----------------------------------------------------------------------------

create table if not exists public.gallery_images (
  id           uuid primary key default gen_random_uuid(),
  collection   text not null check (collection in ('soft-goods', 'other-work')),
  image_url    text not null check (char_length(image_url) > 0),
  image_path   text,               -- storage object path when stored in cms-media
  alt          text not null default '',
  caption      text not null default '',
  seed_key     text unique,        -- stable id for imported default content
  published    boolean not null default true,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists gallery_images_public_idx
  on public.gallery_images (collection, published, sort_order);

drop trigger if exists gallery_images_updated_at on public.gallery_images;
create trigger gallery_images_updated_at
  before update on public.gallery_images
  for each row execute function public.set_updated_at();

alter table public.gallery_images enable row level security;

drop policy if exists "gallery: public read published" on public.gallery_images;
create policy "gallery: public read published" on public.gallery_images
  for select to anon, authenticated
  using (published = true or public.is_admin());

drop policy if exists "gallery: admin insert" on public.gallery_images;
create policy "gallery: admin insert" on public.gallery_images
  for insert to authenticated with check (public.is_admin());

drop policy if exists "gallery: admin update" on public.gallery_images;
create policy "gallery: admin update" on public.gallery_images
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "gallery: admin delete" on public.gallery_images;
create policy "gallery: admin delete" on public.gallery_images
  for delete to authenticated using (public.is_admin());

-- -----------------------------------------------------------------------------
-- Site settings — one row per section, value is a JSON object.
-- Saving one section never touches the others.
-- -----------------------------------------------------------------------------

create table if not exists public.site_settings (
  key        text primary key check (key ~ '^[a-z][a-z0-9_]*$'),
  value      jsonb not null default '{}'::jsonb check (jsonb_typeof(value) = 'object'),
  updated_at timestamptz not null default now()
);

drop trigger if exists site_settings_updated_at on public.site_settings;
create trigger site_settings_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

alter table public.site_settings enable row level security;

-- Settings are public website copy (no secrets live here).
drop policy if exists "settings: public read" on public.site_settings;
create policy "settings: public read" on public.site_settings
  for select to anon, authenticated using (true);

drop policy if exists "settings: admin insert" on public.site_settings;
create policy "settings: admin insert" on public.site_settings
  for insert to authenticated with check (public.is_admin());

drop policy if exists "settings: admin update" on public.site_settings;
create policy "settings: admin update" on public.site_settings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "settings: admin delete" on public.site_settings;
create policy "settings: admin delete" on public.site_settings
  for delete to authenticated using (public.is_admin());

-- Merge a partial object into one section (keys not in `patch` are preserved).
create or replace function public.merge_site_setting(p_key text, p_patch jsonb)
returns jsonb
language plpgsql
security invoker            -- RLS above still applies: only admins succeed
set search_path = public
as $$
declare
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  if jsonb_typeof(p_patch) <> 'object' then
    raise exception 'patch must be a JSON object' using errcode = '22023';
  end if;

  insert into public.site_settings as s (key, value)
  values (p_key, p_patch)
  on conflict (key) do update
    set value = s.value || excluded.value
  returning value into result;

  return result;
end;
$$;

revoke all on function public.merge_site_setting(text, jsonb) from public, anon;
grant execute on function public.merge_site_setting(text, jsonb) to authenticated;

-- -----------------------------------------------------------------------------
-- Inquiries (contact form)
-- -----------------------------------------------------------------------------

create table if not exists public.inquiries (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 1 and 120),
  email       text not null check (char_length(email) between 3 and 254),
  phone       text check (phone is null or char_length(phone) <= 40),
  subject     text not null default '' check (char_length(subject) <= 200),
  message     text not null check (char_length(message) between 1 and 5000),
  status      text not null default 'new'
              check (status in ('new', 'in_progress', 'replied', 'archived')),
  is_read     boolean not null default false,
  source_ip   text,               -- used only for rate limiting
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists inquiries_created_idx on public.inquiries (created_at desc);
create index if not exists inquiries_email_created_idx on public.inquiries (lower(email), created_at desc);
create index if not exists inquiries_ip_created_idx on public.inquiries (source_ip, created_at desc);

drop trigger if exists inquiries_updated_at on public.inquiries;
create trigger inquiries_updated_at
  before update on public.inquiries
  for each row execute function public.set_updated_at();

alter table public.inquiries enable row level security;

-- Only admins can read / update / delete. There is NO insert policy:
-- the public submits through submit_inquiry() below.
drop policy if exists "inquiries: admin read" on public.inquiries;
create policy "inquiries: admin read" on public.inquiries
  for select to authenticated using (public.is_admin());

drop policy if exists "inquiries: admin update" on public.inquiries;
create policy "inquiries: admin update" on public.inquiries
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "inquiries: admin delete" on public.inquiries;
create policy "inquiries: admin delete" on public.inquiries
  for delete to authenticated using (public.is_admin());

revoke insert on public.inquiries from anon, authenticated;

-- Validated, rate-limited public submission. Returns only the new id —
-- it never exposes other inquiries.
create or replace function public.submit_inquiry(
  p_name    text,
  p_email   text,
  p_message text,
  p_subject text default '',
  p_phone   text default null,
  p_website text default ''          -- honeypot: real users leave it empty
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name    text := btrim(coalesce(p_name, ''));
  v_email   text := lower(btrim(coalesce(p_email, '')));
  v_message text := btrim(coalesce(p_message, ''));
  v_subject text := btrim(coalesce(p_subject, ''));
  v_phone   text := nullif(btrim(coalesce(p_phone, '')), '');
  v_ip      text;
  v_id      uuid;
begin
  -- Honeypot: pretend success, store nothing.
  if coalesce(btrim(p_website), '') <> '' then
    return gen_random_uuid();
  end if;

  if char_length(v_name) < 1 or char_length(v_name) > 120 then
    raise exception 'Please enter your name (max 120 characters).' using errcode = '22023';
  end if;
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' or char_length(v_email) > 254 then
    raise exception 'Please enter a valid email address.' using errcode = '22023';
  end if;
  if char_length(v_message) < 1 or char_length(v_message) > 5000 then
    raise exception 'Please enter a message (max 5000 characters).' using errcode = '22023';
  end if;
  if char_length(v_subject) > 200 then
    raise exception 'Subject is too long (max 200 characters).' using errcode = '22023';
  end if;
  if v_phone is not null and char_length(v_phone) > 40 then
    raise exception 'Phone number is too long.' using errcode = '22023';
  end if;

  -- Best-effort client IP from the PostgREST request headers.
  begin
    v_ip := split_part(
      coalesce(
        current_setting('request.headers', true)::json ->> 'cf-connecting-ip',
        current_setting('request.headers', true)::json ->> 'x-real-ip',
        current_setting('request.headers', true)::json ->> 'x-forwarded-for'
      ), ',', 1);
    v_ip := nullif(btrim(v_ip), '');
  exception when others then
    v_ip := null;
  end;

  -- Rate limits: 3 per email / 10 min, 5 per IP / 10 min, 100 site-wide / hour.
  if (select count(*) from public.inquiries
        where lower(email) = v_email and created_at > now() - interval '10 minutes') >= 3
     or (v_ip is not null and (select count(*) from public.inquiries
        where source_ip = v_ip and created_at > now() - interval '10 minutes') >= 5)
     or (select count(*) from public.inquiries
        where created_at > now() - interval '1 hour') >= 100
  then
    raise exception 'Too many messages. Please wait a few minutes and try again.'
      using errcode = 'P0429';
  end if;

  insert into public.inquiries (name, email, phone, subject, message, source_ip)
  values (v_name, v_email, v_phone, v_subject, v_message, v_ip)
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.submit_inquiry(text, text, text, text, text, text) from public;
grant execute on function public.submit_inquiry(text, text, text, text, text, text) to anon, authenticated;

-- Dashboard counters in one round-trip (admins only).
create or replace function public.cms_stats()
returns jsonb
language plpgsql
stable
security invoker
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  return jsonb_build_object(
    'projects_total',      (select count(*) from public.projects),
    'projects_published',  (select count(*) from public.projects where published),
    'projects_draft',      (select count(*) from public.projects where not published),
    'gallery_total',       (select count(*) from public.gallery_images),
    'gallery_soft_goods',  (select count(*) from public.gallery_images where collection = 'soft-goods'),
    'gallery_other_work',  (select count(*) from public.gallery_images where collection = 'other-work'),
    'gallery_hidden',      (select count(*) from public.gallery_images where not published),
    'inquiries_total',     (select count(*) from public.inquiries),
    'inquiries_unread',    (select count(*) from public.inquiries where not is_read),
    'inquiries_new',       (select count(*) from public.inquiries where status = 'new')
  );
end;
$$;

revoke all on function public.cms_stats() from public, anon;
grant execute on function public.cms_stats() to authenticated;

-- -----------------------------------------------------------------------------
-- Storage: cms-media bucket (public read, admin write, images only, 10 MB)
-- -----------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'cms-media', 'cms-media', true, 10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/x-icon', 'image/vnd.microsoft.icon']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Public bucket → files are served by URL without a SELECT policy. We still
-- restrict *listing* the bucket to admins.
drop policy if exists "cms-media: admin list" on storage.objects;
create policy "cms-media: admin list" on storage.objects
  for select to authenticated
  using (bucket_id = 'cms-media' and public.is_admin());

drop policy if exists "cms-media: admin upload" on storage.objects;
create policy "cms-media: admin upload" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'cms-media' and public.is_admin());

drop policy if exists "cms-media: admin update" on storage.objects;
create policy "cms-media: admin update" on storage.objects
  for update to authenticated
  using (bucket_id = 'cms-media' and public.is_admin())
  with check (bucket_id = 'cms-media' and public.is_admin());

drop policy if exists "cms-media: admin delete" on storage.objects;
create policy "cms-media: admin delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'cms-media' and public.is_admin());

-- =============================================================================
-- FIRST ADMIN (run separately, after creating the user in Authentication → Users)
-- =============================================================================
-- insert into public.admin_users (user_id)
-- select id from auth.users where email = 'you@example.com'
-- on conflict do nothing;
-- =============================================================================
