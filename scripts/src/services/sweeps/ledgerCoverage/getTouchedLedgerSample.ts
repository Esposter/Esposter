import type { LedgerCoverage } from "#src/models/sweeps/ledgerCoverage/LedgerCoverage";
import type { LedgerSample } from "#src/models/sweeps/ledgerCoverage/LedgerSample";

import { UnitState } from "#src/models/sweeps/ledgerCoverage/UnitState";
import { getUnitFiles } from "#src/services/sweeps/ledgerCoverage/getUnitFiles";
import { normalizeLedgerUnit } from "#src/services/sweeps/ledgerCoverage/normalizeLedgerUnit";
import { getOrCreate } from "@esposter/shared";

// The open cells a range's changed paths reach: each partition unit holding one of them, with every question it is open
// In, in the order the partition lists its units. A dated cell is not drawn though a file it holds changed, since only
// A `Reopens:` trailer or a sample reopens a dated cell, which is the status's own rule
export const getTouchedLedgerSample = (
  statuses: readonly LedgerCoverage[],
  partitionUnits: readonly string[],
  changedPaths: readonly string[],
): LedgerSample[] => {
  const unitFiles = getUnitFiles(partitionUnits, changedPaths);
  const openLedgers = new Map<string, string[]>();
  for (const { ledger, units } of statuses)
    for (const { state, unit } of units)
      if (state === UnitState.Open) getOrCreate(openLedgers, unit, () => []).push(ledger);

  return partitionUnits.flatMap((unit) => {
    const ledgers = openLedgers.get(unit);
    return ledgers !== undefined && (unitFiles.get(unit)?.length ?? 0) > 0
      ? [{ ledgers, unit: normalizeLedgerUnit(unit) }]
      : [];
  });
};
