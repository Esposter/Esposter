import type { ParityPassMeasure } from "#src/models/genshinParity/passes/ParityPassMeasure";
import type { SkyDistance } from "#src/models/genshinParity/sky/SkyDistance";

import { COLOUR_GATE } from "#src/services/genshinParity/passes/constants";

// How far a sky stands from a reference's as the atmosphere pass's readings: each statistic against the spread two
// Halves of the reference's own sky stand apart, the clear sky's colour against the distance two colours side by side
// Are told apart at
export const toSkyReadings = (
  referenceId: string,
  distance: SkyDistance,
  spread: SkyDistance,
): ParityPassMeasure["readings"] => [
  { gate: COLOUR_GATE, name: `${referenceId} clear sky colour`, unit: "ΔE", value: distance.colour },
  { gate: spread.cover, name: `${referenceId} cloud cover`, unit: "share", value: distance.cover },
  { gate: spread.brightness, name: `${referenceId} cloud brightness`, unit: "log ratio", value: distance.brightness },
  { gate: spread.edgeSharpness, name: `${referenceId} cloud edges`, unit: "share", value: distance.edgeSharpness },
  { gate: spread.spread, name: `${referenceId} cloud spread`, unit: "share", value: distance.spread },
];
