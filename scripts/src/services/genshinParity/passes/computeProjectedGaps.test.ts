import { computeProjectedGaps } from "#src/services/genshinParity/passes/computeProjectedGaps";
import { describe, expect, test } from "vitest";

describe(computeProjectedGaps, () => {
  const POSE = [0, 0, 0, 0, 0, 90];
  const SIZE = 200;
  const DEPTH = -10;

  test("reads a placement's gap in pixels, where the same offset stands at its depth from the view's centre", () => {
    expect.hasAssertions();

    const [gap] = computeProjectedGaps(POSE, [{ expected: [0, 0, DEPTH], fitted: [0.5, 0, DEPTH] }], SIZE, SIZE);

    expect(gap).toBeCloseTo(5);
  });

  test("reads no gap where both points project onto one pixel, however far the fitted point stands in depth", () => {
    expect.hasAssertions();

    const [gap] = computeProjectedGaps(POSE, [{ expected: [0, 0, DEPTH], fitted: [0, 0, 2 * DEPTH] }], SIZE, SIZE);

    expect(gap).toBeCloseTo(0);
  });
});
