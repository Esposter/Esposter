import { readRegionChestPlaces } from "#src/services/chest/readRegionChestPlaces";
import { describe, expect, test } from "vitest";

describe(readRegionChestPlaces, () => {
  test("a region the lock holds no chest record for reads none", async () => {
    expect.hasAssertions();

    await expect(readRegionChestPlaces("", "dragonspine")).resolves.toStrictEqual([]);
  });
});
