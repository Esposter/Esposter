import type { ParityPassReading } from "#src/models/genshinParity/shared/ParityPassReading";

// Whether a reading holds its gate: a reading no value could be read for holds none
export const checkIsReadingHeld = (reading: ParityPassReading): boolean =>
  "value" in reading && reading.value <= reading.gate;
