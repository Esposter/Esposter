import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { Element } from "#src/models/Element";
import { drunkenMist } from "#src/services/gcg/cards/drunkenMist";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { healGcgCharacter } from "#src/services/gcg/effects/healGcgCharacter";
import { takeOne } from "@esposter/shared";

const DRUNKEN_MIST_ID = 111_023;
// Signature Mix, Diona's elemental burst: 1 Cryo DMG, the character heals for 2 HP, and a Drunken Mist is summoned (the
// Wiki's Signature Mix (Character Card Skill))
const SIGNATURE_MIX_DAMAGE = 1;
const SIGNATURE_MIX_HEAL = 2;

export const signatureMix: GcgSkillModule = {
  afterDamage: ({ duel, sideIndex }) => {
    const side = takeOne(duel.sides, sideIndex);
    const user = side.characters.at(side.activeIndex);
    if (user) healGcgCharacter(user, SIGNATURE_MIX_HEAL);
    side.summons.push(createGcgZoneCard(DRUNKEN_MIST_ID, drunkenMist));
  },
  getDamage: () => ({ damageType: Element.Cryo, value: SIGNATURE_MIX_DAMAGE }),
};
