import { prisma } from "@/lib/db/prisma";

export async function getCityBySlug(slug: string) {
  return prisma.city.findUnique({
    where: { slug },
  });
}
