import { requireDbUser } from "@/lib/auth/require-db-user";
import { prisma } from "@/lib/db/prisma";

import { OnboardingForm } from "./onboarding-form";

export default async function OnboardingPage() {
  const dbUser = await requireDbUser("/onboarding");

  const activeCityCount = await prisma.city.count({ where: { isActive: true } });
  const cities =
    activeCityCount > 0
      ? await prisma.city.findMany({
          where: { isActive: true },
          orderBy: { name: "asc" },
          select: { id: true, name: true, slug: true, state: true },
        })
      : [];

  return (
    <section className="py-12">
      <div className="mx-auto flex max-w-md flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Complete your profile</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Set your public username and display name. You need this before using the rest of the app.
          </p>
        </div>
        <OnboardingForm
          defaultUsername={dbUser.username}
          defaultDisplayName={dbUser.displayName}
          defaultAvatarUrl={dbUser.avatarUrl ?? ""}
          defaultHomeCityId={dbUser.homeCityId ?? ""}
          cities={cities}
        />
      </div>
    </section>
  );
}
