import type { ElementalState } from "#src/models/combat/ElementalState";

import { AuraType } from "#src/models/combat/AuraType";
import { ReactionType } from "#src/models/combat/ReactionType";
import {
  BURNING_AURA_GAUGE,
  FREEZE_DECAY_RATE,
  FREEZE_GAUGE_PER_CONSUMED_GAUGE,
  QUICKEN_BASE_SECONDS,
  QUICKEN_SECONDS_PER_GAUGE,
  SHATTER_FREEZE_GAUGE,
} from "#src/services/combat/aura/constants";
import { consumeAuras } from "#src/services/combat/aura/consumeAuras";
import { exhaustiveGuard } from "@esposter/shared";

// What a reaction leaves on a target or takes from it beyond the gauge it consumed, written in place. Frozen leaves a
// Freeze, kept at the larger gauge over one already there; Quicken leaves its aura, replacing a smaller one; Burning
// Lights its aura and starts its ticks; Shattered takes its gauge from the Freeze; and Crystallize starts its cooldown
export const applyReactionAura = (state: ElementalState, reactionType: ReactionType, consumedGauge: number): void => {
  const { auras, seconds } = state;
  switch (reactionType) {
    case ReactionType.Aggravate:
    case ReactionType.Bloom:
    case ReactionType.Burgeon:
    case ReactionType.ElectroCharged:
    case ReactionType.Hyperbloom:
    case ReactionType.Melt:
    case ReactionType.Overloaded:
    case ReactionType.Spread:
    case ReactionType.Superconduct:
    case ReactionType.Swirl:
    case ReactionType.Vaporize:
      return;
    case ReactionType.Burning:
      auras.set(AuraType.Burning, { decayRate: 0, gauge: BURNING_AURA_GAUGE });
      state.burningSeconds = seconds;
      return;
    case ReactionType.Crystallize:
      state.crystallizeSeconds = seconds;
      return;
    case ReactionType.Frozen: {
      const gauge = FREEZE_GAUGE_PER_CONSUMED_GAUGE * consumedGauge;
      const freeze = auras.get(AuraType.Freeze);
      if (freeze) freeze.gauge = Math.max(freeze.gauge, gauge);
      else auras.set(AuraType.Freeze, { decayRate: FREEZE_DECAY_RATE, gauge });
      return;
    }
    case ReactionType.Quicken: {
      const quicken = auras.get(AuraType.Quicken);
      if (!quicken || consumedGauge > quicken.gauge)
        auras.set(AuraType.Quicken, {
          decayRate: consumedGauge / (QUICKEN_SECONDS_PER_GAUGE * consumedGauge + QUICKEN_BASE_SECONDS),
          gauge: consumedGauge,
        });
      return;
    }
    case ReactionType.Shattered:
      consumeAuras(auras, [AuraType.Freeze], SHATTER_FREEZE_GAUGE);
      return;
    default:
      exhaustiveGuard(reactionType);
  }
};
