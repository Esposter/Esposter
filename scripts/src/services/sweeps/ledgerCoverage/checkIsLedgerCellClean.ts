import type { LedgerJudgedCell } from "#src/models/sweeps/ledgerCoverage/LedgerJudgedCell";

import { LedgerVerdict } from "#src/models/sweeps/ledgerCoverage/LedgerVerdict";

// Whether every reader that judged a cell found it clean. One reader that did not is enough to send the cell to a fixer
export const checkIsLedgerCellClean = ({ judgements }: LedgerJudgedCell): boolean =>
  judgements.every(({ verdict }) => verdict === LedgerVerdict.Clean);
