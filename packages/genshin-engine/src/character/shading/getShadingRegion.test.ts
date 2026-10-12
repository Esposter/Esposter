import { getShadingRegion } from "#src/character/shading/getShadingRegion";
import { describe, expect, test } from "vitest";

const allOn = { five: true, four: true, three: true, two: true };
const allOff = { five: false, four: false, three: false, two: false };

describe(getShadingRegion, () => {
  test("selects each region by its band of the lightmap's alpha, from the page's floors", () => {
    expect.hasAssertions();

    expect(getShadingRegion(0.9, allOn)).toBe(2);
    expect(getShadingRegion(0.7, allOn)).toBe(5);
    expect(getShadingRegion(0.5, allOn)).toBe(3);
    expect(getShadingRegion(0.3, allOn)).toBe(4);
    expect(getShadingRegion(0.1, allOn)).toBe(1);
  });

  test("takes each floor into its own band, the floor itself on the band above", () => {
    expect.hasAssertions();

    expect(getShadingRegion(0.8, allOn)).toBe(2);
    expect(getShadingRegion(0.6, allOn)).toBe(5);
    expect(getShadingRegion(0.4, allOn)).toBe(3);
    expect(getShadingRegion(0.2, allOn)).toBe(4);
  });

  test("stays region one where a band's toggle is off", () => {
    expect.hasAssertions();

    expect(getShadingRegion(0.9, allOff)).toBe(1);
    expect(getShadingRegion(0.5, { ...allOn, three: false })).toBe(1);
  });
});
