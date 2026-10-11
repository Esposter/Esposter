import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { getKitInfusion } from "#src/services/kit/effects/getKitInfusion";
import { infuseKitHits } from "#src/services/kit/effects/infuseKitHits";
import { takeOne } from "@esposter/shared";

// A strike infused as it lands by the infusion on the character that dealt it, if its hit is one of that character's
// Attacks an infusion takes, as an action's hits queued past its end are infused alongside those it landed in its seconds
export const infuseKitStrike = (strike: KitStrike, effects: readonly KitEffect[]): KitStrike => {
  const infusion = getKitInfusion(effects, strike.combatant.characterId);
  if (infusion === undefined) return strike;
  const hits = [strike.hit];
  infuseKitHits(strike.combatant.kit, infusion, hits, 0);
  return { ...strike, hit: takeOne(hits) };
};
