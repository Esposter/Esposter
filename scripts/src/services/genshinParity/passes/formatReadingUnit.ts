import type { ParityPassDiagnostic } from "#src/models/genshinParity/shared/ParityPassDiagnostic";
import type { ParityPassReading } from "#src/models/genshinParity/shared/ParityPassReading";

// A reading's or diagnostic's unit as the report and the command print it: none where no value was read, since a reason
// Is not a number in any unit
export const formatReadingUnit = (reading: ParityPassDiagnostic | ParityPassReading): string =>
  "value" in reading ? reading.unit : "";
