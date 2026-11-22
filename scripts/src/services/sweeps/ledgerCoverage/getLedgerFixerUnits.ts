import type { LedgerFixerUnit } from "#src/models/sweeps/ledgerCoverage/LedgerFixerUnit";
import type { LedgerJudgedCell } from "#src/models/sweeps/ledgerCoverage/LedgerJudgedCell";

import { compareCodeUnits } from "#src/services/shared/compareCodeUnits";
import { getOrCreate } from "@esposter/shared";

// The units a fixer is handed, from the cells that were not clean: a unit's judgements are gathered together whatever
// Their questions, and the units are ordered by the area they sit in, so a fixer file holds one area's neighbours
export const getLedgerFixerUnits = (
  cells: readonly LedgerJudgedCell[],
  unitAreas: ReadonlyMap<string, string>,
): LedgerFixerUnit[] => {
  const units = new Map<string, LedgerFixerUnit>();
  for (const { judgements, unit } of cells)
    getOrCreate(units, unit, () => ({ judgements: [], unit })).judgements.push(...judgements);

  return [...units.values()].toSorted(
    (firstUnit, secondUnit) =>
      compareCodeUnits(unitAreas.get(firstUnit.unit) ?? "", unitAreas.get(secondUnit.unit) ?? "") ||
      compareCodeUnits(firstUnit.unit, secondUnit.unit),
  );
};
