import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { takeOne } from "@esposter/shared";

// Full HP Critic Up's CRIT Rate at its rank, which its wielder's hits are priced with while its HP is above 90% of its Max HP
export const createFullHPCriticUpPassiveModule = (params: number[]): PassiveModule => {
  const criticalRate = takeOne(params, 0);
  return {
    getPassiveBonuses: (_combatant, healthShare) =>
      healthShare > 0.9 ? [{ amount: criticalRate, attribute: Attribute.CriticalRate }] : [],
  };
};
