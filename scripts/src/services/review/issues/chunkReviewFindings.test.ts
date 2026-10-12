import { ReviewLane } from "#src/models/review/ReviewLane";
import { chunkReviewFindings } from "#src/services/review/issues/chunkReviewFindings";
import { describe, expect, test } from "vitest";

describe(chunkReviewFindings, () => {
  const finding = { file: "a.ts", lane: ReviewLane.Quality, line: 1, summary: "s", trigger: "t" };
  const cap = 2;

  test("cuts the findings into consecutive chunks of at most the cap", () => {
    expect.hasAssertions();

    expect(chunkReviewFindings([finding, finding, finding], cap)).toStrictEqual([[finding, finding], [finding]]);
  });

  test("makes no chunk from no findings", () => {
    expect.hasAssertions();

    expect(chunkReviewFindings([], cap)).toStrictEqual([]);
  });
});
