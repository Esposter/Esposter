import { getZoomedViewport } from "@/services/whiteboard/viewport/getZoomedViewport";
import { describe, expect, test } from "vitest";

describe(getZoomedViewport, () => {
  const VIEWPORT = { scale: 1, x: 0, y: 0 };

  test("a zoom keeps the document point under the screen point where it was", () => {
    expect.hasAssertions();
    const screen = { x: 100, y: 50 };

    // The point at (100, 50) of the document sits under the screen point before the zoom, and under it after
    expect(getZoomedViewport(VIEWPORT, 2, screen)).toStrictEqual({ scale: 2, x: 50, y: 25 });
  });
});
