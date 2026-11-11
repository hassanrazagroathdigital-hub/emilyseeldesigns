# Website CMS — Setup & Handover

The site has a private admin dashboard at **`/admin`** where the owner can edit
projects, gallery images, inquiries and all website text without touching code.
It runs on **Supabase** (database, login, image storage).

Until Supabase is connected, the public website keeps working with its
built-in content, and `/admin` shows a "CMS not connected" screen.

---

## 1. Create the Supabase project

1. Sign in at <https://supabase.com> → **New project**. Pick a region close to
   your visitors and save the database password somewhere safe.
2. When it's ready, open **Project Settings → API** (or the **Connect** button)
   and copy:
   - **Project URL** — `https://xxxx.supabase.co`
   - **anon / publishable key** — the *public* key.

   Do **not** copy the `service_role` / secret key anywhere in this project.

## 2. Install the database schema

1. In Supabase, open **SQL Editor → New query**.
2. Paste the whole of [`supabase/schema.sql`](supabase/schema.sql) and click **Run**.

This creates the tables, security rules (RLS), the `cms-media` image bucket and
its access rules. It never deletes data and is safe to run again after updates.

## 3. Create the first administrator

Logging in does **not** make someone an admin. Admins are listed in the
`admin_users` table, which can only be changed from the Supabase dashboard.

1. **Authentication → Users → Add user → Create new user.** Enter the owner's
   email and a strong password, and tick **Auto Confirm User**.
2. In **SQL Editor**, run (with the real email):

   ```sql
   insert into public.admin_users (user_id)
   select id from auth.users where email = 'owner@example.com'
   on conflict do nothing;
   ```

To remove an admin: `delete from public.admin_users where user_id = (select id from auth.users where email = '…');`

**Recommended:** in **Authentication → Sign In / Providers → Email**, turn off
**Allow new users to sign up**. Even if someone signs up, they get no CMS access,
but there's no reason to allow it.

**Password reset emails:** in **Authentication → URL Configuration**, set
**Site URL** to your live domain and add `https://YOUR-DOMAIN/admin/reset-password`
(and `http://localhost:8080/admin/reset-password` for local testing) to
**Redirect URLs**.

## 4. Configure environment variables

**Local development** — copy `.env.example` to `.env` and fill in the two values:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-or-publishable-key
```

Then `npm install` and `npm run dev`, and open <http://localhost:8080/admin>.

**Production (Vercel)** — Project → **Settings → Environment Variables**, add the
same two variables for *Production* (and *Preview* if you use it), then
**redeploy**. Vite bakes these values in at build time, so any change needs a
new deploy.

`.env` files are git-ignored. Never commit real keys.

## 5. First login & importing the current content

1. Go to `/admin`, sign in.
2. The Dashboard offers **Import site content**. This uploads the site's current
   images to the media library and creates the 7 projects and 39 gallery images
   as editable records. It only adds what's missing — it never edits or deletes
   anything — so it's safe to run again if interrupted.
3. Website text (hero, about, footer, SEO…) doesn't need importing: the
   Settings screens show the current text and you only save what you change.

---

## What the owner can manage

| Area | Where it appears | What can be done |
|---|---|---|
| **Projects** | Home page work grid, Industrial Design page | Create, edit, delete, publish/unpublish, show/hide on home page, reorder, cover image, multi-image carousel (alt text, fit, focus, contrast boost, background) |
| **Galleries** | Soft Goods and Other Work pages | Bulk upload, reorder, hide/show, alt text & caption, remove |
| **Inquiries** | Contact form submissions | Search, filter by status/unread, read, mark read/unread, set status, reply by email, delete |
| **Media Library** | All uploaded images | Browse, upload, copy URL, see where each file is used, delete unused files, one-click cleanup of unused files |
| **Website Settings** | Everywhere | Site name, logo, favicon, contact email, Instagram, location, nav labels, scrolling banner words, every heading/paragraph on each page, home hero & portrait images, featured-site card, SEO titles & descriptions |

The site has no blog, shop, services or FAQ sections, so those modules were
intentionally not added.

## How content behaves on the public site

- Only **published** items are shown (enforced by the database, not just the UI).
- Changes appear on the site within about a minute (or on page refresh).
- If Supabase is unreachable, pages fall back to the built-in content after at
  most ~6 seconds — the site never breaks.
- Before a collection is managed in the CMS, the site shows the built-in
  content. Once you add/import/delete items in it, the database is the only
  source (built-in and CMS content are never mixed).
- The contact form saves messages to the CMS **and** still sends the email
  notification through Formspree, as before.

## Security model

- Supabase's anon key is public by design. **Row Level Security is the security
  boundary** — every table has RLS enabled.
- Visitors can read published content and settings, and submit inquiries only
  through the `submit_inquiry()` function (validated, honeypot-protected,
  rate-limited: 3/email and 5/IP per 10 minutes, 100/hour site-wide). They
  cannot read any inquiry.
- Signed-in users who are not in `admin_users` get **no** extra access.
- Only admins can write content, read inquiries, change settings, and
  upload/delete files in `cms-media`. The admin list itself cannot be changed
  through the API.
- Uploads are limited to JPG, PNG, WebP, GIF (and ICO for favicons), max 10 MB.
  SVG is not allowed. Large photos are resized/compressed in the browser first.
- No secret keys exist in the frontend.

## Images & cleanup

- Replacing an image uploads the new file first; the old one is kept.
- Deleting content never deletes its files (they might be reused).
- **Media Library → Clean up unused** deletes only files not referenced by any
  project, gallery image or setting, and re-checks right before deleting.

## Files

**New**
- `supabase/schema.sql` — database, RLS, storage
- `src/lib/supabase/` — `config.ts`, `public-client.ts` (light, visitors), `client.ts` (full, admin)
- `src/lib/cms/` — `types.ts`, `defaults.ts` (built-in content), `settings.ts` (settings schema + defaults), `public.ts` (visitor data hooks), `admin.ts` (admin queries/mutations), `media.ts` (uploads), `seed.ts` (importer), `slug.ts`
- `src/components/admin/` — `AdminShell`, `auth`, `ui`, `ImageField`, `SlidesEditor`
- `src/routes/admin/` — `AdminApp`, `login`, `reset-password`, `dashboard`, `projects`, `project-editor`, `galleries`, `inquiries`, `media`, `settings`
- `src/components/ProjectGrid.tsx`, `MasonryGallery.tsx`, `SiteHead.tsx`
- `.env.example`, `CMS_SETUP.md`

**Changed** (same design, now CMS-driven)
- `src/main.tsx` (React Query provider), `src/App.tsx` (lazy `/admin` route)
- `src/routes/*.tsx`, `Nav.tsx`, `Footer.tsx`, `Logo.tsx`, `Marquee.tsx`
- `package.json` (+ `@supabase/supabase-js`, `@supabase/postgrest-js`), `.gitignore` (ignore `.env`)

## Testing checklist after setup

1. `/admin` → sign in with the admin account → Dashboard shows real counts.
2. Import site content → Projects shows 7, Galleries 30 + 9.
3. Edit a project's description → Save → refresh `/industrial-design`: change visible.
4. Unpublish a project → it disappears from the site; publish → it returns.
5. Upload a gallery image → appears on its page; hide it → disappears.
6. Change a heading in Settings → refresh the page: change visible.
7. Submit the contact form in a private window → it appears in Inquiries (unread).
8. Create a second (non-admin) user and sign in → "Not an administrator" screen.
9. Log out → visiting `/admin/projects` redirects to the login page.
