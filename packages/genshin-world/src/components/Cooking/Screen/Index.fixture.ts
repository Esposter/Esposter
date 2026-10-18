import type { CookingRecipe } from "#src/models/cooking/CookingRecipe";

import { CookingFoodType } from "#src/models/cooking/CookingFoodType";
import { CookingQuality } from "#src/models/cooking/CookingQuality";
import { ENGLISH_GAME_TEXT } from "genshin-text";

// A Sticky Honey Roast-shaped recipe with its zone parameters, the cooking clip's indicator laid out from them
const recipe: CookingRecipe = {
  foodType: CookingFoodType.Heal,
  id: 1001,
  ingredients: [],
  isDefaultUnlocked: true,
  maxProficiency: 2,
  nameTextId: "1",
  qteParam: [0.5, 0.4],
  rankLevel: 1,
  resultItemIds: {
    [CookingQuality.Delicious]: 108_013,
    [CookingQuality.Regular]: 108_012,
    [CookingQuality.Suspicious]: 108_011,
  },
  specialties: [],
  unlockItemIds: [],
};

export const props = { gameText: ENGLISH_GAME_TEXT, pointer: 0.24, recipe };
