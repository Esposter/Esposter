import type { Aura } from "#src/models/combat/Aura";

import { AuraType } from "#src/models/combat/AuraType";
import {
  BURNING_DRAIN_PER_DECAY_RATE,
  BURNING_MINIMUM_DRAIN_RATE,
  FREEZE_DECAY_ACCELERATION,
} from "#src/services/combat/aura/constants";
import { extinguishBurning } from "#src/services/combat/aura/extinguishBurning";

// A target's auras decayed over some seconds, in place, each gone once it has no gauge left: a Freeze at its rate as
// It grows, the Dendro and Quicken under a Burning at Burning's drain, and every other aura at its own rate, which for
// A Burning is none
export const decayAuras = (auras: Map<AuraType, Aura>, deltaSeconds: number): void => {
  const isBurning = auras.has(AuraType.Burning);
  for (const [auraType, aura] of auras) {
    if (auraType === AuraType.Freeze) {
      aura.gauge -= (aura.decayRate + (FREEZE_DECAY_ACCELERATION * deltaSeconds) / 2) * deltaSeconds;
      aura.decayRate += FREEZE_DECAY_ACCELERATION * deltaSeconds;
    } else if (isBurning && [AuraType.Dendro, AuraType.Quicken].includes(auraType))
      aura.gauge -= Math.max(BURNING_MINIMUM_DRAIN_RATE, BURNING_DRAIN_PER_DECAY_RATE * aura.decayRate) * deltaSeconds;
    else aura.gauge -= aura.decayRate * deltaSeconds;

    if (aura.gauge <= 0) auras.delete(auraType);
  }

  extinguishBurning(auras);
};
