import { BuildingMap } from "#shared/assets/clicker/data/BuildingMap";
import { BuildingId } from "#shared/models/clicker/data/building/BuildingId";
import { applyGameTick } from "#src/services/clicker/applyGameTick";
import { FPS } from "#src/services/clicker/constants";
import { createClicker } from "#src/services/clicker/createClicker";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const createBoughtBuilding = (id: BuildingId) => ({ ...BuildingMap[id], amount: 1, id, producedValue: 0 });

describe(applyGameTick, () => {
  const cursorPower = BuildingMap[BuildingId.Cursor].baseValue;
  const grandmaPower = BuildingMap[BuildingId.Grandma].baseValue;

  test("adds summed building power to points and each share to producedValue", () => {
    expect.hasAssertions();

    const clicker = createClicker({
      boughtBuildings: [createBoughtBuilding(BuildingId.Cursor), createBoughtBuilding(BuildingId.Grandma)],
    });
    applyGameTick(clicker);

    expect(clicker.pointCount).toBe((cursorPower + grandmaPower) / FPS);
    expect(takeOne(clicker.boughtBuildings, 0).producedValue).toBe(cursorPower / FPS);
    expect(takeOne(clicker.boughtBuildings, 1).producedValue).toBe(grandmaPower / FPS);
  });

  test("is a no-op without bought buildings", () => {
    expect.hasAssertions();

    const clicker = createClicker();
    applyGameTick(clicker);

    expect(clicker.pointCount).toBe(0);
  });
});
