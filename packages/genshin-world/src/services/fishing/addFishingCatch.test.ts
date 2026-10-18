import type { FishReward } from "#src/models/fishing/FishReward";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";
import type { MaterialData } from "#src/models/inventory/MaterialData";

import { MaterialType } from "#src/models/inventory/MaterialType";
import { addFishingCatch } from "#src/services/fishing/addFishingCatch";
import { ItemCategory } from "genshin-interface";
import { describe, expect, test } from "vitest";

describe(addFishingCatch, () => {
  // Two fish share this reward row, which gives the item below and not the fish's own
  const SHARED_REWARD_ID = 242045;
  const REWARD_ITEM_ID = 131044;
  const REWARD_ITEM_NAME_TEXT_ID = "1000001";
  const REWARD_ITEM_NAME = "Glazed Lakka";
  const STACK_LIMIT = 9999;
  const names = { [REWARD_ITEM_NAME_TEXT_ID]: REWARD_ITEM_NAME };
  const rewards = new Map<number, FishReward>([
    [SHARED_REWARD_ID, { rewardId: SHARED_REWARD_ID, rewardItemList: [{ itemCount: 1, itemId: REWARD_ITEM_ID }] }],
  ]);
  const materialDataMap = new Map<number, MaterialData>([
    [
      REWARD_ITEM_ID,
      {
        id: REWARD_ITEM_ID,
        materialType: MaterialType.Exchange,
        nameTextId: REWARD_ITEM_NAME_TEXT_ID,
        rank: 0,
        rarity: 0,
        stackLimit: STACK_LIMIT,
      },
    ],
  ]);
  const definition: ItemDefinition = {
    category: ItemCategory.Material,
    id: REWARD_ITEM_ID,
    name: REWARD_ITEM_NAME,
    rank: 0,
    rarity: 0,
    stackLimit: STACK_LIMIT,
  };

  test("a catch puts the fish in the bag", () => {
    expect.hasAssertions();

    expect(
      addFishingCatch(
        { items: [], nextId: 0, quickSwapItemIds: [] },
        { rewardId: SHARED_REWARD_ID },
        rewards,
        names,
        materialDataMap,
      ),
    ).toStrictEqual({
      inventory: { items: [{ definition, id: 0, quantity: 1 }], nextId: 1, quickSwapItemIds: [] },
      overflow: 0,
    });
  });
});
