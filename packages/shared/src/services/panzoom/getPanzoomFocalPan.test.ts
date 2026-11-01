import { constrainPanzoomScale } from "#src/services/panzoom/constrainPanzoomScale";
import { getPanzoomFocalPan } from "#src/services/panzoom/getPanzoomFocalPan";
import { describe, expect, test } from "vitest";

describe(getPanzoomFocalPan, () => {
  test("#611 zooms about the layout centre of a flex-centred element, not its top-left corner", () => {
    expect.hasAssertions();

    const measure = {
      center: { x: 200, y: 100 },
      parent: { height: 200, left: 0, top: 0, width: 400 },
      size: { height: 100, width: 200 },
    };

    expect(getPanzoomFocalPan({ scale: 1, x: 0, y: 0 }, 2, { x: 200, y: 100 }, measure)).toStrictEqual({ x: 0, y: 0 });
  });

  test("#668 and #669 zoom about the point against the clamped scale, not the requested one", () => {
    expect.hasAssertions();

    const measure = {
      center: { x: 100, y: 100 },
      parent: { height: 200, left: 0, top: 0, width: 200 },
      size: { height: 200, width: 200 },
    };
    const toScale = constrainPanzoomScale(0.5, measure, { minScale: 1 });

    expect(getPanzoomFocalPan({ scale: 2, x: 0, y: 0 }, toScale, { x: 150, y: 100 }, measure)).toStrictEqual({
      x: 25,
      y: 0,
    });
  });
});
