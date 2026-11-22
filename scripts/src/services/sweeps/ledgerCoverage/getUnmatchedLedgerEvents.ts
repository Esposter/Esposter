import type { LedgerEvent } from "#src/models/sweeps/ledgerCoverage/LedgerEvent";

import { checkIsLedgerEventFor } from "#src/services/sweeps/ledgerCoverage/checkIsLedgerEventFor";
import { normalizeLedgerUnit } from "#src/services/sweeps/ledgerCoverage/normalizeLedgerUnit";

// The trailers naming a unit no ledger they are about holds. A trailer naming a promoted ledger's folder is about every
// Area in it, and its unit is in exactly one, so a trailer is unmatched only once no area holds it. A trailer naming no
// Unit, a whole-ledger reopen or a sample, is never unmatched.
export const getUnmatchedLedgerEvents = (
  events: readonly LedgerEvent[],
  unitsByLedger: Readonly<Record<string, readonly string[]>>,
): LedgerEvent[] => {
  const bareUnitsByLedger = Object.entries(unitsByLedger).map(
    ([ledger, units]) => [ledger, new Set(units.map((unit) => normalizeLedgerUnit(unit)))] as const,
  );
  return events.filter(
    (event) =>
      event.unit !== undefined &&
      !bareUnitsByLedger.some(
        ([ledger, bareUnits]) => checkIsLedgerEventFor(event, ledger) && bareUnits.has(event.unit ?? ""),
      ),
  );
};
