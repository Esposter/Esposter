import { computeNavigationMark } from "#src/services/map/computeNavigationMark";
import { NAVIGATION_MARK_INSET_SHARE } from "#src/services/map/constants";
import { describe, expect, test } from "vitest";

describe(computeNavigationMark, () => {
  test("a pointed landmark out of view sits at the screen's edge", () => {
    expect.hasAssertions();

    expect(computeNavigationMark({ x: 2, y: 0 }, false, 1)).toStrictEqual({
      angle: expect.closeTo(Math.PI / 2),
      isOutOfView: true,
      left: expect.closeTo(1 - NAVIGATION_MARK_INSET_SHARE),
      top: 0.5,
    });
  });

  test("a pointed landmark in view is drawn at its own point", () => {
    expect.hasAssertions();

    expect(computeNavigationMark({ x: 0.5, y: -0.5 }, false, 1)).toStrictEqual({
      angle: expect.closeTo((3 * Math.PI) / 4),
      isOutOfView: false,
      left: 0.75,
      top: 0.75,
    });
  });

  test("a landmark behind the camera projected on the centre is held in place, not off the screen", () => {
    expect.hasAssertions();

    const { angle, ...mark } = computeNavigationMark({ x: 0, y: 0 }, true, 1);
    expect(Number.isFinite(angle)).toBe(true);
    expect(mark).toStrictEqual({ isOutOfView: true, left: 0.5, top: 0.5 });
  });

  test("a landmark behind the camera is held at the edge on its own side", () => {
    expect.hasAssertions();

    // Behind the camera a landmark projects mirrored through the centre, so this one lies up and to the right
    expect(computeNavigationMark({ x: -0.5, y: -0.5 }, true, 1)).toStrictEqual({
      angle: expect.closeTo(Math.PI / 4),
      isOutOfView: true,
      left: expect.closeTo(1 - NAVIGATION_MARK_INSET_SHARE),
      top: expect.closeTo(NAVIGATION_MARK_INSET_SHARE),
    });
  });
});
