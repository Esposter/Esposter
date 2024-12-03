import { describe, expect, test } from "vitest";
import { BuildingMap } from "~~/shared/assets/clicker/data/BuildingMap";

describe("buildingMap", () => {
  test("sorted by price", () => {
    expect.hasAssertions();

    const buildings = Object.values(BuildingMap);

    expect(buildings).toStrictEqual(buildings.toSorted((a, b) => a.basePrice - b.basePrice));
  });
});
