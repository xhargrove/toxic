import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Confirms default Category + demo City exist (same logic `/create` relies on).
 */
async function main() {
  const general = await prisma.category.findFirst({
    where: { isActive: true, slug: "general" },
  });
  const city = await prisma.city.findUnique({
    where: { slug: "demo-city" },
  });

  if (!general) {
    throw new Error('Category slug "general" missing. Run: npm run prisma:seed');
  }
  if (!city?.isActive) {
    throw new Error('City slug "demo-city" missing or inactive. Run: npm run prisma:seed');
  }

  console.log(
    `verify-seed OK: category "general" (${general.id}), city "${city.slug}" (${city.id}). Use city slug demo-city on /create.`
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
