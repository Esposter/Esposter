import { OWN_TABLE_LEDGERS } from "#src/services/sweeps/ledgerCoverage/constants";
import { getPathspecFiles } from "#src/services/sweeps/ledgerCoverage/getPathspecFiles";
import { getQuestionUnits } from "#src/services/sweeps/ledgerCoverage/getQuestionUnits";
import { getUnitFiles } from "#src/services/sweeps/ledgerCoverage/getUnitFiles";
import { LedgerUnitsMap } from "#src/services/sweeps/ledgerCoverage/LedgerUnitsMap";
import { readLedgerIndex } from "#src/services/sweeps/ledgerCoverage/readLedgerIndex";
import { readPartitionUnits } from "#src/services/sweeps/ledgerCoverage/readPartitionUnits";

// Each question's units, keyed by its index row: the partition's cells holding a file its `Scope` names. The caller lists
// The tracked files once, and each row's scope is matched against them in memory, so no row costs a git spawn. A caller
// That already holds the partition and its files passes them, rather than reading both again
export const readQuestionUnits = (
  trackedFiles: string[],
  units: string[] = readPartitionUnits(),
  unitFiles: Map<string, string[]> = getUnitFiles(units, trackedFiles),
): Record<string, string[]> =>
  Object.fromEntries(
    readLedgerIndex()
      .filter(({ ledger }) => !(ledger in LedgerUnitsMap) && !OWN_TABLE_LEDGERS.includes(ledger))
      .map(({ ledger, pathspecs }) => [
        ledger,
        getQuestionUnits(units, unitFiles, new Set(getPathspecFiles(trackedFiles, pathspecs))),
      ]),
  );
