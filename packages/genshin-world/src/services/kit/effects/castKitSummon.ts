import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { createKitSummon } from "#src/services/kit/effects/createKitSummon";

// A summon cast onto the team's effects, made as createKitSummon makes it, and returned for a kit that reads it again
export const castKitSummon = (
  kitEffectState: KitEffectState,
  ...summon: Parameters<typeof createKitSummon>
): KitSummon => {
  const kitSummon = createKitSummon(...summon);
  addKitEffect(kitEffectState, kitSummon);
  return kitSummon;
};
