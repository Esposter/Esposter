import type { HomeBlueprint } from "#src/models/home/HomeBlueprint";
import type { HomeProgress } from "#src/models/home/HomeProgress";
import type { InventoryItem } from "#src/models/inventory/InventoryItem";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";

import { startHomeMake } from "#src/services/home/startHomeMake";
import { countInventoryItem } from "#src/services/inventory/countInventoryItem";
import { ItemCategory } from "genshin-interface";
import { describe, expect, test } from "vitest";

describe(startHomeMake, () => {
  const EPOCH = Temporal.Instant.fromEpochMilliseconds(0);
  const MATERIAL_ID = 101_307;
  const DIAGRAM_ID = 380_101;
  const TRUST_RANK = 1;
  const blueprint: HomeBlueprint = {
    id: 360_101,
    materials: [{ count: 8, id: MATERIAL_ID }],
    seconds: 50_400,
    trustExp: 60,
    unlockItemIds: [DIAGRAM_ID],
  };
  const definition: ItemDefinition = {
    category: ItemCategory.Material,
    id: MATERIAL_ID,
    name: "",
    rank: 0,
    rarity: 0,
    stackLimit: 99,
  };
  const progress: HomeProgress = {
    accruedAt: EPOCH,
    learnedBlueprintIds: [blueprint.id],
    madeBlueprintIds: [],
    orders: [],
    realmBounty: 0,
    realmCurrency: 0,
    trustExp: 0,
  };
  const bag = (quantity: number): { items: InventoryItem[]; nextId: number } => ({
    items: [{ definition, id: 1, quantity }],
    nextId: 2,
  });

  test("should take the materials and queue the furnishing from now", () => {
    expect.hasAssertions();

    const result = startHomeMake(blueprint, { inventory: bag(8), now: EPOCH, progress, trustRank: TRUST_RANK });

    expect(countInventoryItem(result?.inventory.items ?? [], MATERIAL_ID)).toBe(0);
    expect(result?.progress.orders).toStrictEqual([{ blueprintId: blueprint.id, startedAt: EPOCH }]);
  });

  test("should refuse a furnishing whose blueprint is not learned from its diagram", () => {
    expect.hasAssertions();

    const result = startHomeMake(blueprint, {
      inventory: bag(8),
      now: EPOCH,
      progress: { ...progress, learnedBlueprintIds: [] },
      trustRank: TRUST_RANK,
    });

    expect(result).toBeUndefined();
  });

  test("should refuse a furnishing once every queue the Trust Rank opens is busy", () => {
    expect.hasAssertions();

    const busy = { ...progress, orders: [{ blueprintId: blueprint.id, startedAt: EPOCH }] };

    expect(
      startHomeMake(blueprint, { inventory: bag(8), now: EPOCH, progress: busy, trustRank: TRUST_RANK }),
    ).toBeUndefined();
  });
});
