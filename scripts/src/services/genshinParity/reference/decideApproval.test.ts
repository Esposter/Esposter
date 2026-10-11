import type { ParityScore } from "#src/models/genshinParity/reference/ParityScore";

import { ApprovalOutcome } from "#src/models/genshinParity/reference/ApprovalOutcome";
import { decideApproval } from "#src/services/genshinParity/reference/decideApproval";
import { describe, expect, test } from "vitest";

const createScore = (flip: number): ParityScore => ({
  edgeScore: 1,
  flip,
  layers: [],
  meanDifference: 0,
  screen: "SplashPublisher",
  toneDifference: 0,
});

describe(decideApproval, () => {
  const BAR = 0.05;

  test("approves a whole-screen compare under the bar", () => {
    expect.hasAssertions();

    expect(decideApproval(true, true, createScore(0.04), BAR)).toBe(ApprovalOutcome.Approved);
  });

  test("refuses a compare at the bar or over it", () => {
    expect.hasAssertions();

    expect(decideApproval(true, true, createScore(BAR), BAR)).toBe(ApprovalOutcome.OverBar);
    expect(decideApproval(true, true, createScore(0.2), BAR)).toBe(ApprovalOutcome.OverBar);
  });

  test("refuses when no reference exists, even with a score to hand", () => {
    expect.hasAssertions();

    expect(decideApproval(false, true, createScore(0.001), BAR)).toBe(ApprovalOutcome.NoReference);
  });

  test("refuses when the compare failed and left no score", () => {
    expect.hasAssertions();

    expect(decideApproval(true, true, undefined, BAR)).toBe(ApprovalOutcome.CompareFailed);
  });

  test("refuses a compare that does not judge the whole screen, however clean its score", () => {
    expect.hasAssertions();

    expect(decideApproval(true, false, createScore(0.001), BAR)).toBe(ApprovalOutcome.NotWholeScreen);
  });
});
