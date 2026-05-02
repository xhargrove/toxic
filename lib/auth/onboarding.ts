import "server-only";

import { redirect } from "next/navigation";

import type { User } from "@prisma/client";

import { requireDbUser } from "@/lib/auth/require-db-user";

/**
 * App profile is complete once onboarding has been submitted successfully.
 * Username/displayName are validated at onboarding (see `lib/validation/user.ts`).
 */
export function isOnboardingComplete(user: Pick<User, "onboardingCompletedAt">): boolean {
  return user.onboardingCompletedAt != null;
}

/**
 * Requires Supabase session + Prisma user row + finished onboarding.
 */
export async function requireCompleteProfile(returnPath: string): Promise<User> {
  const dbUser = await requireDbUser(returnPath);
  if (!isOnboardingComplete(dbUser)) {
    redirect("/onboarding");
  }
  return dbUser;
}
