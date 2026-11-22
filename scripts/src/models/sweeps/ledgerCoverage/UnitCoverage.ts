import type { UnitState } from "#src/models/sweeps/ledgerCoverage/UnitState";

// One unit of a ledger with where it stands: the date and model only a swept unit carries
export interface UnitCoverage {
  date?: string | undefined;
  model?: string | undefined;
  state: UnitState;
  // The unit as the ledger spells it, backticks included
  unit: string;
}
