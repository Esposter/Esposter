import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { GCG_SHIELD_LIMIT } from "#src/services/gcg/constants";
import { createGcgWeaponCard } from "#src/services/gcg/effects/createGcgWeaponCard";
import { takeOne } from "@esposter/shared";

const LIYUE = "LIYUE";
const LITHIC_SPEAR_MAX_SHIELD_POINTS = 3;

// Lithic Spear, a pole: the character deals 1 more DMG, and when it is played, she gains a Shield point for each party member
// from Liyue, up to 3 points (the wiki's Lithic Spear (Equipment Card)), held within the shield limit
export const lithicSpear: GcgCardModule = {
  ...createGcgWeaponCard("POLE"),
  play: ({ duel, sideIndex }, targetIndex) => {
    if (targetIndex === undefined) return;
    const side = takeOne(duel.sides, sideIndex);
    const liyueCount = side.characters.filter(({ character }) => character.nation === LIYUE).length;
    const character = takeOne(side.characters, targetIndex);
    const granted = Math.min(liyueCount, LITHIC_SPEAR_MAX_SHIELD_POINTS);
    character.shield = Math.min(GCG_SHIELD_LIMIT, character.shield + granted);
  },
};
