import { describe, expect, test } from "vitest";

import { selectRegionGroundKeys } from "#src/services/world/selectRegionGroundKeys";

describe(selectRegionGroundKeys, () => {
  test("selects a region's plateau alone while its lock holds one", () => {
    expect.hasAssertions();

    expect(selectRegionGroundKeys(["ground/alpha", "ground/alpha/one", "ground/beta/two"], "alpha")).toStrictEqual([
      "ground/alpha",
    ]);
  });

  test("selects a region's pieces and their quarters when its lock holds no plateau", () => {
    expect.hasAssertions();

    expect(
      selectRegionGroundKeys(
        ["ground/windrise/0", "ground/windrise/1", "ground/gamma", "ground/windrise/2"],
        "windrise",
      ),
    ).toStrictEqual(["ground/windrise/0", "ground/windrise/1", "ground/windrise/2"]);
  });

  test("selects none of another region's keys", () => {
    expect.hasAssertions();

    expect(selectRegionGroundKeys(["ground/alpha", "ground/beta/two"], "gamma")).toStrictEqual([]);
  });
});
