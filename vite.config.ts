import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig(({ mode }) => {
  // Load ALL env vars (not only VITE_*), from .env files and the host
  // environment (e.g. Vercel). The Vercel ↔ Supabase integration creates
  // SUPABASE_URL / NEXT_PUBLIC_SUPABASE_* names, which Vite would otherwise
  // ignore — so accept those as fallbacks. Only PUBLIC values are read here;
  // the service-role key is never used.
  const env = { ...loadEnv(mode, process.cwd(), ""), ...process.env };
  const pick = (...keys: string[]) => keys.map((k) => env[k]).find((v) => v && v.trim()) ?? "";

  const supabaseUrl = pick(
    "VITE_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_URL",
  );
  const supabaseAnonKey = pick(
    "VITE_SUPABASE_ANON_KEY",
    "VITE_SUPABASE_PUBLISHABLE_KEY",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    "SUPABASE_ANON_KEY",
    "SUPABASE_PUBLISHABLE_KEY",
  );

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(supabaseUrl),
      "import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(supabaseAnonKey),
    },
    server: {
      host: "::",
      port: 8080,
    },
  };
});
