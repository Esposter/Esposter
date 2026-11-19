import type { ParityPassDiagnostic } from "#src/models/genshinParity/shared/ParityPassDiagnostic";
import type { ParityPassReading } from "#src/models/genshinParity/shared/ParityPassReading";

import { formatReadingUnit } from "#src/services/genshinParity/passes/formatReadingUnit";
import { formatReadingValue } from "#src/services/genshinParity/passes/formatReadingValue";

// A reading's or diagnostic's value and unit as the command prints them, the unit only where a value was read
export const formatReadingWithUnit = (reading: ParityPassDiagnostic | ParityPassReading): string =>
  [formatReadingValue(reading), formatReadingUnit(reading)].filter((part) => part !== "").join(" ");
