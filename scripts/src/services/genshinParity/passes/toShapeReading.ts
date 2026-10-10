import type { ParityPassReading } from "#src/models/genshinParity/passes/ParityPassReading";

// The reason a family's depth or normal is read as when ours draws none of it where the exports do
export const NO_OVERLAP_REASON = "no overlap";
// A reading of a family's shape, or the reason it has none where the two draw no pixel of it in common
export const toShapeReading = (
  name: string,
  gate: number,
  unit: string,
  value: number | undefined,
): ParityPassReading =>
  value === undefined ? { gate, name, reason: NO_OVERLAP_REASON, unit } : { gate, name, unit, value };
