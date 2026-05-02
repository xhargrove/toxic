import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-only Supabase client. Does **not** import `lib/env.ts` so the client bundle never
 * executes server-only env validation (service role, DATABASE_URL, etc.).
 */
export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  return createBrowserClient(url, anonKey);
}
