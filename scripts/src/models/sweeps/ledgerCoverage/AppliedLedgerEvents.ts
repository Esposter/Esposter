import type { LedgerEvent } from "#src/models/sweeps/ledgerCoverage/LedgerEvent";

// One ledger file with its rows dated by the events that named them, and which of the events found a row there
export interface AppliedLedgerEvents {
  matched: LedgerEvent[];
  text: string;
}
