// One question's count in a sample: the cells the sample drew for it, and the defects its fixers did not refute, open ones included
export interface LedgerSampledCount {
  defects: number;
  ledger: string;
  size: number;
}
