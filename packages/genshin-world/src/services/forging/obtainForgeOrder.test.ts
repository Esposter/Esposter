import type { ForgeRecipe } from "#src/models/forging/ForgeRecipe";

import { ForgeRecipeKind } from "#src/models/forging/ForgeRecipeKind";
import { ADVENTURE_EXP_ITEM_ID, FORGE_ENHANCEMENT_TYPE } from "#src/services/forging/constants";
import { obtainForgeOrder } from "#src/services/forging/obtainForgeOrder";
import { EMPTY_WALLET } from "#src/services/inventory/constants";
import { describe, expect, test } from "vitest";

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
  const order = { count: 1, recipeId: recipe.id, startedAt: epoch, unitSeconds: UNIT_SECONDS };
  const inventory = { items: [], nextId: 1 };
  const obtainArguments = {
    adventureExp: 0,
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
