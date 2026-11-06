import type { ParityPassResult } from "#src/models/genshinParity/passes/ParityPassResult";

import { checkIsReadingHeld } from "#src/services/genshinParity/passes/checkIsReadingHeld";
import { HELD_NO, HELD_YES, ROW_PREFIX } from "#src/services/genshinParity/passes/constants";
import { formatPassValue } from "#src/services/genshinParity/passes/formatPassValue";
import { formatReadingValue } from "#src/services/genshinParity/passes/formatReadingValue";

// One pass's rows in the report: a row for each reading, or one row with its notes where nothing was read
export const toParityPassRows = ({ measure: { notes, readings }, pass }: ParityPassResult): string[] =>
  readings.length === 0
    ? [`${ROW_PREFIX}${pass} | ${notes.join("; ")} | | | | ${HELD_NO} |`]
    : readings.map(
        (reading) =>
          `${ROW_PREFIX}${pass} | ${reading.name} | ${formatReadingValue(reading)} | ${formatPassValue(reading.gate)} | ${reading.unit} | ${checkIsReadingHeld(reading) ? HELD_YES : HELD_NO} |`,
      );
