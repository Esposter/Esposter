import { getPanzoomCentredPan } from "#src/services/panzoom/getPanzoomCentredPan";
import { getPanzoomFitScale } from "#src/services/panzoom/getPanzoomFitScale";
import { describe, expect, test } from "vitest";

describe(getPanzoomCentredPan, () => {
  test("#432 centres the element on its parent at the fit scale", () => {
    expect.hasAssertions();

    const measure = {
      center: { x: 50, y: 50 },
      parent: { height: 200, left: 0, top: 0, width: 300 },
      size: { height: 100, width: 100 },
    };
    const fitScale = getPanzoomFitScale(measure);

    expect(getPanzoomCentredPan(fitScale, measure)).toStrictEqual({ x: 50, y: 25 });
  });
});
