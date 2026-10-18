import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { mushroomPizzaInEffect } from "#src/services/gcg/cards/mushroomPizzaInEffect";
import { addGcgZoneCardToCharacter } from "#src/services/gcg/effects/addGcgZoneCardToCharacter";
import { checkIsGcgFoodEatable } from "#src/services/gcg/effects/checkIsGcgFoodEatable";
import { healGcgCharacter } from "#src/services/gcg/effects/healGcgCharacter";
import { takeOne } from "@esposter/shared";

const MUSHROOM_PIZZA_ID = 333_007;
const MUSHROOM_PIZZA_IN_EFFECT_ID = 303_305;
const HEAL_VALUE = 1;

// Mushroom Pizza, a food: the target character heals 1 HP, holds the food as a status until the Round ends, so it eats no other
// Food this Round, and holds the In Effect status, which heals it at each of the next End Phases
export const mushroomPizza: GcgCardModule = {
  canPlay: ({ duel, sideIndex }, targetIndex) => checkIsGcgFoodEatable(duel, sideIndex, targetIndex),
  initialRounds: 1,
  play: (context, targetIndex) => {
    const character =
      targetIndex === undefined ? undefined : takeOne(context.duel.sides, context.sideIndex).characters.at(targetIndex);
    if (!character) return;
    healGcgCharacter(character, HEAL_VALUE);
    addGcgZoneCardToCharacter(context, targetIndex, MUSHROOM_PIZZA_ID, mushroomPizza);
    addGcgZoneCardToCharacter(context, targetIndex, MUSHROOM_PIZZA_IN_EFFECT_ID, mushroomPizzaInEffect);
  },
};
