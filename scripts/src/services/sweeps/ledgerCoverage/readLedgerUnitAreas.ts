import { normalizeLedgerUnit } from "#src/services/sweeps/ledgerCoverage/normalizeLedgerUnit";
import { readUnitAreas } from "#src/services/sweeps/ledgerCoverage/readPartitionUnits";

// The area each unit sits in, keyed by the unit as a sample spells it, with its backticks dropped.
// So a unit a reader judged finds its area.
export const readLedgerUnitAreas = (): Map<string, string> =>
  new Map(Array.from(readUnitAreas(), ([unit, area]): [string, string] => [normalizeLedgerUnit(unit), area]));
