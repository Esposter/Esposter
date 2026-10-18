import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";
import { applyGcgCrowfeatherCover } from "#src/services/gcg/cards/crowfeatherCover";
import { takeOne } from "@esposter/shared";

export const TENGU_JUURAI_STORMCLUSTER_ID = 114_062;
const TENGU_JUURAI_STORMCLUSTER_DAMAGE = 2;

// Tengu Juurai: Stormcluster, Kujou Sara's summon: End Phase 2 Electro DMG, and Crowfeather Cover to her side's active character
// (the wiki's Tengu Juurai: Stormcluster). It is spent after its two usages
export const tenguJuuraiStormcluster: GcgCardModule = {
  initialUsages: 2,
  onEndPhase: ({ duel, sideIndex }, zoneCard) => {
    zoneCard.usages -= 1;
    applyGcgCrowfeatherCover(takeOne(duel.sides, sideIndex));
    return { damageType: Element.Electro, value: TENGU_JUURAI_STORMCLUSTER_DAMAGE };
  },
};
