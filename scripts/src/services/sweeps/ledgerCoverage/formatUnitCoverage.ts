import type { UnitCoverage } from "#src/models/sweeps/ledgerCoverage/UnitCoverage";

import { UnitState } from "#src/models/sweeps/ledgerCoverage/UnitState";
import { OPEN_CELL, SWEPT_CELL_SEPARATOR } from "#src/services/sweeps/ledgerCoverage/constants";

const SAMPLED_CELL = "sampled";

// A unit's state as the status prints it: `<date> · <model>` for a swept unit, the date alone when its commit named no
// Model, `sampled` for a unit a clean sample covers, and the open dash
export const formatUnitCoverage = ({ date, model, state }: UnitCoverage): string => {
  if (state === UnitState.Sampled) return SAMPLED_CELL;
  if (state === UnitState.Open || date === undefined) return OPEN_CELL;
  return model ? `${date}${SWEPT_CELL_SEPARATOR}${model}` : date;
};
