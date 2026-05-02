import { redirect } from "next/navigation";

import type { User } from "@prisma/client";
import { sanitizeNextPath } from "@/lib/auth/redirect-path";
import { syncUserFromSupabase } from "@/lib/auth/sync-user";
import { findAppUserBySupabaseId } from "@/lib/db/app-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Authenticated Supabase user must have a linked Prisma row (after sync).
 */
export async function requireDbUser(returnPath: string): Promise<User> {
  const next = sanitizeNextPath(returnPath);
  const supabase = await createSupabaseServerClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  const dbUser = await findAppUserBySupabaseId(authUser.id);

  if (dbUser) {
    return dbUser;
  }

  try {
    await syncUserFromSupabase(authUser);
  } catch {
    await supabase.auth.signOut();
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  const repairedDbUser = await findAppUserBySupabaseId(authUser.id);

  if (!repairedDbUser) {
    await supabase.auth.signOut();
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  return repairedDbUser;
}
