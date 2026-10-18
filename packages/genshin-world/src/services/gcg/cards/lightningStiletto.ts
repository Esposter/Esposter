import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import { takeOne } from "@esposter/shared";

const KEQING_ID = 1403;
const STELLAR_RESTORATION_ID = 14_032;

// Lightning Stiletto, Keqing's talent: Keqing is switched in for free, and she uses Stellar Restoration once in its talent
// Variant, which creates no other Lightning Stiletto. The Electro Infusion it grants is not modelled. The duel plays every
// Card as a fast action, so the card does not end the turn as the game's combat action does
export const lightningStiletto: GcgCardModule = {
  canPlay: ({ duel, sideIndex }) =>
    takeOne(duel.sides, sideIndex).characters.some(({ character, hp }) => character.id === KEQING_ID && hp > 0),
  switchOnPlay: ({ duel, sideIndex }) => {
    const index = takeOne(duel.sides, sideIndex).characters.findIndex(({ character }) => character.id === KEQING_ID);
    return index === -1 ? undefined : index;
  },
  skillOnPlay: () => ({
    costs: [],
    effect: "Char_Skill_14032_Ex_1",
    energyGain: 1,
    id: STELLAR_RESTORATION_ID,
    kind: GcgSkillKind.ElementalSkill,
  }),
};
