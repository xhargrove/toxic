"use server";

import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ContentStatus, PostType, Visibility } from "@prisma/client";

import { requireCompleteProfile } from "@/lib/auth/onboarding";
import { prisma } from "@/lib/db/prisma";
import { createPostSchema } from "@/lib/validation/post";

export type CreatePostState = { error?: string; fieldErrors?: Record<string, string[] | undefined> } | null;

async function getDefaultCategoryId(): Promise<string> {
  const preferred = await prisma.category.findFirst({
    where: { isActive: true, slug: "general" },
  });
  if (preferred) {
    return preferred.id;
  }

  const category = await prisma.category.findFirst({
    where: { isActive: true },
    orderBy: { slug: "asc" },
  });
  if (!category) {
    throw new Error(
      "No active categories in the database. Add rows to `Category` before creating posts."
    );
  }
  return category.id;
}

export async function createPostAction(_prev: CreatePostState, formData: FormData): Promise<CreatePostState> {
  const dbUser = await requireCompleteProfile("/create");

  const parsed = createPostSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
    citySlug: formData.get("citySlug"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const city = await prisma.city.findUnique({
    where: { slug: parsed.data.citySlug },
  });
  if (!city || !city.isActive) {
    return { error: "City not found or inactive." };
  }

  let categoryId: string;
  try {
    categoryId = await getDefaultCategoryId();
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Could not resolve a default category.",
    };
  }

  await prisma.post.create({
    data: {
      id: randomUUID(),
      authorId: dbUser.id,
      cityId: city.id,
      categoryId,
      title: parsed.data.title,
      body: parsed.data.body,
      postType: PostType.OPINION,
      visibility: Visibility.PUBLIC,
      status: ContentStatus.ACTIVE,
      updatedAt: new Date(),
    },
  });

  revalidatePath("/home");
  revalidatePath("/trending");
  revalidatePath(`/city/${city.slug}`);
  redirect("/home");
}
