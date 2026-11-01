import { PanzoomContain } from "#src/models/panzoom/PanzoomContain";
import { getPanzoomStartState } from "#src/services/panzoom/getPanzoomStartState";
import { describe, expect, test } from "vitest";

describe(getPanzoomStartState, () => {
  // A 200 by 200 element at the centre of a 200 by 200 parent, which it covers at every scale from 1 up
  const measure = {
    center: { x: 100, y: 100 },
    parent: { height: 200, left: 0, top: 0, width: 200 },
    size: { height: 200, width: 200 },
  };

  test("the start scale is clamped, and the start pan is contained at that scale", () => {
    expect.hasAssertions();

    const state = getPanzoomStartState({ scale: 1, x: 0, y: 0 }, measure, {
      contain: PanzoomContain.Outside,
      startScale: 1.2,
      startX: -1000,
    });

    expect(state.scale).toBe(1.2);
    expect(state.x).toBeCloseTo(-50 / 3, 6);
    expect(state.y).toBe(0);
  });

  test("#616 a fit start scale is the fit of the parent's content box", () => {
    expect.hasAssertions();

    const fitMeasure = {
      center: { x: 200, y: 100 },
      parent: { height: 100, left: 0, top: 0, width: 200 },
      size: { height: 200, width: 400 },
    };

    expect(getPanzoomStartState({ scale: 1, x: 0, y: 0 }, fitMeasure, { startScale: "fit" })).toStrictEqual({
      scale: 0.5,
      x: 0,
      y: 0,
    });
  });
});
