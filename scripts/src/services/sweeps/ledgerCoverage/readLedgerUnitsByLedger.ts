import { LedgerUnitsMap } from "#src/services/sweeps/ledgerCoverage/LedgerUnitsMap";
import { readLedgerFiles } from "#src/services/sweeps/ledgerCoverage/readLedgerFiles";
import { readLedgerUnits } from "#src/services/sweeps/ledgerCoverage/readLedgerUnits";

// Every ledger's units by the name a trailer gives it: a derived ledger's from its listing, whatever its file holds, and
// Every other ledger's from its own unit table
export const readLedgerUnitsByLedger = (): Record<string, string[]> => ({
  ...Object.fromEntries(
    readLedgerFiles()
      .filter(({ ledger }) => !(ledger in LedgerUnitsMap))
      .map(({ ledger, text }) => [ledger, readLedgerUnits(text)]),
  ),
  ...Object.fromEntries(Object.entries(LedgerUnitsMap).map(([ledger, readUnits]) => [ledger, readUnits()])),
});
