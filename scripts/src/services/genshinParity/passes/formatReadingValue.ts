import type { ParityPassDiagnostic } from "#src/models/genshinParity/shared/ParityPassDiagnostic";
import type { ParityPassReading } from "#src/models/genshinParity/shared/ParityPassReading";

import { formatPassValue } from "#src/services/genshinParity/passes/formatPassValue";

// A reading's or diagnostic's value as the report and the command print it, or the reason no value could be read
export const formatReadingValue = (reading: ParityPassDiagnostic | ParityPassReading): string =>
  "value" in reading ? formatPassValue(reading.value) : reading.reason;
