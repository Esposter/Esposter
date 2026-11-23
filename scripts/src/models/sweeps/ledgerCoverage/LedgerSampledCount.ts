// One question's count in a sample: the cells the sample drew for it, and its defects, the findings its fixers did not
// Refute, open ones included
export interface LedgerSampledCount {
  defects: number;
  ledger: string;
  size: number;
}
