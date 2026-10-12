import { getRampWidth } from "#src/character/shading/getRampWidth";
import { describe, expect, test } from "vitest";

describe(getRampWidth, () => {
  test("is the ramp width as the material sets it where the vertex's ramp weight is off", () => {
    expect.hasAssertions();

    expect(getRampWidth({ isVertexRampWidth: false, rampWidth: 0.5, vertexRampWidth: 0.25 })).toBe(0.5);
  });

  test("scales the width by twice the vertex's ramp weight, never below its floor", () => {
    expect.hasAssertions();

    expect(getRampWidth({ isVertexRampWidth: true, rampWidth: 0.5, vertexRampWidth: 0.25 })).toBeCloseTo(0.25);
    expect(getRampWidth({ isVertexRampWidth: true, rampWidth: 0.5, vertexRampWidth: 0 })).toBeCloseTo(0.005);
  });
});
