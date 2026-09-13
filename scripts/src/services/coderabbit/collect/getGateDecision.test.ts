import type { CheckStatus } from "#src/models/coderabbit/collect/CheckStatus";

import { GateDecisionKind } from "#src/models/coderabbit/collect/GateDecisionKind";
import { getGateDecision } from "#src/services/coderabbit/collect/getGateDecision";
import { describe, expect, test } from "vitest";

const getCheckStatus = (bucket: string, description: string): CheckStatus => ({
  bucket,
  description,
  name: "CodeRabbit",
});

describe(getGateDecision, () => {
  const head = "a".repeat(40);
  const behind = "b".repeat(40);

  // A body at the head is a completed review whatever the status still says — the event fires before the flip
  test("proceeds when the newest body ends at the develop head, even with a pending status", () => {
    expect.hasAssertions();

    const { kind } = getGateDecision({
      checkStatus: getCheckStatus("pending", "Review in progress"),
      developSha: head,
      lastReviewedSha: head,
    });

    expect(kind).toBe(GateDecisionKind.Proceed);
  });

  test.each([
    ["pending", "Review in progress", GateDecisionKind.Exit],
    ["pass", "Review completed", GateDecisionKind.Exit],
    ["pass", "Review rate limited", GateDecisionKind.RateLimited],
    ["fail", "Review failed", GateDecisionKind.Fail],
  ])("decides %s / %s as %s when the body is behind the head", (bucket, description, expected) => {
    expect.hasAssertions();

    const { kind } = getGateDecision({
      checkStatus: getCheckStatus(bucket, description),
      developSha: head,
      lastReviewedSha: behind,
    });

    expect(kind).toBe(expected);
  });

  test("fails when the pull request carries no check", () => {
    expect.hasAssertions();

    const { kind } = getGateDecision({ checkStatus: undefined, developSha: head, lastReviewedSha: undefined });

    expect(kind).toBe(GateDecisionKind.Fail);
  });
});
