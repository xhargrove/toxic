import { redirect } from "next/navigation";

import { isOnboardingComplete } from "@/lib/auth/onboarding";
import { requireDbUser } from "@/lib/auth/require-db-user";

/**
 * Allow onboarding only for signed-in users whose profile is not complete yet.
 */
export default async function OnboardingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const dbUser = await requireDbUser("/onboarding");
  if (isOnboardingComplete(dbUser)) {
    redirect("/home");
  }
  return children;
}
