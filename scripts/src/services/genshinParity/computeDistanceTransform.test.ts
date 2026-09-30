import { computeDistanceTransform } from "#src/services/genshinParity/computeDistanceTransform";
import { describe, expect, test } from "vitest";

describe(computeDistanceTransform, () => {
  test("measures each pixel's distance to the nearest set one", () => {
    expect.hasAssertions();

    const mask = Uint8Array.from([1, 0, 0, 0]);

    expect([...computeDistanceTransform(mask, 4, 1)]).toStrictEqual([0, 1, 2, 3]);
  });
});
