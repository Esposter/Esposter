import type { LedgerJudgedCell } from "#src/models/sweeps/ledgerCoverage/LedgerJudgedCell";

// Whether every reader that judged a cell found nothing in it. One reader that found anything sends the cell to a fixer
export const checkIsLedgerCellClean = ({ judgements }: LedgerJudgedCell): boolean =>
  judgements.every(({ findings }) => findings.length === 0);
