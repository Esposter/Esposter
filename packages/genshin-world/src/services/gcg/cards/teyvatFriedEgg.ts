import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { GCG_FOOD_STATUS_CARD_IDS } from "#src/services/gcg/constants";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { healGcgCharacter } from "#src/services/gcg/effects/healGcgCharacter";
import { reviveGcgCharacter } from "#src/services/gcg/effects/reviveGcgCharacter";
import { takeOne } from "@esposter/shared";

const TEYVAT_FRIED_EGG_ID = 333_009;

// Teyvat Fried Egg, a food: a defeated target is revived to 1 HP and healed for 1 HP more, and the food is held as a status
// Until the round ends. One character a round is revived this way, and a food-holding character eats no other food
export const teyvatFriedEgg: GcgCardModule = {
  canPlay: ({ duel, sideIndex }, targetIndex) => {
    const side = takeOne(duel.sides, sideIndex);
    const character = targetIndex === undefined ? undefined : side.characters.at(targetIndex);
    return (
      character?.hp === 0 &&
      !side.usedCardIds.includes(TEYVAT_FRIED_EGG_ID) &&
      !character.statuses.some(({ cardId }) => GCG_FOOD_STATUS_CARD_IDS.includes(cardId))
    );
  },
  initialRounds: 1,
  play: ({ duel, sideIndex }, targetIndex) => {
    const side = takeOne(duel.sides, sideIndex);
    const character = targetIndex === undefined ? undefined : side.characters.at(targetIndex);
    if (!character) return;
    side.usedCardIds.push(TEYVAT_FRIED_EGG_ID);
    reviveGcgCharacter(character, 1);
    healGcgCharacter(character, 1);
    character.statuses.push(createGcgZoneCard(TEYVAT_FRIED_EGG_ID, teyvatFriedEgg));
  },
};
