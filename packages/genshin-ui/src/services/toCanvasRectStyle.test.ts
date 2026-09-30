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
      bottom: "calc(0px + 0 * 100% + 54 * var(--canvas-unit))",
      height: "calc(0 * 100% + 520 * var(--canvas-unit))",
      left: "calc(0px + 1 * 100% + -106 * var(--canvas-unit))",
      position: "absolute",
      width: "calc(0 * 100% + 52 * var(--canvas-unit))",
    });
  });

  test("places a piece stretched between its parent's sides by its size delta alone, whatever its pivot", () => {
    expect.hasAssertions();

    const { left, width } = toCanvasRectStyle({
      anchorMax: [1, 0],
      anchorMin: [0, 0],
      pivot: [0.5, 0],
      position: [0, 0],
      size: [-120, 40],
    });

    expect(left).toBe("calc(0px + 0 * 100% + 60 * var(--canvas-unit))");
    expect(width).toBe("calc(1 * 100% + -120 * var(--canvas-unit))");
  });
});
