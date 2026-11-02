import { getFitViewport } from "@/services/whiteboard/viewport/getFitViewport";
import { describe, expect, test } from "vitest";

describe(getFitViewport, () => {
  const CANVAS_SIZE = { height: 400, width: 400 };

  test("a fit shows the whole box centred, at the scale of its tighter side", () => {
    expect.hasAssertions();
    const bounds = { height: 200, width: 800, x: 0, y: 0 };

    // The width allows a scale of 0.5 and the height one of 2, so the width decides: 800 by 800 document units show, centred on (400, 100)
    expect(getFitViewport(bounds, CANVAS_SIZE)).toStrictEqual({ scale: 0.5, x: 0, y: -300 });
  });

  test("a fit shows a small box at full size rather than enlarging it", () => {
    expect.hasAssertions();
    const bounds = { height: 100, width: 200, x: 0, y: 0 };

    expect(getFitViewport(bounds, CANVAS_SIZE)).toStrictEqual({ scale: 1, x: -100, y: -150 });
  });
});
