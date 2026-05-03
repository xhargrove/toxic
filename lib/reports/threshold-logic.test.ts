import assert from "node:assert/strict";
import test from "node:test";

import { ContentStatus } from "@prisma/client";

import { shouldEscalatePostToReview } from "./threshold-logic";

test("below threshold does not escalate", () => {
  assert.equal(
    shouldEscalatePostToReview({
      postStatus: ContentStatus.ACTIVE,
      openReportCount: 2,
      threshold: 3,
    }),
    false
  );
});

test("at threshold escalates ACTIVE post", () => {
  assert.equal(
    shouldEscalatePostToReview({
      postStatus: ContentStatus.ACTIVE,
      openReportCount: 3,
      threshold: 3,
    }),
    true
  );
});

test("UNDER_REVIEW never escalates via this gate", () => {
  assert.equal(
    shouldEscalatePostToReview({
      postStatus: ContentStatus.UNDER_REVIEW,
      openReportCount: 99,
      threshold: 3,
    }),
    false
  );
});

test("zero threshold never escalates", () => {
  assert.equal(
    shouldEscalatePostToReview({
      postStatus: ContentStatus.ACTIVE,
      openReportCount: 10,
      threshold: 0,
    }),
    false
  );
});
