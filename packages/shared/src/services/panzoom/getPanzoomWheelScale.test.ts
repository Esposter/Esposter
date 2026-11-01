import { getPanzoomWheelScale } from "#src/services/panzoom/getPanzoomWheelScale";
import { describe, expect, test } from "vitest";

describe(getPanzoomWheelScale, () => {
  test("a wheel notch moves the scale by a third of the step, and a horizontal delta stands in for a zero vertical one", () => {
    expect.hasAssertions();

    expect(getPanzoomWheelScale(1, 0, -100, 0.3)).toBeCloseTo(1.1051709, 7);
    expect(getPanzoomWheelScale(1, 100, 0, 0.3)).toBeCloseTo(0.9048374, 7);
  });
});
