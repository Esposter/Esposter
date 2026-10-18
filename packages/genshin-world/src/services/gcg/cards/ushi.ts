import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";
import type { GcgDuel } from "#src/models/gcg/GcgDuel";

import { Element } from "#src/models/Element";
import {
  SUPERLATIVE_SUPERSTRENGTH_ID,
  superlativeSuperstrength,
} from "#src/services/gcg/cards/superlativeSuperstrength";
import { placeGcgZoneCard } from "#src/services/gcg/effects/placeGcgZoneCard";
import { takeOne } from "@esposter/shared";

export const USHI_ID = 116_051;
const ARATAKI_ITTO_ID = 1_605;
const USHI_DAMAGE = 1;
const USHI_REDUCTION = 1;
const USHI_USAGES = 1;

// Attaches Superlative Superstrength to Arataki Itto on the side, when she is on it
const attachSuperlativeToItto = (duel: GcgDuel, sideIndex: number): void => {
  const itto = takeOne(duel.sides, sideIndex).characters.find(({ character }) => character.id === ARATAKI_ITTO_ID);
  if (itto) placeGcgZoneCard(itto.statuses, SUPERLATIVE_SUPERSTRENGTH_ID, superlativeSuperstrength);
};

// Ushi, a summon that lasts the round: while it is present the active character takes 1 less DMG, and the first DMG she
// Takes attaches Superlative Superstrength to Arataki Itto. At the End Phase it deals 1 Geo DMG, attaches Superlative
// Superstrength to Itto, and is discarded. The first-DMG trigger rides the reduction, so it does not hear standby piercing
export const ushi: GcgCardModule = {
  initialCounter: 1,
  initialRounds: 1,
  // Its usage is counted into usages, which a refresh resets, so a Ushi placed again reduces once more. Its once-while-present
  // trigger is counter, which a refresh leaves alone, so the Superlative attach does not arm again
  modifyDamageReceived: ({ duel, sideIndex }, value, zoneCard) => {
    if (zoneCard.usages >= USHI_USAGES) return value;
    zoneCard.usages += 1;
    if (zoneCard.counter > 0) {
      zoneCard.counter -= 1;
      attachSuperlativeToItto(duel, sideIndex);
    }
    return Math.max(0, value - USHI_REDUCTION);
  },
  onEndPhase: ({ duel, sideIndex }) => {
    attachSuperlativeToItto(duel, sideIndex);
    return { damageType: Element.Geo, value: USHI_DAMAGE };
  },
};
