import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";
import { healGcgCharacter } from "#src/services/gcg/effects/healGcgCharacter";
import { takeOne } from "@esposter/shared";

const DRUNKEN_MIST_DAMAGE = 1;
const DRUNKEN_MIST_HEAL = 2;

// Drunken Mist, which Signature Mix summons: at the end phase, 1 Cryo DMG and 2 HP healed to the active character, for two
// Usages
export const drunkenMist: GcgCardModule = {
  initialUsages: 2,
  onEndPhase: ({ duel, sideIndex }, zoneCard) => {
    const side = takeOne(duel.sides, sideIndex);
    const active = side.characters.at(side.activeIndex);
    if (active) healGcgCharacter(active, DRUNKEN_MIST_HEAL);
    zoneCard.usages -= 1;
    return { damageType: Element.Cryo, value: DRUNKEN_MIST_DAMAGE };
  },
};
