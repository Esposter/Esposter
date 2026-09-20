import { getShiftPercentage } from "#src/services/voiceMatch/rank/getShiftPercentage";
import { describe, expect, test } from "vitest";

describe(getShiftPercentage, () => {
  test("is the signed whole percentage that takes the candidate to the reference", () => {
    expect.hasAssertions();

    expect(getShiftPercentage(1, 1)).toBe(0);
    expect(getShiftPercentage(1.1, 1)).toBe(10);
    expect(getShiftPercentage(1, 1.1)).toBe(-9);
  });
});
