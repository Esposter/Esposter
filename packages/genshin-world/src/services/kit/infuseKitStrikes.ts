import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { getKitInfusion } from "#src/services/kit/effects/getKitInfusion";
import { infuseKitHit } from "#src/services/kit/effects/infuseKitHit";

// The strikes a step lands, each hit infused by its striker's infusion among the effects on the team
export const infuseKitStrikes = (strikes: KitStrike[], effects: readonly KitEffect[]): void => {
  for (const strike of strikes) {
    const strikeInfusion = getKitInfusion(effects, strike.combatant.characterId);
    if (strikeInfusion !== undefined) strike.hit = infuseKitHit(strike.hit, strikeInfusion);
  }
};
