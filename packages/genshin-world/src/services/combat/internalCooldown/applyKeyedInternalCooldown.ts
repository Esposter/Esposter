import type { InternalCooldown } from "#src/models/combat/InternalCooldown";
import type { InternalCooldownGroup } from "#src/models/combat/InternalCooldownGroup";

import { applyInternalCooldown } from "#src/services/combat/internalCooldown/applyInternalCooldown";

// A hit counted into the internal cooldown a target keeps under its key, started on the first hit to reach it, and the
// Share its group's sequence holds for it
export const applyKeyedInternalCooldown = (
  internalCooldownMap: Map<string, InternalCooldown>,
  key: string,
  internalCooldownGroup: InternalCooldownGroup,
  seconds: number,
): number => {
  const internalCooldown = internalCooldownMap.get(key) ?? { hitIndex: 0, startSeconds: -Infinity };
  internalCooldownMap.set(key, internalCooldown);
  return applyInternalCooldown(internalCooldown, internalCooldownGroup, seconds);
};
