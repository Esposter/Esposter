import { OWN_TABLE_LEDGERS } from "#src/services/sweeps/ledgerCoverage/constants";
import { getQuestionUnits } from "#src/services/sweeps/ledgerCoverage/getQuestionUnits";
import { getUnitFiles } from "#src/services/sweeps/ledgerCoverage/getUnitFiles";
import { LedgerUnitsMap } from "#src/services/sweeps/ledgerCoverage/LedgerUnitsMap";
import { readLedgerIndex } from "#src/services/sweeps/ledgerCoverage/readLedgerIndex";
import { readPartitionUnits } from "#src/services/sweeps/ledgerCoverage/readPartitionUnits";
import { readTrackedFiles } from "#src/services/sweeps/ledgerCoverage/readTrackedFiles";
import { readVendoredSkillNames } from "#src/services/sweeps/readVendoredSkillNames";

// Each question's units, keyed by its index row: the partition's cells holding a file its `Scope` names. The tracked
// Files are listed once and resolved in memory, and each question costs one listing of its own pathspecs
export const readQuestionUnits = (): Record<string, string[]> => {
  const vendoredSkillNames = readVendoredSkillNames();
  const units = readPartitionUnits();
  const unitFiles = getUnitFiles(units, readTrackedFiles(vendoredSkillNames));
  return Object.fromEntries(
    readLedgerIndex()
      .filter(({ ledger }) => !(ledger in LedgerUnitsMap) && !OWN_TABLE_LEDGERS.includes(ledger))
      .map(({ ledger, pathspecs }) => [
        ledger,
        getQuestionUnits(units, unitFiles, new Set(readTrackedFiles(vendoredSkillNames, pathspecs))),
      ]),
  );
};
