// @vitest-environment nuxt
import { BuildingMap } from "#shared/assets/clicker/data/BuildingMap";
import { BuildingId } from "#shared/models/clicker/data/building/BuildingId";
import { useClickerStore } from "@/store/clicker";
import { useBuildingStore } from "@/store/clicker/building";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe(useBuildingStore, () => {
  const cursor = { ...BuildingMap[BuildingId.Cursor], id: BuildingId.Cursor };

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  // The buy button disables on the same price, but it is one caller: the store is what keeps a purchase from
  // Spending points the player does not have
  test("refuses a building the player cannot pay for", () => {
    expect.hasAssertions();

    const clickerStore = useClickerStore();
    const { clicker } = storeToRefs(clickerStore);
    const buildingStore = useBuildingStore();
    const { createBoughtBuilding } = buildingStore;
    createBoughtBuilding(cursor, 1);

    expect(clicker.value.boughtBuildings).toStrictEqual([]);
    expect(clicker.value.pointCount).toBe(0);
  });
});
