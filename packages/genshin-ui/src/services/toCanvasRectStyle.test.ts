import { toCanvasRectStyle } from "#src/services/toCanvasRectStyle";
import { describe, expect, test } from "vitest";

describe(toCanvasRectStyle, () => {
  test("places a piece anchored to its parent's lower right by its pivot, from the foot up", () => {
    expect.hasAssertions();

    const style = toCanvasRectStyle({
      anchorMax: [1, 0],
      anchorMin: [1, 0],
      pivot: [1, 0],
      position: [-54, 54],
      size: [52, 520],
    });

    expect(style).toStrictEqual({
      bottom: "calc(0px + 0 * 100% + 54 * var(--canvas-unit) - 0 * calc(0 * 100% + 520 * var(--canvas-unit)))",
      height: "calc(0 * 100% + 520 * var(--canvas-unit))",
      left: "calc(0px + 1 * 100% + -54 * var(--canvas-unit) - 1 * calc(0 * 100% + 52 * var(--canvas-unit)))",
      position: "absolute",
      width: "calc(0 * 100% + 52 * var(--canvas-unit))",
    });
  });

  test("measures a stretched piece's position from the point between its anchors its pivot marks", () => {
    expect.hasAssertions();

    const style = toCanvasRectStyle({
      anchorMax: [1, 1],
      anchorMin: [0, 0],
      pivot: [0.5, 0.5],
      position: [0, 0],
      size: [0, 0],
    });

    expect(style.left).toBe(
      "calc(0px + 0.5 * 100% + 0 * var(--canvas-unit) - 0.5 * calc(1 * 100% + 0 * var(--canvas-unit)))",
    );
  });
});
