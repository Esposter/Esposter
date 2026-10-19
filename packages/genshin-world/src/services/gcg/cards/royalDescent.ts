import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { Element } from "#src/models/Element";
import { RAGING_ONI_KING_ID } from "#src/services/gcg/cards/constants";
import { ragingOniKing } from "#src/services/gcg/cards/ragingOniKing";
import { placeGcgZoneCard } from "#src/services/gcg/effects/placeGcgZoneCard";
import { takeOne } from "@esposter/shared";

const ROYAL_DESCENT_DAMAGE = 4;

// Royal Descent: Behold, Itto the Evil!, Arataki Itto's Elemental Burst: 4 Geo DMG, and her active character gains Raging Oni
// King once the damage is dealt
export const royalDescent: GcgSkillModule = {
  afterDamage: ({ duel, sideIndex }) => {
    const side = takeOne(duel.sides, sideIndex);
    placeGcgZoneCard(takeOne(side.characters, side.activeIndex).statuses, RAGING_ONI_KING_ID, ragingOniKing);
  },
  getDamage: () => ({ damageType: Element.Geo, value: ROYAL_DESCENT_DAMAGE }),
};
