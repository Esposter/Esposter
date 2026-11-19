import type { LedgerEvent } from "#src/models/sweeps/ledgerCoverage/LedgerEvent";
import type { LedgerFile } from "#src/models/sweeps/ledgerCoverage/LedgerFile";

// The ledger files with their rows dated by the events, and the events no row of any file took
export interface LedgerCoverage {
  files: (LedgerFile & { rewrittenText: string })[];
  unmatched: LedgerEvent[];
}
