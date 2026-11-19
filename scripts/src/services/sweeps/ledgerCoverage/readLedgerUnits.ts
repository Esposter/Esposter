import { readLedgerRowCell, splitLedgerTable } from "#src/services/sweeps/ledgerCoverage/splitLedgerTable";

// The unit cells of a ledger's table as its rows spell them, backticks and all, in the table's own order. A text
// With no table holds no units.
export const readLedgerUnits = (text: string): string[] =>
  (splitLedgerTable(text)?.body ?? []).map((line) => readLedgerRowCell(line).trim());
