import type { LedgerJudgement } from "#src/models/sweeps/ledgerCoverage/LedgerJudgement";

// One unit a fixer is handed: the judgements of its cells that were not clean, one per question, under the unit's
// Spelling
export interface LedgerFixerUnit {
  judgements: LedgerJudgement[];
  unit: string;
}
