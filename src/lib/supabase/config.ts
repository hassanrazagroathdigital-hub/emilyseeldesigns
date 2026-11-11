/**
 * Supabase connection settings (public values only).
 *
 * The project URL and the anon/publishable key are designed to be shipped to
 * the browser. Security is enforced by Row Level Security in the database
 * (supabase/schema.sql) — never by hiding this key.
 * NEVER put a service-role key in a VITE_ variable.
 */
export const supabaseUrl = ((import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? "")
  .trim()
  .replace(/\/+$/, "");
export const supabaseAnonKey = (
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? ""
).trim();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
