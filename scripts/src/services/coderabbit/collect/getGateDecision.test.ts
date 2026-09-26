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
  test.each([
    ["pending", "Review in progress", GateDecisionKind.Exit],
    ["pass", "Review completed", GateDecisionKind.Proceed],
    ["pass", "Review rate limited", GateDecisionKind.RateLimited],
    ["fail", "Review failed", GateDecisionKind.Fail],
  ])("decides %s / %s as %s", (bucket, description, expected) => {
    expect.hasAssertions();

    const { kind } = getGateDecision(getCheckStatus(bucket, description));

    expect(kind).toBe(expected);
  });

  test("fails when the pull request carries no check", () => {
    expect.hasAssertions();

    const { kind } = getGateDecision(undefined);

    expect(kind).toBe(GateDecisionKind.Fail);
  });
});
