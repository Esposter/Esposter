import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";
import { checkCanPlayGcgElementalResonance } from "#src/services/gcg/effects/createGcgElementalResonance";
import { placeGcgZoneCard } from "#src/services/gcg/effects/placeGcgZoneCard";
import { takeOne } from "@esposter/shared";

const SHATTERING_ICE_ID = 331_102;
const SHATTERING_ICE_BONUS = 2;

// Elemental Resonance: Shattering Ice, a Cryo Elemental Resonance event: the active character deals 2 more DMG on her next
// instance this Round. It is held as a status on her until that instance, or until the Round ends (the wiki's Elemental
// Resonance: Shattering Ice). It is played with two Cryo characters on its side, as the Elemental Resonance group is
export const shatteringIce: GcgCardModule = {
  canPlay: ({ duel, sideIndex }) => checkCanPlayGcgElementalResonance(takeOne(duel.sides, sideIndex), Element.Cryo),
  initialRounds: 1,
  initialUsages: 1,
  modifyDamageDealt: (_context, damage, zoneCard) => {
    if (zoneCard.usages <= 0) return damage;
    zoneCard.usages -= 1;
    return { ...damage, value: damage.value + SHATTERING_ICE_BONUS };
  },
  play: ({ duel, sideIndex }) => {
    const side = takeOne(duel.sides, sideIndex);
    placeGcgZoneCard(takeOne(side.characters, side.activeIndex).statuses, SHATTERING_ICE_ID, shatteringIce);
  },
};
