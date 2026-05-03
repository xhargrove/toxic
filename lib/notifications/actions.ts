"use server";

import { revalidatePath } from "next/cache";

import { requireCompleteProfile } from "@/lib/auth/onboarding";
import { prisma } from "@/lib/db/prisma";

export async function markNotificationReadAction(formData: FormData) {
  const dbUser = await requireCompleteProfile("/notifications");
  const id = formData.get("notificationId");
  if (typeof id !== "string" || !id) {
    return;
  }

  await prisma.notification.updateMany({
    where: { id, userId: dbUser.id },
    data: { readAt: new Date() },
  });

  revalidatePath("/notifications");
  revalidatePath("/", "layout");
}

export async function markAllNotificationsReadAction() {
  const dbUser = await requireCompleteProfile("/notifications");

  await prisma.notification.updateMany({
    where: { userId: dbUser.id, readAt: null },
    data: { readAt: new Date() },
  });

  revalidatePath("/notifications");
  revalidatePath("/", "layout");
}
