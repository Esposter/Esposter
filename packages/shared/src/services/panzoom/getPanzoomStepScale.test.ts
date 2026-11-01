import { PanzoomZoomDirection } from "#src/models/panzoom/PanzoomZoomDirection";
import { getPanzoomStepScale } from "#src/services/panzoom/getPanzoomStepScale";
import { describe, expect, test } from "vitest";

describe(getPanzoomStepScale, () => {
  test("a zoom in or out multiplies the scale by e to the step, or to its negative", () => {
    expect.hasAssertions();

    expect(getPanzoomStepScale(1, PanzoomZoomDirection.In, 0.3)).toBeCloseTo(1.3498588, 7);
    expect(getPanzoomStepScale(1, PanzoomZoomDirection.Out, 0.3)).toBeCloseTo(0.7408182, 7);
  });
});
