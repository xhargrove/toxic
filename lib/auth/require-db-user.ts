import { redirect } from "next/navigation";

import { prisma } from "@/lib/db/prisma";

import { requireUser } from "@/lib/auth/require-user";
import type { User } from "@prisma/client";

/**
 * Authenticated Supabase user must have a linked Prisma row (after sync).
 */
export async function requireDbUser(returnPath: string): Promise<User> {
  const authUser = await requireUser(returnPath);
  const dbUser = await prisma.user.findFirst({
    where: { supabaseUserId: authUser.id },
  });

  if (!dbUser) {
    redirect(`/login?next=${encodeURIComponent(returnPath)}`);
  }

  return dbUser;
}
