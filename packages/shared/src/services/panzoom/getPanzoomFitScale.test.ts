import { getPanzoomFitScale } from "#src/services/panzoom/getPanzoomFitScale";
import { describe, expect, test } from "vitest";

describe(getPanzoomFitScale, () => {
  test("#656 fits the element inside its parent at the lower of its two ratios", () => {
    expect.hasAssertions();

    const centredMeasure = {
      center: { x: 100, y: 50 },
      parent: { height: 100, left: 0, top: 0, width: 200 },
      size: { height: 200, width: 400 },
    };
    const wideParentMeasure = { ...centredMeasure, parent: { height: 100, left: 0, top: 0, width: 300 } };

    expect(getPanzoomFitScale(centredMeasure)).toBe(0.5);
    expect(getPanzoomFitScale(wideParentMeasure)).toBe(0.5);
  });

  test("a collapsed side has no containment on its axis, and no containment on either leaves the unscaled size", () => {
    expect.hasAssertions();

    const collapsedMeasure = {
      center: { x: 100, y: 50 },
      parent: { height: 0, left: 0, top: 0, width: 200 },
      size: { height: 100, width: 100 },
    };
    const zeroMeasure = { ...collapsedMeasure, parent: { height: 0, left: 0, top: 0, width: 0 } };

    expect(getPanzoomFitScale(collapsedMeasure)).toBe(2);
    expect(getPanzoomFitScale(zeroMeasure)).toBe(1);
  });
});
