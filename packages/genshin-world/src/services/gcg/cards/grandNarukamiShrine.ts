import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { GcgDieFace } from "#src/models/gcg/GcgDieFace";
import { GRAND_NARUKAMI_SHRINE_ID } from "#src/services/gcg/cards/constants";
import { createGcgDice } from "#src/services/gcg/effects/createGcgDice";
import { takeOne } from "@esposter/shared";

const GRAND_NARUKAMI_SHRINE_ROUND_LIMIT = 2;

// Grand Narukami Shrine, a Support: after a character of its side uses a Skill, if the total of Elemental Dice is odd, an
// Omni Die is generated, twice per Round
export const grandNarukamiShrine: GcgCardModule = {
  onAnySkillUsed: ({ duel, sideIndex, userSideIndex }) => {
    if (sideIndex !== userSideIndex) return;
    const side = takeOne(duel.sides, sideIndex);
    const usesThisRound = side.usedCardIds.filter((cardId) => cardId === GRAND_NARUKAMI_SHRINE_ID).length;
    if (side.dice.length % 2 === 0 || usesThisRound >= GRAND_NARUKAMI_SHRINE_ROUND_LIMIT) return;
    side.usedCardIds.push(GRAND_NARUKAMI_SHRINE_ID);
    createGcgDice(side, GcgDieFace.Omni, 1);
  },
};
