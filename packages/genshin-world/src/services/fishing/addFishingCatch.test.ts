import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";

import { addFishingCatch } from "#src/services/fishing/addFishingCatch";
import { ItemCategory } from "genshin-interface";
import { describe, expect, test } from "vitest";

describe(addFishingCatch, () => {
  const FISH_ID = 1;
  const FISH_STACK_LIMIT = 9;
  const fish: ItemDefinition = {
    category: ItemCategory.Material,
    id: FISH_ID,
    name: "",
    rank: 0,
    rarity: 0,
    stackLimit: FISH_STACK_LIMIT,
  };

  test("a catch puts the fish in the bag", () => {
    expect.hasAssertions();

    expect(addFishingCatch({ items: [], nextId: 0 }, [{ definition: fish, itemCount: 1 }])).toStrictEqual({
      inventory: { items: [{ definition: fish, id: 0, quantity: 1 }], nextId: 1 },
      overflow: 0,
    });
  });
});
