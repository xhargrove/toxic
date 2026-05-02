import { redirect } from "next/navigation";

import { sanitizeNextPath } from "@/lib/auth/redirect-path";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Server-only guard for mutations and protected Server Components.
 * Pass the path being accessed so login can deep-link back (`?next=`).
 */
export async function requireUser(returnPath: string = "/home") {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const next = sanitizeNextPath(returnPath);
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  return user;
}
