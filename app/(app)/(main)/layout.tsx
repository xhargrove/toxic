import { requireCompleteProfile } from "@/lib/auth/onboarding";
import { getMiddlewarePathname } from "@/lib/auth/request-path";

/**
 * Product routes that require a finished app profile (see `docs/ONBOARDING.md`).
 */
export default async function MainAppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const returnPath = await getMiddlewarePathname();
  await requireCompleteProfile(returnPath);
  return children;
}
