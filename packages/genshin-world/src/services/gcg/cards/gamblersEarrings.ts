import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { GcgDieFace } from "#src/models/gcg/GcgDieFace";
import { createGcgDice } from "#src/services/gcg/effects/createGcgDice";
import { takeOne } from "@esposter/shared";

const GAMBLERS_EARRINGS_OMNI_COUNT = 2;
const GAMBLERS_EARRINGS_LIMIT = 3;

// Gambler's Earrings, an artifact on a character: after an opposing character is defeated, if the character it is equipped
// To is the active one, two Omni dice are created, three times in a match. The card's counter keeps the count, so the count
// Lasts as long as the card is equipped
export const gamblersEarrings: GcgCardModule = {
  onOpposingDefeated: ({ characterIndex, duel, sideIndex }, zoneCard) => {
    const side = takeOne(duel.sides, sideIndex);
    if (characterIndex !== side.activeIndex || zoneCard.counter >= GAMBLERS_EARRINGS_LIMIT) return;
    zoneCard.counter += 1;
    createGcgDice(side, GcgDieFace.Omni, GAMBLERS_EARRINGS_OMNI_COUNT);
  },
};
