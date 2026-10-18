import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { Element } from "#src/models/Element";
import { cuileinAnbar } from "#src/services/gcg/cards/cuileinAnbar";
import { createGcgSummonAfterDamage } from "#src/services/gcg/effects/createGcgSummonAfterDamage";

const CUILEIN_ANBAR_ID = 117_011;
// Trump-Card Kitty, Collei's elemental burst: 2 Dendro DMG, and a Cuilein-Anbar is summoned once the damage is dealt
// (the wiki's Trump-Card Kitty (Character Card Skill))
const TRUMP_CARD_KITTY_DAMAGE = 2;

export const trumpCardKitty: GcgSkillModule = {
  afterDamage: createGcgSummonAfterDamage(CUILEIN_ANBAR_ID, cuileinAnbar),
  getDamage: () => ({ damageType: Element.Dendro, value: TRUMP_CARD_KITTY_DAMAGE }),
};
