import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";
import { applyGcgCrowfeatherCover } from "#src/services/gcg/cards/crowfeatherCover";
import { takeOne } from "@esposter/shared";

export const TENGU_JUURAI_AMBUSH_ID = 114_061;
const TENGU_JUURAI_AMBUSH_DAMAGE = 1;

// Tengu Juurai: Ambush, Kujou Sara's summon: End Phase 1 Electro DMG, and Crowfeather Cover to her side's active character
// (the wiki's Tengu Juurai: Ambush). It is spent after its one usage
export const tenguJuuraiAmbush: GcgCardModule = {
  initialUsages: 1,
  onEndPhase: ({ duel, sideIndex }, zoneCard) => {
    zoneCard.usages -= 1;
    applyGcgCrowfeatherCover(takeOne(duel.sides, sideIndex));
    return { damageType: Element.Electro, value: TENGU_JUURAI_AMBUSH_DAMAGE };
  },
};
