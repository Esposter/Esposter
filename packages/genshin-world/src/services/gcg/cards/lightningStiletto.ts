import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import { KEQING_ID, STELLAR_RESTORATION_ID } from "#src/services/gcg/cards/constants";
import { takeOne } from "@esposter/shared";

// Lightning Stiletto, Keqing's talent: Keqing is switched in for free, through the switch path, and she uses Stellar
// Restoration once in its talent variant, which grants her Electro Infusion and creates no other Lightning Stiletto. The
// game's text marks it a combat action, so the Duel passes the turn after it, as `playGcgCard` reads `isCombatAction`
export const lightningStiletto: GcgCardModule = {
  canPlay: ({ duel, sideIndex }) =>
    takeOne(duel.sides, sideIndex).characters.some(({ character, hp }) => character.id === KEQING_ID && hp > 0),
  isCombatAction: true,
  skillOnPlay: () => ({
    costs: [],
    effect: "Char_Skill_14032_Ex_1",
    energyGain: 1,
    id: STELLAR_RESTORATION_ID,
    kind: GcgSkillKind.ElementalSkill,
  }),
  switchOnPlay: ({ duel, sideIndex }) => {
    const index = takeOne(duel.sides, sideIndex).characters.findIndex(({ character }) => character.id === KEQING_ID);
    return index === -1 ? undefined : index;
  },
};
