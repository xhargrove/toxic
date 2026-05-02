import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/** Stable ids so re-seeding is idempotent with upserts keyed by slug. */
const CATEGORY_ID = "seed_category_general";
const CITY_ID = "seed_city_demo";

async function main() {
  await prisma.category.upsert({
    where: { slug: "general" },
    create: {
      id: CATEGORY_ID,
      name: "General",
      slug: "general",
      description: "Default category for new posts (development seed).",
      isActive: true,
    },
    update: {
      name: "General",
      description: "Default category for new posts (development seed).",
      isActive: true,
    },
  });

  await prisma.city.upsert({
    where: { slug: "demo-city" },
    create: {
      id: CITY_ID,
      name: "Demo City",
      slug: "demo-city",
      state: "CA",
      country: "USA",
      isActive: true,
    },
    update: {
      name: "Demo City",
      state: "CA",
      country: "USA",
      isActive: true,
    },
  });

  const catCount = await prisma.category.count({ where: { isActive: true } });
  const cityCount = await prisma.city.count({ where: { isActive: true } });

  console.log(
    `Seed OK: Category slug "general", City slug "demo-city". Active categories: ${catCount}, active cities: ${cityCount}.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
