import { PostgrestClient } from "@supabase/postgrest-js";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "./config";

/**
 * Lightweight, anonymous database client for the PUBLIC website.
 *
 * Only PostgREST (tables + RPC) — no auth/realtime/storage code — so visitors
 * download far less JavaScript. It always acts as the `anon` role, so RLS
 * limits it to published content and the submit_inquiry() function.
 * The admin dashboard uses the full client in ./client.ts instead.
 */
const REQUEST_TIMEOUT_MS = 6000;

/** Abort hung requests so pages fall back to built-in content instead of spinning. */
const fetchWithTimeout: typeof fetch = (input, init) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  init?.signal?.addEventListener("abort", () => controller.abort());
  return fetch(input, { ...init, signal: controller.signal }).finally(() => clearTimeout(timer));
};

export const publicDb: PostgrestClient | null = isSupabaseConfigured
  ? new PostgrestClient(`${supabaseUrl}/rest/v1`, {
      headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` },
      fetch: fetchWithTimeout,
    })
  : null;
