import { getOutlineScale } from "#src/character/shading/getOutlineScale";
import { Vector3 } from "three";
import { describe, expect, test } from "vitest";

const knotDepths = new Vector3(1, 2, 3);
const knotScales = new Vector3(1, 2, 4);

describe(getOutlineScale, () => {
  test("interpolates the first knot pair below the middle knot's depth", () => {
    expect.hasAssertions();

    expect(getOutlineScale(1.5, knotDepths, knotScales)).toBeCloseTo(1.5);
  });

  test("interpolates the second knot pair at and past the middle knot's depth", () => {
    expect.hasAssertions();

    expect(getOutlineScale(2.5, knotDepths, knotScales)).toBeCloseTo(3);
  });

  test("holds the end scales beyond the outer knots", () => {
    expect.hasAssertions();

    expect(getOutlineScale(0.5, knotDepths, knotScales)).toBe(1);
    expect(getOutlineScale(5, knotDepths, knotScales)).toBe(4);
  });

  test("leaves the width as drawn where every knot's scale is one", () => {
    expect.hasAssertions();

    expect(getOutlineScale(2.5, knotDepths, new Vector3(1, 1, 1))).toBe(1);
  });
});
