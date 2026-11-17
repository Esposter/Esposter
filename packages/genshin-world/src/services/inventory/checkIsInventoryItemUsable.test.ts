import type { HomeBlueprint } from "#src/models/home/HomeBlueprint";
import type { InventoryItem } from "#src/models/inventory/InventoryItem";

import { createForgeProgress } from "#src/services/forging/createForgeProgress";
import { checkIsInventoryItemUsable } from "#src/services/inventory/checkIsInventoryItemUsable";
import {
  BLUEPRINT_DIAGRAM_ID,
  COOKING_RECIPE,
  CRAFTING_INSTRUCTION_ID,
  CRAFTING_RECIPE,
  FORGE_DIAGRAM_ID,
  FORGE_RECIPE,
  HOME_BLUEPRINT,
  HOME_PROGRESS,
  INSTRUCTION_ITEM_ID,
} from "#src/services/inventory/constants.test";
import { ItemCategory } from "genshin-interface";
import { describe, expect, test } from "vitest";

// An item of the bag the test's kind is read from, with one of its definition's fields varied by the id alone
const createItem = (id: number): InventoryItem => ({
  definition: { category: ItemCategory.Material, id, name: "", rank: 0, rarity: 0, stackLimit: 99 },
  id: 1,
  quantity: 1,
});

describe(checkIsInventoryItemUsable, () => {
  const EPOCH = Temporal.Instant.fromEpochMilliseconds(0);
  const options = {
    blueprintMap: new Map<number, HomeBlueprint>(),
    cookingProgress: { learnedRecipeIds: [], proficiencies: {} },
    craftingProgress: { learnedRecipeIds: [] },
    craftingRecipeMap: new Map(),
    dishUseMap: new Map(),
    forgeProgress: createForgeProgress(EPOCH),
    forgeRecipeMap: new Map(),
    homeProgress: HOME_PROGRESS,
    instructionRecipeMap: new Map([[INSTRUCTION_ITEM_ID, COOKING_RECIPE]]),
  };

  test("an instruction item is usable until its dish is learned", () => {
    expect.hasAssertions();

    expect(checkIsInventoryItemUsable(createItem(INSTRUCTION_ITEM_ID), options)).toBe(true);
    expect(
      checkIsInventoryItemUsable(createItem(INSTRUCTION_ITEM_ID), {
        ...options,
        cookingProgress: { learnedRecipeIds: [COOKING_RECIPE.id], proficiencies: {} },
      }),
    ).toBe(false);
  });

  test("a forge diagram is usable until its recipe is learned", () => {
    expect.hasAssertions();
    const forgeOptions = { ...options, forgeRecipeMap: new Map([[FORGE_DIAGRAM_ID, FORGE_RECIPE]]) };

    expect(checkIsInventoryItemUsable(createItem(FORGE_DIAGRAM_ID), forgeOptions)).toBe(true);
    expect(
      checkIsInventoryItemUsable(createItem(FORGE_DIAGRAM_ID), {
        ...forgeOptions,
        forgeProgress: { ...forgeOptions.forgeProgress, learnedRecipeIds: [FORGE_RECIPE.id] },
      }),
    ).toBe(false);
  });

  test("a crafting instruction is usable until its recipe is learned", () => {
    expect.hasAssertions();
    const craftingOptions = { ...options, craftingRecipeMap: new Map([[CRAFTING_INSTRUCTION_ID, CRAFTING_RECIPE]]) };

    expect(checkIsInventoryItemUsable(createItem(CRAFTING_INSTRUCTION_ID), craftingOptions)).toBe(true);
    expect(
      checkIsInventoryItemUsable(createItem(CRAFTING_INSTRUCTION_ID), {
        ...craftingOptions,
        craftingProgress: { learnedRecipeIds: [CRAFTING_RECIPE.id] },
      }),
    ).toBe(false);
  });

  test("a blueprint's diagram is usable until its blueprint is learned", () => {
    expect.hasAssertions();
    const blueprintOptions = { ...options, blueprintMap: new Map([[BLUEPRINT_DIAGRAM_ID, HOME_BLUEPRINT]]) };

    expect(checkIsInventoryItemUsable(createItem(BLUEPRINT_DIAGRAM_ID), blueprintOptions)).toBe(true);
    expect(
      checkIsInventoryItemUsable(createItem(BLUEPRINT_DIAGRAM_ID), {
        ...blueprintOptions,
        homeProgress: { ...HOME_PROGRESS, learnedBlueprintIds: [HOME_BLUEPRINT.id] },
      }),
    ).toBe(false);
  });
});
