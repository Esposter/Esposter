import { readRegionChestPlaces } from "#src/services/chest/readRegionChestPlaces";
import { describe, expect, test } from "vitest";

describe(readRegionChestPlaces, () => {
  test("A region with no published chest record offers no chest", async () => {
    expect.hasAssertions();

    await expect(readRegionChestPlaces("", "dragonspine")).resolves.toStrictEqual([]);
  });
});
