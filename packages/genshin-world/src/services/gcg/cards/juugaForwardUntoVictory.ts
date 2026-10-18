import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { Element } from "#src/models/Element";
import { GENERALS_GLORY_ID, generalsGlory } from "#src/services/gcg/cards/generalsGlory";
import { placeGeneralsWarBanner } from "#src/services/gcg/cards/generalsWarBanner";
import { placeGcgZoneCard } from "#src/services/gcg/effects/placeGcgZoneCard";
import { takeOne } from "@esposter/shared";

const JUUGA_FORWARD_UNTO_VICTORY_DAMAGE = 2;

// Juuga: Forward Unto Victory, Gorou's Elemental Burst: 2 Geo DMG, a General's War Banner on her side, and General's Glory
// Summoned beside it
export const juugaForwardUntoVictory: GcgSkillModule = {
  afterDamage: ({ duel, sideIndex }) => {
    const side = takeOne(duel.sides, sideIndex);
    placeGeneralsWarBanner(side);
    placeGcgZoneCard(side.summons, GENERALS_GLORY_ID, generalsGlory);
  },
  getDamage: () => ({ damageType: Element.Geo, value: JUUGA_FORWARD_UNTO_VICTORY_DAMAGE }),
};
