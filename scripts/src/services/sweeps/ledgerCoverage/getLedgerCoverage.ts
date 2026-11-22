import type { GetLedgerCoverageOptions } from "#src/models/sweeps/ledgerCoverage/GetLedgerCoverageOptions";
import type { LedgerEvent } from "#src/models/sweeps/ledgerCoverage/LedgerEvent";
import type { UnitCoverage } from "#src/models/sweeps/ledgerCoverage/UnitCoverage";

import { LedgerEventType } from "#src/models/sweeps/ledgerCoverage/LedgerEventType";
import { UnitState } from "#src/models/sweeps/ledgerCoverage/UnitState";
import { getUnitPaths } from "#src/services/sweeps/ledgerCoverage/getUnitPaths";
import { normalizeLedgerUnit } from "#src/services/sweeps/ledgerCoverage/normalizeLedgerUnit";

// Each unit's state from the ledger's events, taken in the order their dates fall rather than the order the log lists
// Them, so a carried date sits where its pass happened. A sweep raises a unit to its date and model and never lowers
// One; a reopen clears it when it is not older than the sweep, so a sweep landing after a same-day reopen dates the unit
// Again. A unit no sweep dates is sampled while the ledger's latest sample found no defect and neither a reopen nor a
// Commit touching a path the unit names came after it; a unit naming no path cannot be told changed, so it stays sampled.
export const getLedgerCoverage = (
  ledger: string,
  units: readonly string[],
  events: readonly LedgerEvent[],
  { checkIsForcedOpen = () => false, readChangedPaths = () => [] }: GetLedgerCoverageOptions = {},
): UnitCoverage[] => {
  const ledgerEvents = events
    .filter((event) => event.ledger === ledger)
    .toSorted((firstEvent, secondEvent) => firstEvent.date.localeCompare(secondEvent.date));
  const sample = ledgerEvents.findLast(({ type }) => type === LedgerEventType.Sampled);
  const isSampledClean = sample?.defects === 0;
  let changedPaths: readonly string[] | undefined;

  return units.map((unit) => {
    const bareUnit = normalizeLedgerUnit(unit);
    let date: string | undefined;
    let model = "";
    let reopenDate: string | undefined;
    for (const event of ledgerEvents) {
      if (event.type === LedgerEventType.Sampled || (event.unit !== undefined && event.unit !== bareUnit)) continue;

      if (event.type === LedgerEventType.Reopens) {
        reopenDate = event.date;
        if (date === undefined || event.date >= date) date = undefined;
      } else if (date === undefined || event.date >= date) {
        date = event.date;
        ({ model } = event);
      }
    }

    if (checkIsForcedOpen(unit)) return { state: UnitState.Open, unit };
    if (date !== undefined) return { date, model, state: UnitState.Swept, unit };
    if (!sample || !isSampledClean || (reopenDate !== undefined && reopenDate >= sample.date))
      return { state: UnitState.Open, unit };

    changedPaths ??= readChangedPaths(sample.date);
    const touched = changedPaths;
    const isChanged = getUnitPaths(unit).some((path) =>
      touched.some((changedPath) => changedPath === path || changedPath.startsWith(`${path}/`)),
    );
    return { state: isChanged ? UnitState.Open : UnitState.Sampled, unit };
  });
};
