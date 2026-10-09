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
  const headSha = "head";
  const olderSha = "older";

  test.each([
    ["pending", "Review in progress", GateDecisionKind.Running],
    ["pass", "Review completed", GateDecisionKind.Proceed],
    ["pass", "Review rate limited", GateDecisionKind.RateLimited],
    ["fail", "Review failed", GateDecisionKind.Skipped],
    ["pass", "Review skipped: 133 files exceed the limit of 100", GateDecisionKind.Skipped],
  ])("decides %s / %s as %s", (bucket, description, expected) => {
    expect.hasAssertions();

    const { kind } = getGateDecision(getCheckStatus(bucket, description), headSha, headSha);

    expect(kind).toBe(expected);
  });

  test("proceeds on a skipped incremental pass when the full review read the head", () => {
    expect.hasAssertions();

    const { kind } = getGateDecision(
      getCheckStatus("pass", "Review skipped: incremental reviews are disabled"),
      headSha,
      headSha,
    );

    expect(kind).toBe(GateDecisionKind.Proceed);
  });

  test("reads a skipped incremental pass as a skip when commits landed after the full review", () => {
    expect.hasAssertions();

    const { kind } = getGateDecision(
      getCheckStatus("pass", "Review skipped: incremental reviews are disabled"),
      headSha,
      olderSha,
    );

    expect(kind).toBe(GateDecisionKind.Skipped);
  });

  test("reads a pull request carrying no check as missing", () => {
    expect.hasAssertions();

    const { kind } = getGateDecision(undefined, headSha, headSha);

    expect(kind).toBe(GateDecisionKind.Missing);
  });
});
