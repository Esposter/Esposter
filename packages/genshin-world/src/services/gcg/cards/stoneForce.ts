import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";
import { GcgDamageKind } from "#src/models/gcg/GcgDamageKind";
import { STONEHIDE_ID } from "#src/services/gcg/cards/stonehide";
import { takeOne } from "@esposter/shared";

export const STONE_FORCE_ID = 126_012;
const STONE_FORCE_BONUS = 1;

// Stone Force, a status on the character it is attached to: its Physical DMG is converted to Geo DMG, and its first DMG of
// Each round is one more. It is removed alongside the Stonehide its character holds, so it is taken off once none is left
export const stoneForce: GcgCardModule = {
  isSpent: (side, zoneCard) => {
    const owner = side.characters.find(({ statuses }) => statuses.includes(zoneCard));
    return !owner?.statuses.some(({ cardId }) => cardId === STONEHIDE_ID);
  },
  modifyDamageDealt: (context, damage) => {
    const converted = damage.damageType === GcgDamageKind.Physical ? { ...damage, damageType: Element.Geo } : damage;
    const side = takeOne(context.duel.sides, context.sideIndex);
    if (side.usedCardIds.includes(STONE_FORCE_ID)) return converted;
    side.usedCardIds.push(STONE_FORCE_ID);
    return { ...converted, value: converted.value + STONE_FORCE_BONUS };
  },
};
