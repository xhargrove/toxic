import { redirect } from "next/navigation";

import { prisma } from "@/lib/db/prisma";
import { UserRole } from "@prisma/client";

import { requireUser } from "@/lib/auth/require-user";

/**
 * Admin UI — source of truth: **Prisma `User.role`** (`ADMIN` | `MODERATOR`).
 */
export async function requireAdmin(returnPath: string = "/admin") {
  const authUser = await requireUser(returnPath);
  const dbUser = await prisma.user.findFirst({
    where: { supabaseUserId: authUser.id },
  });

  if (!dbUser || (dbUser.role !== UserRole.ADMIN && dbUser.role !== UserRole.MODERATOR)) {
    redirect("/home");
  }

  return dbUser;
}
