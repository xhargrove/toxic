import { Prisma } from "@prisma/client";
import type { User } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";

/** Scalar columns on `User` before `onboardingCompletedAt` existed (read fallback when DB is not migrated). */
export const USER_LEGACY_SELECT = {
  id: true,
  supabaseUserId: true,
  email: true,
  username: true,
  createdAt: true,
  updatedAt: true,
  avatarUrl: true,
  bio: true,
  displayName: true,
  homeCityId: true,
  role: true,
} as const;

export type LegacyUserRow = Prisma.UserGetPayload<{ select: typeof USER_LEGACY_SELECT }>;

export function isPrismaMissingOnboardingColumn(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2022" &&
    typeof error.meta?.column === "string" &&
    error.meta.column.includes("onboardingCompletedAt")
  );
}

export function legacyRowToUser(row: LegacyUserRow): User {
  return { ...row, onboardingCompletedAt: null } as User;
}

export async function findAppUserBySupabaseId(supabaseUserId: string): Promise<User | null> {
  try {
    return await prisma.user.findFirst({
      where: { supabaseUserId },
    });
  } catch (e) {
    if (isPrismaMissingOnboardingColumn(e)) {
      const row = await prisma.user.findFirst({
        where: { supabaseUserId },
        select: USER_LEGACY_SELECT,
      });
      return row ? legacyRowToUser(row) : null;
    }
    throw e;
  }
}

export async function findAppUserByEmail(email: string): Promise<User | null> {
  try {
    return await prisma.user.findUnique({
      where: { email },
    });
  } catch (e) {
    if (isPrismaMissingOnboardingColumn(e)) {
      const row = await prisma.user.findUnique({
        where: { email },
        select: USER_LEGACY_SELECT,
      });
      return row ? legacyRowToUser(row) : null;
    }
    throw e;
  }
}

export async function findAppUserByUsername(username: string): Promise<User | null> {
  try {
    return await prisma.user.findUnique({
      where: { username },
    });
  } catch (e) {
    if (isPrismaMissingOnboardingColumn(e)) {
      const row = await prisma.user.findUnique({
        where: { username },
        select: USER_LEGACY_SELECT,
      });
      return row ? legacyRowToUser(row) : null;
    }
    throw e;
  }
}
