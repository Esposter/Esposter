import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";
import { GcgDamageKind } from "#src/models/gcg/GcgDamageKind";
import { STONEHIDE_ID } from "#src/services/gcg/cards/stonehide";
import { takeOne } from "@esposter/shared";

export const STONE_FORCE_ID = 126_012;
const STONE_FORCE_BONUS = 1;

// Stone Force, a status on the character it is attached to: its Physical DMG is converted to Geo DMG, and its first DMG of
// Each round is one more. The card is spent at the end phase once its character holds no Stonehide, which approximates
// "removed alongside it": a Stonehide spent mid-round leaves the card's effects standing until the end phase
export const stoneForce: GcgCardModule = {
  initialUsages: 1,
  modifyDamageDealt: (context, damage) => {
    const converted = damage.damageType === GcgDamageKind.Physical ? { ...damage, damageType: Element.Geo } : damage;
    const side = takeOne(context.duel.sides, context.sideIndex);
    if (side.usedCardIds.includes(STONE_FORCE_ID)) return converted;
    side.usedCardIds.push(STONE_FORCE_ID);
    return { ...converted, value: converted.value + STONE_FORCE_BONUS };
  },
  onEndPhase: ({ characterIndex, duel, sideIndex }, zoneCard) => {
    const character =
      characterIndex === undefined ? undefined : takeOne(duel.sides, sideIndex).characters.at(characterIndex);
    if (!character?.statuses.some(({ cardId }) => cardId === STONEHIDE_ID)) zoneCard.usages = 0;
    return undefined;
  },
};
