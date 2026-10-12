import { ReviewOutcome } from "#src/models/review/ReviewOutcome";
import { resolveDispositions } from "#src/services/review/resolveDispositions";
import { describe, expect, test } from "vitest";

const FAILURE_REASON = "the fixer failed";

describe(resolveDispositions, () => {
  test("defers every finding when the fixer failed", () => {
    expect.hasAssertions();

    expect(resolveDispositions(2, undefined, FAILURE_REASON)).toStrictEqual([
      { index: 0, outcome: ReviewOutcome.Deferred, reason: FAILURE_REASON },
      { index: 1, outcome: ReviewOutcome.Deferred, reason: FAILURE_REASON },
    ]);
  });

  test("defers a finding the fixer did not answer", () => {
    expect.hasAssertions();

    expect(
      resolveDispositions(2, [{ index: 1, outcome: ReviewOutcome.Fixed, reason: "done" }], FAILURE_REASON),
    ).toStrictEqual([
      { index: 0, outcome: ReviewOutcome.Deferred, reason: "the fixer did not answer this finding" },
      { index: 1, outcome: ReviewOutcome.Fixed, reason: "done" },
    ]);
  });
});
