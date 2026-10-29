import type { ParityScore } from "#src/models/genshinParity/reference/ParityScore";
import type { ParityApproval } from "#src/models/genshinParity/shared/ParityApproval";

import { ApprovalStatus } from "#src/models/genshinParity/reference/ApprovalStatus";
import { ParityApprovalMeasure } from "#src/models/genshinParity/reference/ParityApprovalMeasure";
import { decideApprovalStatus } from "#src/services/genshinParity/reference/decideApprovalStatus";
import { describe, expect, test } from "vitest";

const createScore = (flip: number, meanDifference = 0): ParityScore => ({
  edgeScore: 1,
  flip,
  layers: [],
  meanDifference,
  screen: "SplashPublisher",
  toneDifference: 0,
});

describe(decideApprovalStatus, () => {
  const FLIP_APPROVAL: ParityApproval = { bar: 0.05, measure: ParityApprovalMeasure.Flip };
  const MEAN_APPROVAL: ParityApproval = { bar: 2, measure: ParityApprovalMeasure.MeanDifference };

  test("reports a whole-screen compare under the bar as within it", () => {
    expect.hasAssertions();

    expect(decideApprovalStatus(true, true, createScore(0.04), FLIP_APPROVAL)).toBe(ApprovalStatus.WithinBar);
  });

  test("reports a compare at the bar or over it as over the bar", () => {
    expect.hasAssertions();

    expect(decideApprovalStatus(true, true, createScore(0.05), FLIP_APPROVAL)).toBe(ApprovalStatus.OverBar);
    expect(decideApprovalStatus(true, true, createScore(0.2), FLIP_APPROVAL)).toBe(ApprovalStatus.OverBar);
  });

  test("judges a screen by the measure it records, not by FLIP", () => {
    expect.hasAssertions();

    const score = createScore(0.0974, 1.19);

    expect(decideApprovalStatus(true, true, score, MEAN_APPROVAL)).toBe(ApprovalStatus.WithinBar);
    expect(decideApprovalStatus(true, true, score, FLIP_APPROVAL)).toBe(ApprovalStatus.OverBar);
    expect(decideApprovalStatus(true, true, createScore(0.001, 2), MEAN_APPROVAL)).toBe(ApprovalStatus.OverBar);
  });

  test("reports no reference when none exists, even with a score to hand", () => {
    expect.hasAssertions();

    expect(decideApprovalStatus(false, true, createScore(0.001), FLIP_APPROVAL)).toBe(ApprovalStatus.NoReference);
  });

  test("reports a failed compare when it left no score", () => {
    expect.hasAssertions();

    expect(decideApprovalStatus(true, true, undefined, FLIP_APPROVAL)).toBe(ApprovalStatus.CompareFailed);
  });

  test("reports a compare that does not judge the whole screen as such, however clean its score", () => {
    expect.hasAssertions();

    expect(decideApprovalStatus(true, false, createScore(0.001), FLIP_APPROVAL)).toBe(ApprovalStatus.NotWholeScreen);
  });
});
