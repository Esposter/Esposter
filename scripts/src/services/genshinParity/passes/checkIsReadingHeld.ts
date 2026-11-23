import type { ParityPassReading } from "#src/models/genshinParity/shared/ParityPassReading";

// Whether a reading holds its gate: a reading no value could be read for holds none, and a strict one holds only below
// Its gate
export const checkIsReadingHeld = (reading: ParityPassReading): boolean =>
  "value" in reading && (reading.strict ? reading.value < reading.gate : reading.value <= reading.gate);
