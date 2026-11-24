import type { PerpetualMechanicalArrayFight } from "#src/models/bosses/PerpetualMechanicalArrayFight";

import { PERPETUAL_MECHANICAL_ARRAY_HEALTH_GATE } from "#src/services/bosses/constants";

// The share of max health the boss can be damaged down to: the gate until Defensive Mode is triggered, then none.
export const computePerpetualMechanicalArrayHealthFloor = (fight: PerpetualMechanicalArrayFight): number =>
  fight.isDefensiveModeTriggered ? 0 : PERPETUAL_MECHANICAL_ARRAY_HEALTH_GATE;
