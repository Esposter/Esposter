import type { LedgerEventType } from "#src/models/sweeps/ledgerCoverage/LedgerEventType";

// One trailer on one commit, in the order the commits were made
export interface LedgerEvent {
  // The commit's author date, which a rebase keeps
  date: string;
  // `typescript/messaging` for an area file, `bench` for a single-file ledger
  ledger: string;
  // The Claude model the commit's `Co-Authored-By` trailer names (`Opus 5.5`), or "" for a commit carrying none
  model: string;
  type: LedgerEventType;
  // The unit cell verbatim; a reopen may name a whole ledger instead
  unit?: string;
}
