"use server";

import { revalidatePath } from "next/cache";

import { Prisma } from "@prisma/client";

import { requireCompleteProfile } from "@/lib/auth/onboarding";
import { prisma } from "@/lib/db/prisma";
import { notifyNewFollower } from "@/lib/notifications/create";
import { parsePostIdParam } from "@/lib/validation/interactions";

export type FollowActionState = { error?: string } | null;

export async function followUserAction(_prev: FollowActionState, formData: FormData): Promise<FollowActionState> {
  const targetId = parsePostIdParam(formData.get("followingId"));
  if (!targetId) {
    return { error: "Invalid profile." };
  }

  const dbUser = await requireCompleteProfile(`/profile/${String(formData.get("username") ?? "")}`);

  if (targetId === dbUser.id) {
    return { error: "You cannot follow yourself." };
  }

  const target = await prisma.user.findUnique({
    where: { id: targetId },
    select: { id: true, username: true },
  });
  if (!target) {
    return { error: "User not found." };
  }

  try {
    await prisma.userFollow.create({
      data: {
        followerId: dbUser.id,
        followingId: targetId,
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: "Already following." };
    }
    throw e;
  }

  await notifyNewFollower({
    recipientUserId: targetId,
    followerDisplayName: dbUser.displayName,
    followerUsername: dbUser.username,
  });

  revalidatePath(`/profile/${target.username}`);
  revalidatePath("/notifications");
  return null;
}

export async function unfollowUserAction(_prev: FollowActionState, formData: FormData): Promise<FollowActionState> {
  const targetId = parsePostIdParam(formData.get("followingId"));
  if (!targetId) {
    return { error: "Invalid profile." };
  }

  const dbUser = await requireCompleteProfile(`/profile/${String(formData.get("username") ?? "")}`);

  const target = await prisma.user.findUnique({
    where: { id: targetId },
    select: { username: true },
  });

  await prisma.userFollow.deleteMany({
    where: {
      followerId: dbUser.id,
      followingId: targetId,
    },
  });

  if (target) {
    revalidatePath(`/profile/${target.username}`);
  }
  return null;
}
