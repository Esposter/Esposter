import type { ParityPassReading } from "#src/models/genshinParity/passes/ParityPassReading";

import { formatPassValue } from "#src/services/genshinParity/passes/formatPassValue";

// A reading's value as the report and the command print it, or the reason no value could be read
export const formatReadingValue = (reading: ParityPassReading): string =>
  "value" in reading ? formatPassValue(reading.value) : reading.reason;
