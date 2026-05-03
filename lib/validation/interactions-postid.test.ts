import assert from "node:assert/strict";
import test from "node:test";

import { parsePostIdParam, postIdSchema } from "./interactions";

test("parsePostIdParam rejects empty and garbage", () => {
  assert.equal(parsePostIdParam(""), null);
  assert.equal(parsePostIdParam(null), null);
  assert.equal(parsePostIdParam("../../etc/passwd"), null);
  assert.equal(parsePostIdParam("short"), null);
});

test("parsePostIdParam accepts plausible cuid", () => {
  const id = "clxyz0123456789012345678";
  assert.equal(parsePostIdParam(id), id);
});

test("postIdSchema rejects path injection shapes", () => {
  assert.equal(postIdSchema.safeParse("ab/cd").success, false);
  assert.equal(postIdSchema.safeParse("abc").success, false);
});
