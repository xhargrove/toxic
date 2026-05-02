import { z } from "zod";

import { usernameSchema } from "@/lib/validation/auth";

const optionalTrimmedUrl = z.preprocess(
  (val) => {
    if (val === undefined || val === null) {
      return undefined;
    }
    const s = typeof val === "string" ? val.trim() : String(val);
    return s === "" ? undefined : s;
  },
  z.string().url().optional()
);

/**
 * Onboarding / profile update — aligns with Prisma `User` constraints.
 */
export const onboardingFormSchema = z.object({
  username: usernameSchema,
  displayName: z.string().trim().min(1).max(80),
  avatarUrl: optionalTrimmedUrl,
  homeCityId: z.preprocess(
    (val) => {
      if (val === undefined || val === null) {
        return undefined;
      }
      const s = typeof val === "string" ? val.trim() : String(val);
      return s === "" ? undefined : s;
    },
    z.string().min(1).optional()
  ),
});

export type OnboardingFormInput = z.infer<typeof onboardingFormSchema>;
