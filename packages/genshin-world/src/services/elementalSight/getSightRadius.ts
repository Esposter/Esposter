import type { ElementalSight } from "#src/models/sight/ElementalSight";

import { SIGHT_REACH, SIGHT_SPREAD_SPEED } from "#src/services/elementalSight/constants";

// How far the range has spread from where the sight was turned on, in metres, held at its reach once it is there
export const getSightRadius = ({ spreadSeconds }: ElementalSight): number =>
  Math.min(spreadSeconds * SIGHT_SPREAD_SPEED, SIGHT_REACH);
