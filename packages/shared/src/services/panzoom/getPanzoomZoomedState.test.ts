import { PanzoomContain } from "#src/models/panzoom/PanzoomContain";
import { getPanzoomZoomedState } from "#src/services/panzoom/getPanzoomZoomedState";
import { describe, expect, test } from "vitest";

describe(getPanzoomZoomedState, () => {
  test("#668 the scale is clamped before the focal pan is taken", () => {
    expect.hasAssertions();

    const measure = {
      center: { x: 100, y: 100 },
      parent: { height: 200, left: 0, top: 0, width: 200 },
      size: { height: 200, width: 200 },
    };

    expect(
      getPanzoomZoomedState({ scale: 2, x: 0, y: 0 }, measure, { minScale: 1 }, 0.5, { x: 150, y: 100 }),
    ).toStrictEqual({ scale: 1, x: 25, y: 0 });
  });

  test("without a focal point the pan stays where it was, contained at the new scale", () => {
    expect.hasAssertions();

    const measure = {
      center: { x: 50, y: 50 },
      parent: { height: 100, left: 0, top: 0, width: 200 },
      size: { height: 100, width: 100 },
    };
    const state = getPanzoomZoomedState({ scale: 1, x: 100, y: 0 }, measure, { contain: PanzoomContain.Outside }, 3);

    expect(state.scale).toBe(3);
    expect(state.x).toBeCloseTo(100 / 3, 6);
    expect(state.y).toBe(0);
  });
});
