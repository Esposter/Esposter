import type { GestureWheelEvent } from "@/models/whiteboard/GestureWheelEvent";
import type { Viewport } from "@/models/whiteboard/Viewport";

import { getWorldPoint } from "@/services/whiteboard/gesture/getWorldPoint";
import { WHITEBOARD_MIN_SCALE } from "@/services/whiteboard/viewport/constants";
import { getWheelViewport } from "@/services/whiteboard/viewport/getWheelViewport";
import { describe, expect, test } from "vitest";

describe(getWheelViewport, () => {
  const VIEWPORT: Viewport = { scale: 1, x: 0, y: 0 };
  const SCREEN = { x: 100, y: 50 };
  // The largest scale the canvas zooms to, the limit the spec sets
  const MAXIMUM_SCALE = 30;
  const createWheel = (init: Partial<GestureWheelEvent>): GestureWheelEvent => ({
    deltaX: 0,
    deltaY: 0,
    isZoomKey: false,
    screen: SCREEN,
    ...init,
  });

  test("The wheel pans", () => {
    expect.hasAssertions();

    // A turn down by 0.1 moves the view 0.1 further down the document at scale 1, and the scale stays where it was
    expect(getWheelViewport(VIEWPORT, createWheel({ deltaY: 0.1 }))).toStrictEqual({ scale: 1, x: 0, y: 0.1 });
  });

  test("Ctrl and the wheel zoom about the pointer", () => {
    expect.hasAssertions();

    const zoomed = getWheelViewport(VIEWPORT, createWheel({ deltaY: -1, isZoomKey: true }));

    // A turn up zooms in, and the document point under the pointer is the same point after the zoom
    expect(zoomed.scale).toBeGreaterThan(VIEWPORT.scale);
    expect(getWorldPoint(SCREEN, zoomed).x).toBeCloseTo(getWorldPoint(SCREEN, VIEWPORT).x, 6);
    expect(getWorldPoint(SCREEN, zoomed).y).toBeCloseTo(getWorldPoint(SCREEN, VIEWPORT).y, 6);
  });

  test("Zoom stops at the limits", () => {
    expect.hasAssertions();

    // A zoom in at the largest scale and a zoom out at the smallest each leave the scale on its limit
    expect(
      getWheelViewport({ scale: MAXIMUM_SCALE, x: 0, y: 0 }, createWheel({ deltaY: -1, isZoomKey: true })).scale,
    ).toBe(MAXIMUM_SCALE);
    expect(
      getWheelViewport({ scale: WHITEBOARD_MIN_SCALE, x: 0, y: 0 }, createWheel({ deltaY: 1, isZoomKey: true })).scale,
    ).toBe(WHITEBOARD_MIN_SCALE);
  });
});
