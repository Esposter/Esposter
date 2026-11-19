import type { ParityPassResult } from "#src/models/genshinParity/passes/ParityPassResult";

import { checkIsReadingHeld } from "#src/services/genshinParity/passes/checkIsReadingHeld";
import { HELD_NO, HELD_YES, NOT_GATED, ROW_PREFIX } from "#src/services/genshinParity/passes/constants";
import { formatPassValue } from "#src/services/genshinParity/passes/formatPassValue";
import { formatReadingUnit } from "#src/services/genshinParity/passes/formatReadingUnit";
import { formatReadingValue } from "#src/services/genshinParity/passes/formatReadingValue";

// One pass's rows in the report: a row for each reading and each diagnostic after them, or one row with its notes where
// Nothing was read or recorded. A diagnostic's gate and held cells say it is not gated
export const toParityPassRows = ({
  measure: { diagnostics = [], notes, readings },
  pass,
}: ParityPassResult): string[] =>
  readings.length === 0 && diagnostics.length === 0
    ? [`${ROW_PREFIX}${pass} | ${notes.join("; ")} | | | | ${HELD_NO} |`]
    : [
        ...readings.map(
          (reading) =>
            `${ROW_PREFIX}${pass} | ${reading.name} | ${formatReadingValue(reading)} | ${formatPassValue(reading.gate)} | ${formatReadingUnit(reading)} | ${checkIsReadingHeld(reading) ? HELD_YES : HELD_NO} |`,
        ),
        ...diagnostics.map(
          (diagnostic) =>
            `${ROW_PREFIX}${pass} | ${diagnostic.name} | ${formatReadingValue(diagnostic)} | ${NOT_GATED} | ${formatReadingUnit(diagnostic)} | ${NOT_GATED} |`,
        ),
      ];
