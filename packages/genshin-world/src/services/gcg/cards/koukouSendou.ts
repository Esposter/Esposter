import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { Element } from "#src/models/Element";
import { TENGU_JUURAI_STORMCLUSTER_ID, tenguJuuraiStormcluster } from "#src/services/gcg/cards/tenguJuuraiStormcluster";
import { placeGcgZoneCard } from "#src/services/gcg/effects/placeGcgZoneCard";
import { takeOne } from "@esposter/shared";

const KOUKOU_SENDOU_DAMAGE = 2;

// Subjugation: Koukou Sendou, Kujou Sara's elemental burst: 2 Electro DMG, and Tengu Juurai: Stormcluster is summoned (the
// wiki's Subjugation: Koukou Sendou)
export const koukouSendou: GcgSkillModule = {
  afterDamage: ({ duel, sideIndex }) => {
    placeGcgZoneCard(takeOne(duel.sides, sideIndex).summons, TENGU_JUURAI_STORMCLUSTER_ID, tenguJuuraiStormcluster);
  },
  getDamage: () => ({ damageType: Element.Electro, value: KOUKOU_SENDOU_DAMAGE }),
};
