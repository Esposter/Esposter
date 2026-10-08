import type { Aura } from "#src/models/combat/Aura";

import { AuraType } from "#src/models/combat/AuraType";
import { AURA_BASE_SECONDS, AURA_SECONDS_PER_GAUGE, AURA_TAX } from "#src/services/combat/aura/constants";

// An element's attack left on a target as an aura, written into its auras in place: taxed, and decaying over its
// Duration. Over an aura of its own element it keeps the larger gauge at the first aura's rate, except that a larger
// Pyro replaces the Pyro with its own rate, and Dendro over a burning target replaces the Dendro whatever its gauge
export const applyAura = (auras: Map<AuraType, Aura>, auraType: AuraType, gauge: number): void => {
  const taxedGauge = AURA_TAX * gauge;
  const decayRate = taxedGauge / (AURA_SECONDS_PER_GAUGE * gauge + AURA_BASE_SECONDS);
  const aura = auras.get(auraType);
  if (
    !aura ||
    (auraType === AuraType.Pyro && taxedGauge > aura.gauge) ||
    (auraType === AuraType.Dendro && auras.has(AuraType.Burning))
  )
    auras.set(auraType, { decayRate, gauge: taxedGauge });
  else aura.gauge = Math.max(aura.gauge, taxedGauge);
};
