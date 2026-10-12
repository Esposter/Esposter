import { advanceStridePhase } from "#src/character/pose/advanceStridePhase";
import { describe, expect, test } from "vitest";

describe(advanceStridePhase, () => {
  test("turns once for every stride the body covers, so a faster body strides more often", () => {
    expect.hasAssertions();

    const oneStride = advanceStridePhase(0, 3, 3, 1);

    expect(oneStride).toBeCloseTo(Math.PI * 2);
    expect(advanceStridePhase(0, 6, 3, 1)).toBeCloseTo(oneStride * 2);
  });
});
