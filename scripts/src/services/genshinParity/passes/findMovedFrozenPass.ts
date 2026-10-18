import type { ParityPass } from "#src/models/genshinParity/passes/ParityPass";
import type { ParityPassResult } from "#src/models/genshinParity/passes/ParityPassResult";

import { ROW_PREFIX, toParityPassRows } from "#src/services/genshinParity/passes/toParityPassRows";

// Whether the report holds rows for the pass that the measure now gives different ones
const isRecordedDifferently = (result: ParityPassResult, recordedRows: readonly string[]): boolean => {
  const recorded = recordedRows.filter((row) => row.startsWith(`${ROW_PREFIX}${result.pass} |`));
  return recorded.length > 0 && recorded.join("\n") !== toParityPassRows(result).join("\n");
};
// A pass held on every reference is frozen, and a later pass run cannot move it: when the run re-measures one before it
// And the rows differ from the report's, that pass is named, so the run is refused and the earlier pass is reopened by its
// Own run rather than compensated for here. The pass the run takes up is never compared with its own rows
export const findMovedFrozenPass = ({
  passAlone,
  recordedRows,
  results,
}: {
  passAlone?: ParityPass;
  recordedRows: readonly string[];
  results: readonly ParityPassResult[];
}): ParityPass | undefined => {
  if (!passAlone) return undefined;
  return results.find(
    (result) => result.isHeld && result.pass !== passAlone && isRecordedDifferently(result, recordedRows),
  )?.pass;
};
