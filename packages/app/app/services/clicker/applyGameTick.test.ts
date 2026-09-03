import { BuildingMap } from "#shared/assets/clicker/data/BuildingMap";
import { BuildingId } from "#shared/models/clicker/data/building/BuildingId";
import { Clicker } from "#shared/models/clicker/data/Clicker";
import { applyGameTick } from "@/services/clicker/applyGameTick";
import { FPS } from "@/services/clicker/constants";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const createBoughtBuilding = (id: BuildingId) => ({ ...BuildingMap[id], amount: 1, id, producedValue: 0 });

describe(applyGameTick, () => {
  const cursorPower = BuildingMap[BuildingId.Cursor].baseValue;
  const grandmaPower = BuildingMap[BuildingId.Grandma].baseValue;

  test("adds summed building power to points and each share to producedValue", () => {
    expect.hasAssertions();

    const clicker = new Clicker({
      boughtBuildings: [createBoughtBuilding(BuildingId.Cursor), createBoughtBuilding(BuildingId.Grandma)],
    });
    applyGameTick(clicker);

    expect(clicker.pointCount).toBe((cursorPower + grandmaPower) / FPS);
    expect(takeOne(clicker.boughtBuildings, 0).producedValue).toBe(cursorPower / FPS);
    expect(takeOne(clicker.boughtBuildings, 1).producedValue).toBe(grandmaPower / FPS);
  });

  test("is a no-op without bought buildings", () => {
    expect.hasAssertions();

    const clicker = new Clicker();
    applyGameTick(clicker);

    expect(clicker.pointCount).toBe(0);
  });
});
