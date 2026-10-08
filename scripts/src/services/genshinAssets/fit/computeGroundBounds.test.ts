import { computeGroundBounds } from "#src/services/genshinAssets/fit/computeGroundBounds";
import { describe, expect, test } from "vitest";

describe(computeGroundBounds, () => {
  test("rounds the lowest and highest reached heights outward to the metre, and bounds nothing by an unreached one", () => {
    expect.hasAssertions();

    expect(computeGroundBounds([1.5, Number.NaN, -2.25, 0.5])).toStrictEqual({ maxHeight: 2, minHeight: -3 });
  });
});
