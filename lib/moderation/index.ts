export const moderationConfig = {
  enabled: true,
  provider: "manual_queue",
} as const;

export { removePostFromReview } from "@/lib/moderation/actions";
