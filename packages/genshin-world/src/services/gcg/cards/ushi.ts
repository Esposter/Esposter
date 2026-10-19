import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";
import type { GcgDuel } from "#src/models/gcg/GcgDuel";

import { Element } from "#src/models/Element";
import { attachSuperlativeSuperstrength } from "#src/services/gcg/cards/superlativeSuperstrength";
import { takeOne } from "@esposter/shared";
import { ARATAKI_ITTO_ID } from "#src/services/gcg/cards/constants";

const USHI_DAMAGE = 1;
const USHI_REDUCTION = 1;
const USHI_USAGES = 1;

// Attaches Superlative Superstrength to Arataki Itto on the side, when she is on it
const attachSuperlativeToItto = (duel: GcgDuel, sideIndex: number): void => {
  const itto = takeOne(duel.sides, sideIndex).characters.find(({ character }) => character.id === ARATAKI_ITTO_ID);
  if (itto) attachSuperlativeSuperstrength(itto);
};

// Ushi, a summon that lasts the round: while its usage is unspent, the active character takes 1 less DMG. The first DMG that
// Reduction applies to attaches Superlative Superstrength to Arataki Itto, once while Ushi is present. At the End Phase it
// Deals 1 Geo DMG, attaches Superlative Superstrength to Itto, and is discarded. The trigger rides the reduction, so it does not
// Hear standby piercing
export const ushi: GcgCardModule = {
  initialCounter: 1,
  initialRounds: 1,
  // Its usage is counted into usages, which a refresh resets, so a Ushi placed again reduces once more. Its once-while-present
  // Trigger is counter, which a refresh leaves alone, so the Superlative attach does not arm again
  modifyDamageReceived: ({ duel, sideIndex }, value, zoneCard) => {
    if (value <= 0 || zoneCard.usages >= USHI_USAGES) return value;
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
