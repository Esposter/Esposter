import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { countGcgCardUses } from "#src/services/gcg/effects/countGcgCardUses";
import { createGcgWeaponCard } from "#src/services/gcg/effects/createGcgWeaponCard";
import { healGcgCharacter } from "#src/services/gcg/effects/healGcgCharacter";
import { takeOne } from "@esposter/shared";

export const AQUILA_FAVONIA_ID = 311_503;
const AQUILA_FAVONIA_HEAL = 1;
const AQUILA_FAVONIA_HEALS_PER_ROUND = 2;

// Aquila Favonia, a sword that only a sword user may equip, and that makes its character deal +1 DMG. After the opposing
// Character uses a Skill, if this character is the active one, it heals 1 HP, up to twice per Round (the wiki's Aquila
// Favonia (Equipment Card))
export const aquilaFavonia: GcgCardModule = {
  ...createGcgWeaponCard("SWORD"),
  onAnySkillUsed: ({ characterIndex, duel, sideIndex }) => {
    // A Skill resolves before its turn passes, so the acting side is the one that used it
    if (duel.actingSideIndex === sideIndex) return;
    const side = takeOne(duel.sides, sideIndex);
    if (characterIndex === undefined || characterIndex !== side.activeIndex) return;
    if (countGcgCardUses(side, AQUILA_FAVONIA_ID) >= AQUILA_FAVONIA_HEALS_PER_ROUND) return;
    side.usedCardIds.push(AQUILA_FAVONIA_ID);
    healGcgCharacter(takeOne(side.characters, characterIndex), AQUILA_FAVONIA_HEAL);
  },
};
