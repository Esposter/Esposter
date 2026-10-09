import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { GcgDieFace } from "#src/models/gcg/GcgDieFace";
import { createGcgDice } from "#src/services/gcg/effects/createGcgDice";
import { takeOne } from "@esposter/shared";

const I_HAVENT_LOST_YET_ID = 332_005;

// I Haven't Lost Yet!: playable only once one of its side's characters is defeated this round, and once a round. It creates
// An Omni die, and the active character gains one energy
export const iHaventLostYet: GcgCardModule = {
  canPlay: ({ duel, sideIndex }) => {
    const side = takeOne(duel.sides, sideIndex);
    return side.hasDefeatedCharacter === true && !side.usedCardIds.includes(I_HAVENT_LOST_YET_ID);
  },
  play: ({ duel, sideIndex }) => {
    const side = takeOne(duel.sides, sideIndex);
    side.usedCardIds.push(I_HAVENT_LOST_YET_ID);
    createGcgDice(side, GcgDieFace.Omni, 1);
    const active = side.characters.at(side.activeIndex);
    if (active) active.energy = Math.min(active.character.maxEnergy, active.energy + 1);
  },
};
