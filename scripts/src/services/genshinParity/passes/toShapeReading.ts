import type { ParityPassReading } from "#src/models/genshinParity/shared/ParityPassReading";

import { NO_OVERLAP_REASON } from "#src/services/genshinParity/passes/constants";

// A reading of a family's shape, or the reason it has none where the two draw no pixel of it in common
export const toShapeReading = (
  name: string,
  gate: number,
  unit: string,
  value: number | undefined,
): ParityPassReading =>
  value === undefined ? { gate, name, reason: NO_OVERLAP_REASON, unit } : { gate, name, unit, value };
