import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { Element } from "#src/models/Element";
import { DRUNKEN_MIST_ID } from "#src/services/gcg/cards/constants";
import { drunkenMist } from "#src/services/gcg/cards/drunkenMist";
import { healGcgCharacter } from "#src/services/gcg/effects/healGcgCharacter";
import { placeGcgZoneCard } from "#src/services/gcg/effects/placeGcgZoneCard";
import { takeOne } from "@esposter/shared";

// Signature Mix, Diona's elemental burst: 1 Cryo DMG, the character heals for 2 HP, and a Drunken Mist is summoned (the
// Wiki's Signature Mix (Character Card Skill))
const SIGNATURE_MIX_DAMAGE = 1;
const SIGNATURE_MIX_HEAL = 2;

export const signatureMix: GcgSkillModule = {
  afterDamage: ({ duel, sideIndex }) => {
    const side = takeOne(duel.sides, sideIndex);
    const user = side.characters.at(side.activeIndex);
    if (user) healGcgCharacter(user, SIGNATURE_MIX_HEAL);
    placeGcgZoneCard(side.summons, DRUNKEN_MIST_ID, drunkenMist);
  },
  getDamage: () => ({ damageType: Element.Cryo, value: SIGNATURE_MIX_DAMAGE }),
};
