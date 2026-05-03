import assert from "node:assert/strict";
import test from "node:test";

import { VoteType } from "@prisma/client";

import { voteCounterAdjustments } from "./vote-counter-deltas";

test("first Cap vote increments cap only", () => {
  const a = voteCounterAdjustments(null, VoteType.CAP);
  assert.equal(a.mode, "create");
  assert.equal(a.capDelta, 1);
  assert.equal(a.factsDelta, 0);
});

test("first Facts vote increments facts only", () => {
  const a = voteCounterAdjustments(null, VoteType.FACTS);
  assert.equal(a.mode, "create");
  assert.equal(a.capDelta, 0);
  assert.equal(a.factsDelta, 1);
});

test("toggling same Cap vote deletes and decrements cap", () => {
  const a = voteCounterAdjustments(VoteType.CAP, VoteType.CAP);
  assert.equal(a.mode, "delete");
  assert.equal(a.capDelta, -1);
  assert.equal(a.factsDelta, 0);
});

test("toggling same Facts vote deletes and decrements facts", () => {
  const a = voteCounterAdjustments(VoteType.FACTS, VoteType.FACTS);
  assert.equal(a.mode, "delete");
  assert.equal(a.capDelta, 0);
  assert.equal(a.factsDelta, -1);
});

test("switch Cap → Facts moves one count each way", () => {
  const a = voteCounterAdjustments(VoteType.CAP, VoteType.FACTS);
  assert.equal(a.mode, "switch");
  assert.equal(a.capDelta, -1);
  assert.equal(a.factsDelta, 1);
});

test("switch Facts → Cap moves one count each way", () => {
  const a = voteCounterAdjustments(VoteType.FACTS, VoteType.CAP);
  assert.equal(a.mode, "switch");
  assert.equal(a.capDelta, 1);
  assert.equal(a.factsDelta, -1);
});
