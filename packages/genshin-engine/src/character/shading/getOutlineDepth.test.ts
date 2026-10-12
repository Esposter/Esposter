import { getOutlineDepth } from "#src/character/shading/getOutlineDepth";
import { describe, expect, test } from "vitest";

describe(getOutlineDepth, () => {
  test("is the page's k times the depth, positive ahead of the eye, with k taken from the projection's y scale", () => {
    expect.hasAssertions();

    expect(getOutlineDepth(-2, 1)).toBeCloseTo(4.828);
    expect(getOutlineDepth(-2, 2)).toBeCloseTo(2.414);
  });
});
