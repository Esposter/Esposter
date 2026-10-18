import type { ParityPassResult } from "#src/models/genshinParity/passes/ParityPassResult";

import { getRowPass } from "#src/services/genshinParity/passes/getRowPass";
import { toParityPassRows } from "#src/services/genshinParity/passes/toParityPassRows";

// Whether the report holds rows for the pass that the measure now gives different ones
export const checkIsRecordedDifferently = (result: ParityPassResult, recordedRows: readonly string[]): boolean => {
  const recorded = recordedRows.filter((row) => getRowPass(row) === result.pass);
  return recorded.length > 0 && recorded.join("\n") !== toParityPassRows(result).join("\n");
};
