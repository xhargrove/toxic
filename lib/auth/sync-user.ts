import type { User as SupabaseAuthUser } from "@supabase/supabase-js";

import {
  findAppUserByEmail,
  findAppUserBySupabaseId,
  findAppUserByUsername,
} from "@/lib/db/app-user";
import { prisma } from "@/lib/db/prisma";

function usernameFromMetadata(metadata: SupabaseAuthUser["user_metadata"]): string | null {
  const raw = metadata?.username;
  return typeof raw === "string" ? raw : null;
}

/** Alphanumeric + underscore, 3–24 chars (matches sign-up validation). */
function slugFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "user";
  let cleaned = local.replace(/[^a-zA-Z0-9_]/g, "_").replace(/_+/g, "_");
  cleaned = cleaned.replace(/^_|_$/g, "");
  if (cleaned.length < 3) {
    cleaned = `usr_${cleaned}`.replace(/[^a-zA-Z0-9_]/g, "_").slice(0, 24);
  }
  return cleaned.slice(0, 24);
}

async function ensureUniqueUsername(preferred: string, email: string): Promise<string> {
  let candidate = preferred.slice(0, 24);
  for (let i = 0; i < 12; i++) {
    const taken = await findAppUserByUsername(candidate);
    if (!taken) {
      return candidate;
    }
    const suffix = `_${i + 1}`;
    const base = slugFromEmail(email).slice(0, Math.max(1, 24 - suffix.length));
    candidate = `${base}${suffix}`.slice(0, 24);
  }
  return `${slugFromEmail(email).slice(0, 12)}_${Date.now().toString(36)}`.slice(0, 24);
}

/**
 * Links Supabase Auth to Prisma `User`: matches `supabaseUserId`, then email, else creates a row.
 * Required DB fields (`username`, `displayName`) are derived from metadata or email when needed.
 */
export async function syncUserFromSupabase(authUser: SupabaseAuthUser): Promise<void> {
  const email = authUser.email;
  if (!email) {
    throw new Error("Cannot sync user without email");
  }

  const metaUsername = usernameFromMetadata(authUser.user_metadata);

  const existingByAuth = await findAppUserBySupabaseId(authUser.id);

  if (existingByAuth) {
    await prisma.user.update({
      where: { id: existingByAuth.id },
      data: {
        email,
      },
      select: { id: true },
    });
    return;
  }

  const existingByEmail = await findAppUserByEmail(email);

  if (existingByEmail) {
    await prisma.user.update({
      where: { id: existingByEmail.id },
      data: {
        supabaseUserId: authUser.id,
        email,
      },
      select: { id: true },
    });
    return;
  }

  const username = await ensureUniqueUsername(
    metaUsername ?? slugFromEmail(email),
    email
  );
  const displayName = metaUsername ?? username;

  // Omit `onboardingCompletedAt` so INSERT works before the column is migrated (column defaults to NULL once added).
  await prisma.user.create({
    data: {
      supabaseUserId: authUser.id,
      email,
      username,
      displayName,
    },
  });
}
