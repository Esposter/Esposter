import { measureGroundShift } from "#src/services/genshinParity/witness/measureGroundShift";
import { describe, expect, test } from "vitest";

// Ground marked in broad stripes a row a metre, so a shift of the ground is the same shift of rows, and moved toward
// The camera by a later frame painted that far on
const getRow = (distance: number): number => distance;
const paint = (offset: number): number[] =>
  Array.from({ length: 64 }, (_value, row) => Math.sin((row + offset) * 0.3) + Math.sin((row + offset) * 0.17));
describe(measureGroundShift, () => {
  const options = { band: [10, 40] as [number, number], getRow, largestShift: 6, step: 0.25 };

  test("reads the ground's move toward the camera between two frames", () => {
    expect.hasAssertions();
    expect(measureGroundShift(paint(0), paint(2.5), options).shift).toBe(2.5);
  });

  test("reads a held frame as no move", () => {
    expect.hasAssertions();
    expect(measureGroundShift(paint(0), paint(0), options).shift).toBe(0);
  });
});
