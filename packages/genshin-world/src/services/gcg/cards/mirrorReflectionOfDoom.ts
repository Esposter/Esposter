import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { Element } from "#src/models/Element";
import { reflection } from "#src/services/gcg/cards/reflection";
import { createGcgSummonAfterDamage } from "#src/services/gcg/effects/createGcgSummonAfterDamage";
import { REFLECTION_ID } from "#src/services/gcg/cards/constants";

// Mirror Reflection of Doom, Mona's elemental skill: 1 Hydro DMG, and a Reflection is summoned once the damage is dealt
// (the wiki's Mirror Reflection of Doom (Character Card Skill))
const MIRROR_REFLECTION_OF_DOOM_DAMAGE = 1;

export const mirrorReflectionOfDoom: GcgSkillModule = {
  afterDamage: createGcgSummonAfterDamage(REFLECTION_ID, reflection),
  getDamage: () => ({ damageType: Element.Hydro, value: MIRROR_REFLECTION_OF_DOOM_DAMAGE }),
};
