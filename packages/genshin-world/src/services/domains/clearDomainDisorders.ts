import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { DOMAIN_DISORDER_SOURCE } from "#src/services/domains/constants";

// Ends the disorders' bonuses, the team leaving the arena or the challenge ending, and no other buff
export const clearDomainDisorders = (kitEffectState: KitEffectState): void => {
  kitEffectState.effects = kitEffectState.effects.filter(
    (effect) => effect.kind !== "buff" || !effect.source?.startsWith(DOMAIN_DISORDER_SOURCE),
  );
};
