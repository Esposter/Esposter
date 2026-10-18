import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { Element } from "#src/models/Element";
import { TENGU_JUURAI_AMBUSH_ID, tenguJuuraiAmbush } from "#src/services/gcg/cards/tenguJuuraiAmbush";
import { createGcgSummonAfterDamage } from "#src/services/gcg/effects/createGcgSummonAfterDamage";

const TENGU_STORMCALL_DAMAGE = 1;

// Tengu Stormcall, Kujou Sara's elemental skill: 1 Electro DMG, and Tengu Juurai: Ambush is summoned (the wiki's Tengu Stormcall)
export const tenguStormcall: GcgSkillModule = {
  afterDamage: createGcgSummonAfterDamage(TENGU_JUURAI_AMBUSH_ID, tenguJuuraiAmbush),
  getDamage: () => ({ damageType: Element.Electro, value: TENGU_STORMCALL_DAMAGE }),
};
