import type { LedgerEvent } from "#src/models/sweeps/ledgerCoverage/LedgerEvent";

import { normalizeLedgerUnit } from "#src/services/sweeps/ledgerCoverage/normalizeLedgerUnit";

// The trailers naming a unit their ledger does not hold. A trailer naming a question's area is read as the question,
// So it is unmatched when the question's cells lack its unit. A trailer naming no unit, a whole-ledger reopen or a
// Sample, is never unmatched.
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
      !bareUnitsByLedger.some(([ledger, bareUnits]) => event.ledger === ledger && bareUnits.has(event.unit ?? "")),
  );
};
