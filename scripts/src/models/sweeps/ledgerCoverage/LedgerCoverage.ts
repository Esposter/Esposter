import type { UnitCoverage } from "#src/models/sweeps/ledgerCoverage/UnitCoverage";

// One ledger's units, each with where it stands
export interface LedgerCoverage {
  ledger: string;
  units: UnitCoverage[];
}
