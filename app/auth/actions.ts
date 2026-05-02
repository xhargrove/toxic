"use server";

import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";

import { sanitizeNextPath } from "@/lib/auth/redirect-path";
import { syncUserFromSupabase } from "@/lib/auth/sync-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AuthFinalizeState = { error?: string } | null;

function mapPrismaUserError(e: unknown): string | null {
  if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
    return "That email or username is already taken.";
  }
  return null;
}

/**
 * Call after browser `signInWithPassword` / `signUp` so cookies are written; syncs Prisma `User`, then redirects.
 */
export async function finalizeAuthSession(nextPath: string): Promise<AuthFinalizeState> {
  const next = sanitizeNextPath(nextPath);
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Session not available. Try signing in again." };
  }

  try {
    await syncUserFromSupabase(user);
  } catch (e) {
    const mapped = mapPrismaUserError(e);
    if (mapped) {
      return { error: mapped };
    }
    throw e;
  }

  redirect(next);
}
