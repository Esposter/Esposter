import { findEdgePosition } from "#src/services/genshinParity/probe/findEdgePosition";
import { describe, expect, test } from "vitest";

describe(findEdgePosition, () => {
  test("should place a step halfway up its rise, in samples from the side it is read from", () => {
    expect.hasAssertions();
    expect(findEdgePosition([0, 0, 0, 0, 255, 255, 255, 255])).toBe(3.5);
  });

  test("should read no step where the profile already stands past the halfway level at its first sample", () => {
    expect.hasAssertions();
    expect(findEdgePosition([128, 0, 0, 255, 255])).toBeUndefined();
  });
});
