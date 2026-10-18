import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";
import { checkIsGcgSwitchCost } from "#src/services/gcg/effects/checkIsGcgSwitchCost";

const CHAINS_OF_WARDING_THUNDER_DAMAGE = 1;

// Chains of Warding Thunder, Electro Hypostasis' summon: 1 Electro DMG at each End Phase, for two usages. While it is on the
// Field, the opposing side spends 1 more die on each switch, once a round (the wiki's Chains of Warding Thunder)
export const chainsOfWardingThunder: GcgCardModule = {
  initialUsages: 2,
  onCostPaid: ({ duel }, subject, zoneCard) => {
    if (checkIsGcgSwitchCost(subject)) zoneCard.counter = duel.round;
  },
  onEndPhase: (_context, zoneCard) => {
    zoneCard.usages -= 1;
    return { damageType: Element.Electro, value: CHAINS_OF_WARDING_THUNDER_DAMAGE };
  },
  surchargeCost: ({ duel }, subject, zoneCard) =>
    checkIsGcgSwitchCost(subject) && zoneCard.counter !== duel.round ? 1 : undefined,
};
