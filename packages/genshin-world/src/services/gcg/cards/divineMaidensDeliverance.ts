import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { Element } from "#src/models/Element";
import { TALISMAN_SPIRIT_ID, talismanSpirit } from "#src/services/gcg/cards/talismanSpirit";
import { placeGcgZoneCard } from "#src/services/gcg/effects/placeGcgZoneCard";
import { takeOne } from "@esposter/shared";

const DIVINE_MAIDENS_DELIVERANCE_DAMAGE = 1;

// Divine Maiden's Deliverance, Shenhe's burst: 1 Cryo DMG, and a Talisman Spirit is summoned on her side once the damage is
// dealt (the wiki's Divine Maiden's Deliverance (Character Card Skill))
export const divineMaidensDeliverance: GcgSkillModule = {
  afterDamage: ({ duel, sideIndex }) => {
    placeGcgZoneCard(takeOne(duel.sides, sideIndex).summons, TALISMAN_SPIRIT_ID, talismanSpirit);
  },
  getDamage: () => ({ damageType: Element.Cryo, value: DIVINE_MAIDENS_DELIVERANCE_DAMAGE }),
};
