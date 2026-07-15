import { Buildings } from "#shared/assets/clicker/data/BuildingMap";
import { describe, expect, test } from "vitest";

describe("buildingMap", () => {
  test("sorted by price", () => {
    expect.hasAssertions();

    expect(Buildings).toStrictEqual(Buildings.toSorted((a, b) => a.basePrice - b.basePrice));
  });
});
