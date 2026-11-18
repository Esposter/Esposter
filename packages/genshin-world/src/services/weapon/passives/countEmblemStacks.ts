import type { KitEffect } from "#src/models/kit/KitEffect";

import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { countKitHolds } from "#src/services/kit/effects/countKitHolds";
import { EMBLEM_MAXIMUM_STACKS } from "#src/services/weapon/passives/constants";

// The stacks of an Emblem a character holds: each hold of its id, running its own seconds, and the stack an Energy short
// Of full holds while the status of its energy id stands, up to the Emblem's maximum
export const countEmblemStacks = (effects: readonly KitEffect[], characterId: number, id: string): number =>
  Math.min(
    EMBLEM_MAXIMUM_STACKS,
    countKitHolds(effects, characterId, id) + (checkIsKitStatusActive(effects, characterId, `${id}Energy`) ? 1 : 0),
  );
