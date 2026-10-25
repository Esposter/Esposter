import { computeConvexHull } from "#src/services/genshinAssets/fit/computeConvexHull";
import { describe, expect, test } from "vitest";

describe(computeConvexHull, () => {
  test("keeps a lone point as the whole hull", () => {
    expect.hasAssertions();

    expect(computeConvexHull([[1, 2]])).toStrictEqual([[1, 2]]);
  });
});
