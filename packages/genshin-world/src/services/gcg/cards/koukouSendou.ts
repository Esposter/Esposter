import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { Element } from "#src/models/Element";
import { TENGU_JUURAI_STORMCLUSTER_ID } from "#src/services/gcg/cards/constants";
import { tenguJuuraiStormcluster } from "#src/services/gcg/cards/tenguJuuraiStormcluster";
import { createGcgSummonAfterDamage } from "#src/services/gcg/effects/createGcgSummonAfterDamage";

const KOUKOU_SENDOU_DAMAGE = 2;

// Subjugation: Koukou Sendou, Kujou Sara's elemental burst: 2 Electro DMG, and Tengu Juurai: Stormcluster is summoned (the
// Wiki's Subjugation: Koukou Sendou)
export const koukouSendou: GcgSkillModule = {
  afterDamage: createGcgSummonAfterDamage(TENGU_JUURAI_STORMCLUSTER_ID, tenguJuuraiStormcluster),
  getDamage: () => ({ damageType: Element.Electro, value: KOUKOU_SENDOU_DAMAGE }),
};
