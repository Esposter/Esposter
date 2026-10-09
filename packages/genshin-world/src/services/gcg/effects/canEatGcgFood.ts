import type { GcgDuel } from "#src/models/gcg/GcgDuel";

import { GCG_FOOD_STATUS_CARD_IDS } from "#src/services/gcg/constants";
import { takeOne } from "@esposter/shared";

// Whether a standing target holds no food status this round, the one food a character may eat a round
export const canEatGcgFood = (duel: GcgDuel, sideIndex: number, targetIndex: number | undefined): boolean => {
  const character = targetIndex === undefined ? undefined : takeOne(duel.sides, sideIndex).characters.at(targetIndex);
  return (
    character !== undefined &&
    character.hp > 0 &&
    !character.statuses.some(({ cardId }) => GCG_FOOD_STATUS_CARD_IDS.includes(cardId))
  );
};
