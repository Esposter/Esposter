import type { CookingRecipe } from "#src/models/cooking/CookingRecipe";
import type { CookingTalent } from "#src/models/cooking/CookingTalent";
import type { CookingZones } from "#src/models/cooking/CookingZones";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";

import { CookingFoodType } from "#src/models/cooking/CookingFoodType";
import { CookingQuality } from "#src/models/cooking/CookingQuality";
import { CookingTalentEffect } from "#src/models/cooking/CookingTalentEffect";
import { RAIDEN_SHOGUN_AVATAR_ID } from "#src/services/cooking/constants";
import { cookRecipeByHand } from "#src/services/cooking/cookRecipeByHand";
import { countInventoryItem } from "#src/services/inventory/countInventoryItem";
import { ItemCategory } from "genshin-interface";
import { describe, expect, test } from "vitest";

describe(cookRecipeByHand, () => {
  const AVATAR_ID = 10_001;
  const INGREDIENT_ID = 100_011;
  const DELICIOUS_ITEM_ID = 108_013;
  const REGULAR_ITEM_ID = 108_012;
  const DISH_STACK_LIMIT = 99;
  const DELICIOUS_STOP = 0.5;
  const REGULAR_STOP = 0.35;
  const zones: CookingZones = { delicious: [0.4, 0.6], regular: [0.3, 0.7] };
  const createDefinition = (id: number, stackLimit = DISH_STACK_LIMIT): ItemDefinition => ({
    category: ItemCategory.Food,
    id,
    name: "",
    rank: 0,
    rarity: 0,
    stackLimit,
  });
  const createRecipe = (overrides: Partial<CookingRecipe> = {}): CookingRecipe => ({
    foodType: CookingFoodType.Heal,
    id: 1001,
    ingredients: [{ count: 1, id: INGREDIENT_ID }],
    isDefaultUnlocked: true,
    maxProficiency: 2,
    nameTextId: "1",
    qteParam: [0.5, 0.4],
    rankLevel: 1,
    resultItemIds: {
      [CookingQuality.Delicious]: DELICIOUS_ITEM_ID,
      [CookingQuality.Regular]: REGULAR_ITEM_ID,
      [CookingQuality.Suspicious]: 108_011,
    },
    specialties: [],
    unlockItemIds: [],
    ...overrides,
  });
  const createInventory = (ingredientCount: number) => ({
    items: [{ definition: createDefinition(INGREDIENT_ID), id: 1, quantity: ingredientCount }],
    nextId: 2,
  });
  const cook = (recipe: CookingRecipe, stopPosition: number, avatarId = AVATAR_ID, ingredientCount = 1) =>
    cookRecipeByHand(recipe, {
      avatarId,
      getDefinition: (itemId) => createDefinition(itemId),
      inventory: createInventory(ingredientCount),
      progress: { learnedRecipeIds: [], proficiencies: {} },
      random: () => 0.5,
      stopPosition,
      zones,
    });

  const cookWithTalent = ({
    recipe,
    roll,
    stackLimit = DISH_STACK_LIMIT,
    stopPosition,
    talent,
  }: {
    recipe: CookingRecipe;
    roll: number;
    stackLimit?: number;
    stopPosition: number;
    talent: CookingTalent;
  }) =>
    cookRecipeByHand(recipe, {
      avatarId: AVATAR_ID,
      getDefinition: (itemId) => createDefinition(itemId, stackLimit),
      inventory: createInventory(1),
      progress: { learnedRecipeIds: [], proficiencies: {} },
      random: () => roll,
      stopPosition,
      talent,
      zones,
    });

  test("should take one set of ingredients, put the Delicious dish in the bag and add a proficiency", () => {
    expect.hasAssertions();

    const result = cook(createRecipe(), DELICIOUS_STOP);

    expect(result?.progress.proficiencies).toStrictEqual({ 1001: 1 });
    expect(countInventoryItem(result?.inventory.items ?? [], INGREDIENT_ID)).toBe(0);
    expect(countInventoryItem(result?.inventory.items ?? [], DELICIOUS_ITEM_ID)).toBe(1);
  });

  test("should add no proficiency for a Regular dish", () => {
    expect.hasAssertions();

    const result = cook(createRecipe(), REGULAR_STOP);

    expect(result?.progress.proficiencies).toStrictEqual({});
    expect(countInventoryItem(result?.inventory.items ?? [], REGULAR_ITEM_ID)).toBe(1);
  });

  test("should keep a proficiency at its dish's maximum", () => {
    expect.hasAssertions();

    const recipe = createRecipe({ maxProficiency: 2 });
    const result = cookRecipeByHand(recipe, {
      avatarId: AVATAR_ID,
      getDefinition: (itemId) => createDefinition(itemId),
      inventory: createInventory(1),
      progress: { learnedRecipeIds: [], proficiencies: { [recipe.id]: 2 } },
      random: () => 0.5,
      stopPosition: DELICIOUS_STOP,
      zones,
    });

    expect(result?.progress.proficiencies).toStrictEqual({ 1001: 2 });
  });

  test("should be refused for Raiden Shogun, who the game refuses to cook with", () => {
    expect.hasAssertions();

    expect(cook(createRecipe(), DELICIOUS_STOP, RAIDEN_SHOGUN_AVATAR_ID)).toBeUndefined();
  });

  test("should be refused with no ingredients in the bag", () => {
    expect.hasAssertions();

    expect(cook(createRecipe(), DELICIOUS_STOP, AVATAR_ID, 0)).toBeUndefined();
  });

  test("should be refused where the bag holds too few of an ingredient the dish names twice", () => {
    expect.hasAssertions();

    expect(
      cook(
        createRecipe({
          ingredients: [
            { count: 1, id: INGREDIENT_ID },
            { count: 1, id: INGREDIENT_ID },
          ],
        }),
        DELICIOUS_STOP,
      ),
    ).toBeUndefined();
  });

  test("should be refused for a dish that is not yet known", () => {
    expect.hasAssertions();

    expect(cook(createRecipe({ isDefaultUnlocked: false }), DELICIOUS_STOP)).toBeUndefined();
  });

  const SUSPICIOUS_ITEM_ID = 108_011;
  const SUSPICIOUS_STOP = 0.1;
  const ONE_DISH_STACK_LIMIT = 1;
  const DOUBLE_TALENT: CookingTalent = {
    chance: 12,
    effect: CookingTalentEffect.DoubleProduct,
    foodTypes: [CookingFoodType.Attack],
  };
  const SUSPICIOUS_TALENT: CookingTalent = {
    chance: 18,
    effect: CookingTalentEffect.SuspiciousDish,
    foodTypes: [CookingFoodType.Attack, CookingFoodType.Defense, CookingFoodType.Function, CookingFoodType.Heal],
  };

  test("a perfect cook doubles a delicious dish", () => {
    expect.hasAssertions();

    const result = cookWithTalent({
      recipe: createRecipe({ foodType: CookingFoodType.Attack }),
      roll: 0.05,
      stopPosition: DELICIOUS_STOP,
      talent: DOUBLE_TALENT,
    });

    expect(countInventoryItem(result?.inventory.items ?? [], DELICIOUS_ITEM_ID)).toBe(2);
  });

  test("a talent does not add a dish above its chance", () => {
    expect.hasAssertions();

    const result = cookWithTalent({
      recipe: createRecipe({ foodType: CookingFoodType.Attack }),
      roll: 0.5,
      stopPosition: DELICIOUS_STOP,
      talent: DOUBLE_TALENT,
    });

    expect(countInventoryItem(result?.inventory.items ?? [], DELICIOUS_ITEM_ID)).toBe(1);
  });

  test("a suspicious-dish talent adds a dish on any food type", () => {
    expect.hasAssertions();

    const result = cookWithTalent({
      recipe: createRecipe({ foodType: CookingFoodType.Heal }),
      roll: 0.05,
      stopPosition: SUSPICIOUS_STOP,
      talent: SUSPICIOUS_TALENT,
    });

    expect(countInventoryItem(result?.inventory.items ?? [], SUSPICIOUS_ITEM_ID)).toBe(2);
  });

  test("a talent's extra dish is refused when the bag has no room for it", () => {
    expect.hasAssertions();

    const result = cookWithTalent({
      recipe: createRecipe({ foodType: CookingFoodType.Attack }),
      roll: 0.05,
      stackLimit: ONE_DISH_STACK_LIMIT,
      stopPosition: DELICIOUS_STOP,
      talent: DOUBLE_TALENT,
    });

    expect(result).toBeUndefined();
  });
});
