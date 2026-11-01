import { getPanzoomCoverScale } from "#src/services/panzoom/getPanzoomCoverScale";
import { describe, expect, test } from "vitest";

describe(getPanzoomCoverScale, () => {
  test("the cover is the higher of the element's two ratios", () => {
    expect.hasAssertions();

    const measure = {
      center: { x: 150, y: 50 },
      parent: { height: 100, left: 0, top: 0, width: 300 },
      size: { height: 200, width: 400 },
    };

    expect(getPanzoomCoverScale(measure)).toBe(0.75);
  });
});
