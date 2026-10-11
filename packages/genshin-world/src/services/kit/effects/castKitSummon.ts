import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { createKitSummon } from "#src/services/kit/effects/createKitSummon";

// A summon cast onto the team's effects, made as createKitSummon makes it
export const castKitSummon = (kitEffectState: KitEffectState, ...summon: Parameters<typeof createKitSummon>): void =>
  addKitEffect(kitEffectState, createKitSummon(...summon));
