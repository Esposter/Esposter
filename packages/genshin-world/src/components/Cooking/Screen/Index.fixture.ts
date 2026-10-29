import type { CookingRecipe } from "#src/models/cooking/CookingRecipe";

import { englishNameText } from "#parity/englishNameText";
import { CookingFoodType } from "#src/models/cooking/CookingFoodType";
import { CookingQuality } from "#src/models/cooking/CookingQuality";
import { DILUC_CHARACTER_ID } from "#src/services/kit/characters/dilucKit";
import { ENGLISH_GAME_TEXT } from "genshin-text";

// A Sticky Honey Roast-shaped recipe with its zone parameters, the cooking clip's indicator laid out from them
const recipe: CookingRecipe = {
  foodType: CookingFoodType.Heal,
  id: 1001,
  ingredients: [],
  isDefaultUnlocked: true,
  maxProficiency: 2,
  nameTextId: "1",
  qteParam: [0.5, 0.16],
  rankLevel: 1,
  resultItemIds: {
    [CookingQuality.Delicious]: 108_013,
    [CookingQuality.Regular]: 108_012,
    [CookingQuality.Suspicious]: 108_011,
  },
  specialties: [],
  unlockItemIds: [],
};

export const props = {
  avatarId: DILUC_CHARACTER_ID,
  gameText: ENGLISH_GAME_TEXT,
  heldPointer: 0.33,
  inventory: { items: [], nextId: 1, quickSwapItemIds: [] },
  materialDataMap: new Map(),
  nameText: englishNameText,
  progress: { learnedRecipeIds: [], proficiencies: {} },
  random: () => 0.5,
  recipe,
  recipes: [recipe],
};
