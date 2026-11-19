import { toRegionCityIds } from "#src/services/genshinAssets/leyLine/toRegionCityIds";
import { describe, expect, test } from "vitest";

describe(toRegionCityIds, () => {
  test("files each region under the city its areas make it", () => {
    expect.hasAssertions();

    expect(
      toRegionCityIds(
        new Map([
          [1, "mondstadt"],
          [7, "nod-krai"],
        ]),
      ),
    ).toStrictEqual({ mondstadt: 1, "nod-krai": 7 });
  });

  test("throws for a region holding two cities, which the world reads one city of", () => {
    expect.hasAssertions();

    expect(() =>
      toRegionCityIds(
        new Map([
          [1, "mondstadt"],
          [9, "mondstadt"],
        ]),
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: mondstadt, holds cities 1 and 9]`,
    );
  });
});
