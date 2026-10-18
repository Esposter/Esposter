import type { InventoryItem } from "#src/models/inventory/InventoryItem";
import type { MaterialData } from "#src/models/inventory/MaterialData";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Currency } from "#src/models/inventory/Currency";
import { MaterialType } from "#src/models/inventory/MaterialType";
import { readAdventureRankTables } from "#src/services/adventureRank/readAdventureRankTables";
import { CONDENSED_RESIN_ITEM_ID } from "#src/services/crafting/constants";
import { ADVENTURE_EXP_ITEM_ID } from "#src/services/forging/constants";
import { EMPTY_INVENTORY, EMPTY_WALLET, MORA_ITEM_ID } from "#src/services/inventory/constants";
import { ADVENTURE_EXP_PER_RESIN } from "#src/services/originalResin/constants";
import { claimResinReward } from "#src/services/originalResin/claimResinReward";
import { ItemCategory } from "genshin-interface";
import { describe, expect, test } from "vitest";

const adventureRankTables = await readAdventureRankTables(GAME_DATA_LOCAL_BASE_URL);

describe(claimResinReward, () => {
  const epoch = Temporal.Instant.fromEpochMilliseconds(0);
  const noQuest = new Set<string>();
  const names: Readonly<Record<string, string>> = {};
  const MORA_COUNT = 12_000;
  const REWARD_COUNT = 3;
  const REWARD_ITEM_ID = 9001;
  const REWARD_NAME = "Test Reward";
  const REWARD_NAME_TEXT_ID = "9001";
  const REWARD_STACK_LIMIT = 99;
  const RESIN = 20;
  const wallet = { ...EMPTY_WALLET, [Currency.OriginalResin]: 100 };
  const materialDataMap = new Map<number, MaterialData>([
    [
      REWARD_ITEM_ID,
      {
        id: REWARD_ITEM_ID,
        materialType: MaterialType.Exchange,
        nameTextId: REWARD_NAME_TEXT_ID,
        rank: 0,
        rarity: 0,
        stackLimit: REWARD_STACK_LIMIT,
      },
    ],
  ]);
  const condensedResinItem: InventoryItem = {
    definition: {
      category: ItemCategory.Material,
      id: CONDENSED_RESIN_ITEM_ID,
      name: "",
      rank: 0,
      rarity: 0,
      stackLimit: 5,
    },
    id: 0,
    quantity: 1,
  };

  test("a resin claim spends its resin, takes its Adventure EXP and draws its Mora into the wallet once", () => {
    expect.hasAssertions();

    expect(
      claimResinReward(
        adventureRankTables,
        wallet,
        EMPTY_INVENTORY,
        { condensedResinCount: 0, resin: RESIN },
        [
          { count: MORA_COUNT, id: MORA_ITEM_ID },
          { count: 100, id: ADVENTURE_EXP_ITEM_ID },
        ],
        0,
        noQuest,
        epoch,
        names,
        new Map(),
      ),
    ).toStrictEqual({
      adventureExp: RESIN * ADVENTURE_EXP_PER_RESIN,
      inventory: EMPTY_INVENTORY,
      wallet: { ...wallet, [Currency.Mora]: MORA_COUNT, [Currency.OriginalResin]: 100 - RESIN },
    });
  });

  test("choosing an offer spends its resin and grants its rewards", () => {
    expect.hasAssertions();

    expect(
      claimResinReward(
        adventureRankTables,
        wallet,
        EMPTY_INVENTORY,
        { condensedResinCount: 0, resin: RESIN },
        [
          { count: MORA_COUNT, id: MORA_ITEM_ID },
          { count: REWARD_COUNT, id: REWARD_ITEM_ID },
        ],
        0,
        noQuest,
        epoch,
        { [REWARD_NAME_TEXT_ID]: REWARD_NAME },
        materialDataMap,
      ),
    ).toStrictEqual({
      adventureExp: RESIN * ADVENTURE_EXP_PER_RESIN,
      inventory: {
        items: [
          {
            definition: {
              category: ItemCategory.Material,
              id: REWARD_ITEM_ID,
              name: REWARD_NAME,
              rank: 0,
              rarity: 0,
              stackLimit: REWARD_STACK_LIMIT,
            },
            id: 0,
            quantity: REWARD_COUNT,
          },
        ],
        nextId: 1,
      },
      wallet: { ...wallet, [Currency.Mora]: MORA_COUNT, [Currency.OriginalResin]: 100 - RESIN },
    });
  });

  test("a Condensed Resin claim takes its Condensed Resin out of the bag, spending no resin", () => {
    expect.hasAssertions();

    expect(
      claimResinReward(
        adventureRankTables,
        wallet,
        { items: [condensedResinItem], nextId: 1 },
        { condensedResinCount: 1, resin: 0 },
        [{ count: MORA_COUNT, id: MORA_ITEM_ID }],
        0,
        noQuest,
        epoch,
        names,
        new Map(),
      ),
    ).toStrictEqual({
      adventureExp: 0,
      inventory: { items: [], nextId: 1 },
      wallet: { ...wallet, [Currency.Mora]: MORA_COUNT },
    });
  });

  test("a claim without enough resin is refused", () => {
    expect.hasAssertions();

    expect(
      claimResinReward(
        adventureRankTables,
        wallet,
        EMPTY_INVENTORY,
        { condensedResinCount: 0, resin: 101 },
        [{ count: MORA_COUNT, id: MORA_ITEM_ID }],
        0,
        noQuest,
        epoch,
        names,
        new Map(),
      ),
    ).toBeUndefined();
  });

  test("a claim without enough Condensed Resin is refused", () => {
    expect.hasAssertions();

    expect(
      claimResinReward(
        adventureRankTables,
        wallet,
        { items: [condensedResinItem], nextId: 1 },
        { condensedResinCount: 2, resin: 0 },
        [{ count: MORA_COUNT, id: MORA_ITEM_ID }],
        0,
        noQuest,
        epoch,
        names,
        new Map(),
      ),
    ).toBeUndefined();
  });
});
