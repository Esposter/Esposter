import type { Aura } from "#src/models/combat/Aura";

import { AuraType } from "#src/models/combat/AuraType";

// What is left of an element on a target laid on as an aura, written into its auras in place. Over an aura of its own
// Element it keeps the larger gauge at the first aura's rate, except that a larger Pyro replaces the Pyro with its own
// Rate, Dendro over a burning target replaces the Dendro whatever its gauge, and an immutable aura is left as it is
export const applyAura = (auras: Map<AuraType, Aura>, auraType: AuraType, aura: Aura): void => {
  const earlier = auras.get(auraType);
  if (earlier?.isImmutable) return;
  if (
    !earlier ||
    (auraType === AuraType.Pyro && aura.gauge > earlier.gauge) ||
    (auraType === AuraType.Dendro && auras.has(AuraType.Burning))
  )
    auras.set(auraType, aura);
  else earlier.gauge = Math.max(earlier.gauge, aura.gauge);
};
