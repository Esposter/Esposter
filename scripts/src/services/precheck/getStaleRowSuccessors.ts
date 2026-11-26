import { getBacktickedTokens } from "#src/services/citations/getBacktickedTokens";
import { normalizeLedgerUnit } from "#src/services/sweeps/ledgerCoverage/normalizeLedgerUnit";

// The path a unit starts at, its directory or its first path, which a rewording of the unit keeps
const getUnitHead = (unit: string): string => getBacktickedTokens(unit)[0] ?? normalizeLedgerUnit(unit);

// Each row unit the tree no longer derives, beside the unit it became: the one derived unit no row holds that starts at
// The same path, where the row is the one stale row starting there. Several of either leave it undefined, a row only a
// Person can place. Both sides are grouped by that path once, so the pass is linear in the rows and the units
export const getStaleRowSuccessors = (
  rowUnits: readonly string[],
  derivedUnits: readonly string[],
): Map<string, string | undefined> => {
  const rowKeys = new Set(rowUnits.map((unit) => normalizeLedgerUnit(unit)));
  const derivedKeys = new Set(derivedUnits.map((unit) => normalizeLedgerUnit(unit)));
  const staleUnits = rowUnits.filter((unit) => !derivedKeys.has(normalizeLedgerUnit(unit)));
  const staleUnitsByHead = Map.groupBy(staleUnits, getUnitHead);
  const freeUnitsByHead = Map.groupBy(
    derivedUnits.filter((unit) => !rowKeys.has(normalizeLedgerUnit(unit))),
    getUnitHead,
  );
  return new Map(
    staleUnits.map((unit) => {
      const head = getUnitHead(unit);
      const [successor, ...others] = freeUnitsByHead.get(head) ?? [];
      return [unit, staleUnitsByHead.get(head)?.length === 1 && others.length === 0 ? successor : undefined];
    }),
  );
};
