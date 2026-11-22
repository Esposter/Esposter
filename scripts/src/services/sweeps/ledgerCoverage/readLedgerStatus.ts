import type { LedgerCoverage } from "#src/models/sweeps/ledgerCoverage/LedgerCoverage";
import type { LedgerEvent } from "#src/models/sweeps/ledgerCoverage/LedgerEvent";

import { getLedgerCoverage } from "#src/services/sweeps/ledgerCoverage/getLedgerCoverage";
import { LedgerForcedOpenMap } from "#src/services/sweeps/ledgerCoverage/LedgerForcedOpenMap";
import { readChangedPaths } from "#src/services/sweeps/ledgerCoverage/readChangedPaths";
import { readUnitAreas } from "#src/services/sweeps/ledgerCoverage/readPartitionUnits";

// Every ledger's units, each with where it stands, by the events and the units each ledger holds, in name order
export const readLedgerStatus = (
  events: readonly LedgerEvent[],
  unitsByLedger: Readonly<Record<string, readonly string[]>>,
): LedgerCoverage[] => {
  const unitAreas = readUnitAreas();
  return Object.entries(unitsByLedger)
    .toSorted(([first], [second]) => first.localeCompare(second))
    .map(([ledger, units]) => ({
      ledger,
      units: getLedgerCoverage(ledger, units, events, {
        checkIsForcedOpen: LedgerForcedOpenMap[ledger],
        readChangedPaths,
        readUnitArea: (unit) => unitAreas.get(unit),
      }),
    }));
};
