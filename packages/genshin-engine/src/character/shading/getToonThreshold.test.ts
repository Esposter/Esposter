import { getToonThreshold } from "#src/character/shading/getToonThreshold";
import { describe, expect, test } from "vitest";

describe(getToonThreshold, () => {
  const base = { isLightMapAo: true, isVertexAo: false, lightMapGreen: 0.5, sunTerm: 0, vertexAo: 1 };

  test("is the sun term's half at the neutral green, the remap being zero there", () => {
    expect.hasAssertions();

    expect(getToonThreshold({ ...base, sunTerm: 1 })).toBeCloseTo(0.75);
  });

  test("clamps to zero and one past the page's ends of the remap", () => {
    expect.hasAssertions();

    expect(getToonThreshold({ ...base, lightMapGreen: 0 })).toBe(0);
    expect(getToonThreshold({ ...base, lightMapGreen: 1 })).toBe(1);
  });

  test("remaps the green about the middle, squared with its sign, before mixing the sun term", () => {
    expect.hasAssertions();

    // Remap of 0.6 is 2 * 0.1 * 0.1 + 0.5 = 0.52, and with no sun term z is half of it
    expect(getToonThreshold({ ...base, lightMapGreen: 0.6 })).toBeCloseTo(0.26);
  });

  test("ignores the green where its flag is off, reading the neutral middle instead", () => {
    expect.hasAssertions();

    expect(getToonThreshold({ ...base, isLightMapAo: false, lightMapGreen: 1, sunTerm: 1 })).toBeCloseTo(0.75);
  });

  test("scales the remap by the vertex's ambient occlusion where its flag is set", () => {
    expect.hasAssertions();

    expect(getToonThreshold({ ...base, isVertexAo: true, lightMapGreen: 0.6, vertexAo: 0.5 })).toBeCloseTo(0.13);
  });
});
