import type { ForgeRecipe } from "#src/models/forging/ForgeRecipe";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { ForgeRecipeKind } from "#src/models/forging/ForgeRecipeKind";
import { readAdventureRankTables } from "#src/services/adventureRank/readAdventureRankTables";
import { ADVENTURE_EXP_ITEM_ID, FORGE_ENHANCEMENT_TYPE } from "#src/services/forging/constants";
import { obtainForgeOrder } from "#src/services/forging/obtainForgeOrder";
import { EMPTY_WALLET } from "#src/services/inventory/constants";
import { ItemCategory } from "genshin-interface";
import { describe, expect, test } from "vitest";

const adventureRankTables = await readAdventureRankTables(GAME_DATA_LOCAL_BASE_URL);

describe(obtainForgeOrder, () => {
  const epoch = Temporal.Instant.fromEpochMilliseconds(0);
  const UNIT_SECONDS = 6;
  const EXP_PER_UNIT = 100;
  const recipe: ForgeRecipe = {
    forgePoint: 0,
    forgeType: FORGE_ENHANCEMENT_TYPE,
    id: 11_003,
    kind: ForgeRecipeKind.Enhancement,
    materials: [],
    mora: 0,
    playerLevel: 1,
    queueSize: 1,
    results: [{ count: EXP_PER_UNIT, itemId: ADVENTURE_EXP_ITEM_ID, weight: 1 }],
    seconds: UNIT_SECONDS,
    unlockItemIds: [],
  };
  const order = { count: 1, queueId: 1, recipeId: recipe.id, startedAt: epoch, unitSeconds: UNIT_SECONDS };
  const inventory = { items: [], nextId: 1, quickSwapItemIds: [] };
  const obtainArguments = {
    adventureExp: 0,
    adventureRankTables,
    completedMainQuestIds: new Set<string>(),
    definitions: new Map(),
    inventory,
    random: () => 0,
    talents: [],
    wallet: EMPTY_WALLET,
    weapons: new Map(),
  };

  test("a finished unit's Adventure EXP is gained at the Adventure Rank, and nothing is left queued", () => {
    expect.hasAssertions();

    expect(
      obtainForgeOrder(recipe, order, { ...obtainArguments, now: epoch.add({ seconds: UNIT_SECONDS }) }),
    ).toStrictEqual({ adventureExp: EXP_PER_UNIT, inventory, order: undefined, wallet: EMPTY_WALLET });
  });

  test("obtaining a finished order gives its item and Adventure EXP", () => {
    expect.hasAssertions();

    const ore = {
      category: ItemCategory.Material,
      id: 104_011,
      name: "Enhancement Ore",
      rank: 1,
      rarity: 1,
      stackLimit: 99_999,
    };
    const oreRecipe = {
      ...recipe,
      results: [
        { count: 1, itemId: ore.id, weight: 1 },
        { count: EXP_PER_UNIT, itemId: ADVENTURE_EXP_ITEM_ID, weight: 1 },
      ],
    };
    // The first unit rolls the ore and the second the Adventure EXP, each unit's extra-result roll after its own
    const rolls = [0, 0, 0.99, 0.99];

    const obtained = obtainForgeOrder(
      oreRecipe,
      { ...order, count: 2 },
      {
        ...obtainArguments,
        definitions: new Map([[ore.id, ore]]),
        now: epoch.add({ seconds: 2 * UNIT_SECONDS }),
        random: () => rolls.shift() ?? 0,
      },
    );

    expect({
      adventureExp: obtained.adventureExp,
      items: obtained.inventory.items,
      order: obtained.order,
    }).toStrictEqual({
      adventureExp: EXP_PER_UNIT,
      items: [{ definition: ore, id: 1, quantity: 1 }],
      order: undefined,
    });
  });

  test("a unit still forging gains no Adventure EXP and stays queued", () => {
    expect.hasAssertions();

    expect(obtainForgeOrder(recipe, order, { ...obtainArguments, now: epoch.add({ seconds: 1 }) })).toStrictEqual({
      adventureExp: 0,
      inventory,
      order,
      wallet: EMPTY_WALLET,
    });
  });
});
