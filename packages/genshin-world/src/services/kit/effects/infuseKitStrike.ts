import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { getKitInfusion } from "#src/services/kit/effects/getKitInfusion";
import { infuseKitHit } from "#src/services/kit/effects/infuseKitHit";

// A strike infused as it lands by the infusion on the character that dealt it, if its hit sits in an action an infusion
// Takes, as an action's hits queued past its end are infused alongside those it landed in its seconds
export const infuseKitStrike = (strike: KitStrike, effects: readonly KitEffect[]): KitStrike => {
  const infusion = getKitInfusion(effects, strike.combatant.characterId);
  return infusion === undefined ? strike : { ...strike, hit: infuseKitHit(strike.hit, infusion) };
};
