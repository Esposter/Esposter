import { BuildingMap } from "@/assets/clicker/data/BuildingMap";
import { describe, expect, test } from "vitest";

describe("BuildingMap", () => {
  test("sorted by price", () => {
    const buildings = Object.values(BuildingMap);
    expect(buildings).toStrictEqual(buildings.toSorted((a, b) => a.basePrice - b.basePrice));
  });
});
