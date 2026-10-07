import type { WwiseCurve } from "#src/models/genshinAssets/music/WwiseCurve";

import { WwiseCurveInterpolation } from "#src/models/genshinAssets/music/WwiseCurveInterpolation";
import { WwiseCurveParameter } from "#src/models/genshinAssets/music/WwiseCurveParameter";
import { WwiseCurveScaling } from "#src/models/genshinAssets/music/WwiseCurveScaling";
import { evaluateWwiseCurve } from "#src/services/genshinAssets/music/evaluateWwiseCurve";
import { describe, expect, test } from "vitest";

describe(evaluateWwiseCurve, () => {
  const curve: WwiseCurve = {
    gameParameterId: 1,
    isGameParameter: true,
    parameter: WwiseCurveParameter.Volume,
    points: [
      { from: 0, interpolation: WwiseCurveInterpolation.Linear, to: -1 },
      { from: 1, interpolation: WwiseCurveInterpolation.Linear, to: 0 },
    ],
    scaling: WwiseCurveScaling.None,
  };

  test.each([
    [-1, -1],
    [0.5, -0.5],
    [2, 0],
  ])("holds its ends past them and eases linearly between: %s reads %s", (value, expected) => {
    expect.hasAssertions();

    expect(evaluateWwiseCurve(curve, value)).toBe(expected);
  });

  test("scales a stored amplitude less one into decibels, muted at its floor", () => {
    expect.hasAssertions();

    const decibelCurve: WwiseCurve = { ...curve, scaling: WwiseCurveScaling.Decibels };

    expect(evaluateWwiseCurve(decibelCurve, 0.5)).toBeCloseTo(20 * Math.log10(0.5));
    expect(evaluateWwiseCurve(decibelCurve, 0)).toBe(-96.3);
  });
});
