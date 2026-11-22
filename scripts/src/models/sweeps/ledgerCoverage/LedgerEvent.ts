import type { LedgerEventType } from "#src/models/sweeps/ledgerCoverage/LedgerEventType";

// One trailer on one commit
export interface LedgerEvent {
  // The commit's author date, which a rebase keeps, or the date a carried trailer names for a pass no trailer recorded
  date: string;
  // The defects a sample found, which only a `Sampled` trailer carries
  defects?: number | undefined;
  // `typescript/messaging` for an area file, `bench` for a single-file ledger
  ledger: string;
  // The Claude model the commit's `Co-Authored-By` trailer names (`Opus 5.5`), the one a carried trailer names, or ""
  model: string;
  type: LedgerEventType;
  // The unit with its backticks dropped; a reopen may name a whole ledger instead, and a sample never names one
  unit?: string | undefined;
}
