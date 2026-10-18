import type { ParityPassResult } from "#src/models/genshinParity/passes/ParityPassResult";

import { ROW_PREFIX } from "#src/services/genshinParity/passes/constants";
import { toParityPassRows } from "#src/services/genshinParity/passes/toParityPassRows";

// Whether the report holds rows for the pass that the measure now gives different ones
export const checkIsRecordedDifferently = (result: ParityPassResult, recordedRows: readonly string[]): boolean => {
  const recorded = recordedRows.filter((row) => row.startsWith(`${ROW_PREFIX}${result.pass} |`));
  return recorded.length > 0 && recorded.join("\n") !== toParityPassRows(result).join("\n");
};
