import { PanzoomDeltaMode } from "#src/models/panzoom/PanzoomDeltaMode";
import { getPanzoomWheelScale } from "#src/services/panzoom/getPanzoomWheelScale";
import { describe, expect, test } from "vitest";

describe(getPanzoomWheelScale, () => {
  test("#586 scales a wheel step by its pixel delta, and one event moves at most one step", () => {
    expect.hasAssertions();

    expect(getPanzoomWheelScale(1, { deltaMode: PanzoomDeltaMode.Pixel, deltaX: 0, deltaY: -50 }, 0.3)).toBeCloseTo(
      1.0512711,
      7,
    );
    expect(getPanzoomWheelScale(1, { deltaMode: PanzoomDeltaMode.Pixel, deltaX: 0, deltaY: -300 }, 0.3)).toBeCloseTo(
      1.1051709,
      7,
    );
  });

  test("a line delta counts 16 pixels a line", () => {
    expect.hasAssertions();

    expect(getPanzoomWheelScale(1, { deltaMode: PanzoomDeltaMode.Line, deltaX: 0, deltaY: -2 }, 0.3)).toBeCloseTo(
      1.0325175,
      7,
    );
  });

  test("a horizontal delta stands in for a zero vertical one, and zooms out for a positive one", () => {
    expect.hasAssertions();

    expect(getPanzoomWheelScale(1, { deltaMode: PanzoomDeltaMode.Pixel, deltaX: 100, deltaY: 0 }, 0.3)).toBeCloseTo(
      0.9048374,
      7,
    );
  });

  test("a zero delta leaves the scale where it is", () => {
    expect.hasAssertions();

    expect(getPanzoomWheelScale(1, { deltaMode: PanzoomDeltaMode.Pixel, deltaX: 0, deltaY: 0 }, 0.3)).toBe(1);
  });
});
