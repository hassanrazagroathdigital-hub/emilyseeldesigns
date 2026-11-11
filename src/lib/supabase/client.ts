import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "./config";

/**
 * Full Supabase client (auth, storage, database) for the ADMIN dashboard.
 * Only imported from lazily-loaded admin code, so public visitors never
 * download it. Public pages use ./public-client.ts.
 */
export { isSupabaseConfigured, supabaseAnonKey, supabaseUrl };

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY and rebuild.",
    );
  }
  return supabase;
}
