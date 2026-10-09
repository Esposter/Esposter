import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { Element } from "#src/models/Element";
import { reflection } from "#src/services/gcg/cards/reflection";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { takeOne } from "@esposter/shared";

const REFLECTION_ID = 112_031;
// Mirror Reflection of Doom, Mona's elemental skill: 1 Hydro DMG, and a Reflection is summoned once the damage is dealt
// (the wiki's Mirror Reflection of Doom (Character Card Skill))
const MIRROR_REFLECTION_OF_DOOM_DAMAGE = 1;

export const mirrorReflectionOfDoom: GcgSkillModule = {
  afterDamage: ({ duel, sideIndex }) => {
    takeOne(duel.sides, sideIndex).summons.push(createGcgZoneCard(REFLECTION_ID, reflection));
  },
  getDamage: () => ({ damageType: Element.Hydro, value: MIRROR_REFLECTION_OF_DOOM_DAMAGE }),
};
