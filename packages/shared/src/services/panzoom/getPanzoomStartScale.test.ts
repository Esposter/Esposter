import { getPanzoomStartScale } from "#src/services/panzoom/getPanzoomStartScale";
import { describe, expect, test } from "vitest";

describe(getPanzoomStartScale, () => {
  const measure = {
    center: { x: 200, y: 50 },
    parent: { height: 100, left: 0, top: 0, width: 200 },
    size: { height: 200, width: 400 },
  };

  test("#616 starts at the fit when asked, and at the number otherwise", () => {
    expect.hasAssertions();

    expect(getPanzoomStartScale(measure, { startScale: "fit" })).toBe(0.5);
    expect(getPanzoomStartScale(measure, { startScale: 1 })).toBe(1);
  });

  test("a start scale below the minimum is clamped up to it", () => {
    expect.hasAssertions();

    expect(getPanzoomStartScale(measure, { startScale: 0.05 })).toBe(0.125);
  });
});
