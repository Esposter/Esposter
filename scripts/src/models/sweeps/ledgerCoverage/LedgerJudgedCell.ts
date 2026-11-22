import type { LedgerJudgement } from "#src/models/sweeps/ledgerCoverage/LedgerJudgement";

// One cell a sample drew, with the judgements its readers wrote for it: one question's unit, as the sample spells it
export interface LedgerJudgedCell {
  judgements: LedgerJudgement[];
  ledger: string;
  unit: string;
}
