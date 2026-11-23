import { LedgerUnitsMap } from "#src/services/sweeps/ledgerCoverage/LedgerUnitsMap";
import { readLedgerFiles } from "#src/services/sweeps/ledgerCoverage/readLedgerFiles";
import { readLedgerUnits } from "#src/services/sweeps/ledgerCoverage/readLedgerUnits";
import { readQuestionUnits } from "#src/services/sweeps/ledgerCoverage/readQuestionUnits";
import { readTrackedFiles } from "#src/services/sweeps/ledgerCoverage/readTrackedFiles";
import { readVendoredSkillNames } from "#src/services/sweeps/readVendoredSkillNames";

// Every ledger's units by the name a trailer gives it: a question's cells, a derived ledger's from its listing, and any
// Other ledger's from its own unit table
export const readLedgerUnitsByLedger = (): Record<string, string[]> => {
  const questionUnits = readQuestionUnits(readTrackedFiles(readVendoredSkillNames()));
  return {
    ...Object.fromEntries(
      readLedgerFiles()
        .filter(({ ledger }) => !(ledger in questionUnits) && !(ledger in LedgerUnitsMap))
        .map(({ ledger, text }) => [ledger, readLedgerUnits(text)]),
    ),
    ...Object.fromEntries(Object.entries(LedgerUnitsMap).map(([ledger, readUnits]) => [ledger, readUnits()])),
    ...questionUnits,
  };
};
