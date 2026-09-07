import { BuildingMap } from "#shared/assets/clicker/data/BuildingMap";
import { BuildingId } from "#shared/models/clicker/data/building/BuildingId";
import { getBuildingPrice } from "@/services/clicker/building/getBuildingPrice";
import { describe, expect, test } from "vitest";

describe(getBuildingPrice, () => {
  const cursor = { ...BuildingMap[BuildingId.Cursor], id: BuildingId.Cursor };

  test("grows exponentially per owned unit", () => {
    expect.hasAssertions();

    expect(getBuildingPrice(cursor, 0)).toBe(cursor.basePrice);
    expect(getBuildingPrice(cursor, 1)).toBe(17);
    expect(getBuildingPrice(cursor, 2)).toBe(19);
    expect(getBuildingPrice(cursor, 100)).toBe(17_614_701);
  });
});
