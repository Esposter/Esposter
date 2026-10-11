import type { ParityScore } from "#src/models/genshinParity/reference/ParityScore";
import type { ParityApproval } from "#src/models/genshinParity/shared/ParityApproval";

import { ApprovalOutcome } from "#src/models/genshinParity/reference/ApprovalOutcome";
import { ParityApprovalMeasure } from "#src/models/genshinParity/reference/ParityApprovalMeasure";
import { decideApproval } from "#src/services/genshinParity/reference/decideApproval";
import { describe, expect, test } from "vitest";

const createScore = (flip: number, meanDifference = 0): ParityScore => ({
  edgeScore: 1,
  flip,
  layers: [],
  meanDifference,
  screen: "SplashPublisher",
  toneDifference: 0,
});

describe(decideApproval, () => {
  const FLIP_APPROVAL: ParityApproval = { bar: 0.05, measure: ParityApprovalMeasure.Flip };
  const MEAN_APPROVAL: ParityApproval = { bar: 2, measure: ParityApprovalMeasure.MeanDifference };

  test("approves a whole-screen compare under the bar", () => {
    expect.hasAssertions();

    expect(decideApproval(true, true, createScore(0.04), FLIP_APPROVAL)).toBe(ApprovalOutcome.Approved);
  });

  test("refuses a compare at the bar or over it", () => {
    expect.hasAssertions();

    expect(decideApproval(true, true, createScore(0.05), FLIP_APPROVAL)).toBe(ApprovalOutcome.OverBar);
    expect(decideApproval(true, true, createScore(0.2), FLIP_APPROVAL)).toBe(ApprovalOutcome.OverBar);
  });

  test("judges a screen by the measure it records, not by FLIP", () => {
    expect.hasAssertions();

    const score = createScore(0.0974, 1.19);

    expect(decideApproval(true, true, score, MEAN_APPROVAL)).toBe(ApprovalOutcome.Approved);
    expect(decideApproval(true, true, score, FLIP_APPROVAL)).toBe(ApprovalOutcome.OverBar);
    expect(decideApproval(true, true, createScore(0.001, 2), MEAN_APPROVAL)).toBe(ApprovalOutcome.OverBar);
  });

  test("refuses when no reference exists, even with a score to hand", () => {
    expect.hasAssertions();

    expect(decideApproval(false, true, createScore(0.001), FLIP_APPROVAL)).toBe(ApprovalOutcome.NoReference);
  });

  test("refuses when the compare failed and left no score", () => {
    expect.hasAssertions();

    expect(decideApproval(true, true, undefined, FLIP_APPROVAL)).toBe(ApprovalOutcome.CompareFailed);
  });

  test("refuses a compare that does not judge the whole screen, however clean its score", () => {
    expect.hasAssertions();

    expect(decideApproval(true, false, createScore(0.001), FLIP_APPROVAL)).toBe(ApprovalOutcome.NotWholeScreen);
  });
});
