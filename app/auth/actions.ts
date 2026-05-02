"use server";

import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";

import { sanitizeNextPath } from "@/lib/auth/redirect-path";
import { syncUserFromSupabase } from "@/lib/auth/sync-user";
import { prisma } from "@/lib/db/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { usernameSchema } from "@/lib/validation/auth";

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

export type UsernameAvailabilityState = { available: true } | { available: false; error: string };

export async function checkUsernameAvailability(username: string): Promise<UsernameAvailabilityState> {
  const parsed = usernameSchema.safeParse(username);
  if (!parsed.success) {
    return {
      available: false,
      error: parsed.error.issues[0]?.message ?? "Choose a valid username.",
    };
  }

  const existing = await prisma.user.findUnique({
    where: { username: parsed.data },
    select: { id: true },
  });

  if (existing) {
    return { available: false, error: "That username is already taken." };
  }

  return { available: true };
}
