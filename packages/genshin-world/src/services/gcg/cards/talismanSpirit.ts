import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";
import { GcgDamageKind } from "#src/models/gcg/GcgDamageKind";

export const TALISMAN_SPIRIT_ID = 111_073;
const TALISMAN_SPIRIT_DAMAGE = 1;
const TALISMAN_SPIRIT_BONUS = 1;

// Talisman Spirit, the summon Divine Maiden's Deliverance creates: 1 Cryo DMG at each End Phase, for two usages. While on the
// field, the Cryo and Physical DMG its side deals is 1 more, its own End Phase DMG included
export const talismanSpirit: GcgCardModule = {
  initialUsages: 2,
  modifyDamageDealt: (_context, damage) =>
    damage.damageType === Element.Cryo || damage.damageType === GcgDamageKind.Physical
      ? { ...damage, value: damage.value + TALISMAN_SPIRIT_BONUS }
      : damage,
  onEndPhase: (_context, zoneCard) => {
    zoneCard.usages -= 1;
    return { damageType: Element.Cryo, value: TALISMAN_SPIRIT_DAMAGE };
  },
};
