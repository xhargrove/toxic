"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";

import { requireDbUser } from "@/lib/auth/require-db-user";
import { prisma } from "@/lib/db/prisma";
import { onboardingFormSchema } from "@/lib/validation/user";

export type CompleteOnboardingState = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
} | null;

/**
 * Persists onboarding fields and marks the profile complete. Username uniqueness is enforced by Prisma (`@@unique`).
 */
export async function completeOnboardingAction(
  _prev: CompleteOnboardingState,
  formData: FormData
): Promise<CompleteOnboardingState> {
  const dbUser = await requireDbUser("/onboarding");

  const parsed = onboardingFormSchema.safeParse({
    username: formData.get("username"),
    displayName: formData.get("displayName"),
    avatarUrl: formData.get("avatarUrl"),
    homeCityId: formData.get("homeCityId"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { username, displayName, avatarUrl, homeCityId } = parsed.data;

  if (homeCityId) {
    const city = await prisma.city.findFirst({
      where: { id: homeCityId, isActive: true },
    });
    if (!city) {
      return { fieldErrors: { homeCityId: ["Choose a valid city or leave blank."] } };
    }
  }

  try {
    await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        username,
        displayName,
        avatarUrl: avatarUrl ?? null,
        homeCityId: homeCityId ?? null,
        onboardingCompletedAt: new Date(),
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      const target = e.meta?.target;
      const targetStr = Array.isArray(target) ? target.join(",") : String(target ?? "");
      if (targetStr.includes("username")) {
        return {
          error: "That username is already taken. Pick another.",
          fieldErrors: { username: ["That username is already taken."] },
        };
      }
      return { error: "Could not save your profile. Try again." };
    }
    throw e;
  }

  revalidatePath("/", "layout");
  redirect("/home");
}
