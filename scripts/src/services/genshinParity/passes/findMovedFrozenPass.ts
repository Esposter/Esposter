import type { ParityPass } from "#src/models/genshinParity/passes/ParityPass";
import type { ParityPassResult } from "#src/models/genshinParity/passes/ParityPassResult";

import { checkIsRecordedDifferently } from "#src/services/genshinParity/passes/checkIsRecordedDifferently";

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
    (result) => result.isHeld && result.pass !== passAlone && checkIsRecordedDifferently(result, recordedRows),
  )?.pass;
};
