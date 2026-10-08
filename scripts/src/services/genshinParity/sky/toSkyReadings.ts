import type { ParityPassReading } from "#src/models/genshinParity/passes/ParityPassReading";
import type { SkyDistance } from "#src/models/genshinParity/sky/SkyDistance";

import { COLOUR_GATE } from "#src/services/genshinParity/passes/constants";

// How far a sky stands from a reference's as the atmosphere pass's readings: each statistic against the spread two
// Halves of the reference's own sky stand apart, the clear sky's colour against the distance two colours side by side
// Are told apart at, and the clouds' colour against that or their halves' spread, whichever is wider, since a sky's
// Clouds hold far fewer pixels than its clear sky and their colours stray further from half to half
export const toSkyReadings = (
  referenceId: string,
  distance: SkyDistance,
  spread: SkyDistance,
): Extract<ParityPassReading, { value: number }>[] => [
  { gate: COLOUR_GATE, name: `${referenceId} clear sky colour`, unit: "ΔE", value: distance.colour },
  {
    gate: Math.max(COLOUR_GATE, spread.cloudColour),
    name: `${referenceId} cloud colour`,
    unit: "ΔE",
    value: distance.cloudColour,
  },
  { gate: spread.cover, name: `${referenceId} cloud cover`, unit: "share", value: distance.cover },
  { gate: spread.brightness, name: `${referenceId} cloud brightness`, unit: "log ratio", value: distance.brightness },
  { gate: spread.edgeSharpness, name: `${referenceId} cloud edges`, unit: "share", value: distance.edgeSharpness },
  { gate: spread.spread, name: `${referenceId} cloud spread`, unit: "share", value: distance.spread },
];
