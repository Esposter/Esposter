import type { JsonlRecord } from "#src/models/shared/JsonlRecord";
import type { LedgerJudgedCell } from "#src/models/sweeps/ledgerCoverage/LedgerJudgedCell";
import type { LedgerJudgement } from "#src/models/sweeps/ledgerCoverage/LedgerJudgement";
import type { LedgerSample } from "#src/models/sweeps/ledgerCoverage/LedgerSample";

import { matchLedgerJudgement } from "#src/services/sweeps/ledgerCoverage/matchLedgerJudgement";
import { getOrCreate, ID_SEPARATOR } from "@esposter/shared";

// The cells the readers judged, one per question and sampled unit, each holding the judgements written for it. A
// Judgement Is matched among the units the sample drew for its question, and is written under the unit the sample
// Spells
export const getLedgerJudgedCells = (
  judgements: readonly JsonlRecord<LedgerJudgement>[],
  samples: readonly LedgerSample[],
): LedgerJudgedCell[] => {
  const cells = new Map<string, LedgerJudgedCell>();
  for (const { location, record } of judgements) {
    const sampledUnits = samples.filter(({ ledgers }) => ledgers.includes(record.ledger)).map(({ unit }) => unit);
    const unit = matchLedgerJudgement(sampledUnits, record.unit, location);
    const cell = getOrCreate(cells, `${record.ledger}${ID_SEPARATOR}${unit}`, () => ({
      judgements: [],
      ledger: record.ledger,
      unit,
    }));
    cell.judgements.push({ ...record, unit });
  }
  return [...cells.values()];
};
