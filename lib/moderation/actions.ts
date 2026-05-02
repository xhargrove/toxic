"use server";

import { revalidatePath } from "next/cache";
import { ContentStatus } from "@prisma/client";

import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db/prisma";

export async function removePostFromReview(formData: FormData) {
  await requireAdmin("/admin");
  const postId = formData.get("postId");
  if (typeof postId !== "string" || !postId) {
    return;
  }

  await prisma.post.update({
    where: { id: postId },
    data: { status: ContentStatus.REMOVED, updatedAt: new Date() },
  });

  revalidatePath("/admin");
  revalidatePath("/home");
  revalidatePath("/trending");
}
