import { ContentStatus } from "@prisma/client";

/**
 * Only ACTIVE posts escalate to UNDER_REVIEW when enough OPEN reports exist.
 */
export function shouldEscalatePostToReview(params: {
  postStatus: ContentStatus;
  openReportCount: number;
  threshold: number;
}): boolean {
  return (
    params.postStatus === ContentStatus.ACTIVE &&
    params.threshold > 0 &&
    params.openReportCount >= params.threshold
  );
}
