import type { HomePlant } from "#src/models/home/HomePlant";
import type { HomePlanting } from "#src/models/home/HomePlanting";
import type { InventoryItem } from "#src/models/inventory/InventoryItem";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";

import { plantHomeSeed } from "#src/services/home/plantHomeSeed";
import { countInventoryItem } from "#src/services/inventory/countInventoryItem";
import { ItemCategory } from "genshin-interface";
import { describe, expect, test } from "vitest";

describe(plantHomeSeed, () => {
  const EPOCH = Temporal.Instant.fromEpochMilliseconds(0);
  // Made-up seed, plot and field ids
  const SEED_ID = 101_501;
  const PLOT_ID = 4;
  const OTHER_PLOT_ID = 5;
  const plant: HomePlant = { fieldItemId: 102_001, seconds: 90, seedItemId: SEED_ID };
  const definition: ItemDefinition = {
    category: ItemCategory.Material,
    id: SEED_ID,
    name: "",
    rank: 0,
    rarity: 0,
    stackLimit: 99,
  };
  const bag = (quantity: number): { items: InventoryItem[]; nextId: number; quickSwapItemIds: number[] } => ({
    items: [{ definition, id: 1, quantity }],
    nextId: 2,
    quickSwapItemIds: [],
  });

  test("a seed planted on a free plot is taken from the bag and held on that plot", () => {
    expect.hasAssertions();

    const result = plantHomeSeed(
      { plotId: PLOT_ID, seedItemId: SEED_ID },
      { inventory: bag(2), now: EPOCH, plantings: [], plants: [plant] },
    );

    expect(result?.plantings).toStrictEqual([{ plantedAt: EPOCH, plotId: PLOT_ID, seedItemId: SEED_ID }]);
    expect(countInventoryItem(result?.inventory.items ?? [], SEED_ID)).toBe(1);
  });

  test("a plot already holding a planting takes no other seed", () => {
    expect.hasAssertions();
    const held: HomePlanting = { plantedAt: EPOCH, plotId: PLOT_ID, seedItemId: SEED_ID };

    expect(
      plantHomeSeed(
        { plotId: PLOT_ID, seedItemId: SEED_ID },
        { inventory: bag(2), now: EPOCH, plantings: [held], plants: [plant] },
      ),
    ).toBeUndefined();
    expect(
      plantHomeSeed(
        { plotId: OTHER_PLOT_ID, seedItemId: SEED_ID },
        { inventory: bag(2), now: EPOCH, plantings: [held], plants: [plant] },
      )?.plantings,
    ).toHaveLength(2);
  });
});
