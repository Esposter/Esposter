import type { SurfaceBend } from "#src/models/genshinParity/passes/SurfaceBend";

import { SHAPE_NORMAL_RESOLUTION_DEGREES } from "#src/services/genshinParity/passes/constants";

// The bend reading a family is gated on: ours' bend less the exports', in degrees, against the floor the exports' own
// Two halves stand apart by, never below what a normal's float target resolves. A family whose exports and ours both
// Bend nothing reads its noise against that resolution, not against its halves' float noise
export const getSurfaceBendReading = ({
  exportsAngle,
  halves: [firstHalf, secondHalf],
  oursAngle,
}: SurfaceBend): { gate: number; value: number } => ({
  gate: Math.max(Math.abs(firstHalf - secondHalf), SHAPE_NORMAL_RESOLUTION_DEGREES),
  value: Math.abs(oursAngle - exportsAngle),
});
