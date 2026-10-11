import type { ElementalState } from "#src/models/combat/ElementalState";

import { BURNING_PYRO_GAUGE } from "#src/services/combat/aura/constants";
import { applyInternalCooldown } from "#src/services/combat/internalCooldown/applyInternalCooldown";
import { BURNING_INTERNAL_COOLDOWN_GROUP } from "#src/services/combat/internalCooldown/constants";

// The Pyro a Burning tick applies to a target at its moment, counted in place into the Burning internal cooldown the
// Target keeps, whichever target's Burning the tick is
export const applyBurningInternalCooldown = (state: ElementalState): number =>
  BURNING_PYRO_GAUGE *
  applyInternalCooldown(state.burningInternalCooldown, BURNING_INTERNAL_COOLDOWN_GROUP, state.seconds);
