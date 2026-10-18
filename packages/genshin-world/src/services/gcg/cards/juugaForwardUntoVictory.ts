import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { Element } from "#src/models/Element";
import { generalsGlory } from "#src/services/gcg/cards/generalsGlory";
import { GENERALS_GLORY_ID, GENERALS_WAR_BANNER_ID } from "#src/services/gcg/cards/constants";
import { generalsWarBanner } from "#src/services/gcg/cards/generalsWarBanner";
import { placeGcgZoneCard } from "#src/services/gcg/effects/placeGcgZoneCard";
import { takeOne } from "@esposter/shared";

const JUUGA_FORWARD_UNTO_VICTORY_DAMAGE = 2;

// Juuga: Forward Unto Victory, Gorou's Elemental Burst: 2 Geo DMG, a General's War Banner on her side, and General's Glory
// Summoned beside it
export const juugaForwardUntoVictory: GcgSkillModule = {
  afterDamage: ({ duel, sideIndex }) => {
    const side = takeOne(duel.sides, sideIndex);
    placeGcgZoneCard(side.onstages, GENERALS_WAR_BANNER_ID, generalsWarBanner);
    placeGcgZoneCard(side.summons, GENERALS_GLORY_ID, generalsGlory);
  },
  getDamage: () => ({ damageType: Element.Geo, value: JUUGA_FORWARD_UNTO_VICTORY_DAMAGE }),
};
