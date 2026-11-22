// One question's count in a sample: the cells the sample drew for it, and the defects its fixers fixed or settled
export interface LedgerSampledCount {
  defects: number;
  ledger: string;
  size: number;
}
