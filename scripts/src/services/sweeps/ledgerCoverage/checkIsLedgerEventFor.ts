import type { LedgerEvent } from "#src/models/sweeps/ledgerCoverage/LedgerEvent";

// Whether a trailer is about the ledger: it names the ledger itself, or the folder an area ledger sits in, which is how
// A rule change to a promoted ledger reopens every area of it at once
export const checkIsLedgerEventFor = ({ ledger: eventLedger }: LedgerEvent, ledger: string): boolean =>
  eventLedger === ledger || ledger.startsWith(`${eventLedger}/`);
