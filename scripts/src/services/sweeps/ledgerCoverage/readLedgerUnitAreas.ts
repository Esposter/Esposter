import { normalizeLedgerUnit } from "#src/services/sweeps/ledgerCoverage/normalizeLedgerUnit";
import { readUnitAreas } from "#src/services/sweeps/ledgerCoverage/readPartitionUnits";

// The area each unit sits in, keyed by the unit as a sample spells it, backticks dropped, so a unit a reader judged
// Finds Its area
export const readLedgerUnitAreas = (): Map<string, string> =>
  new Map(Array.from(readUnitAreas(), ([unit, area]): [string, string] => [normalizeLedgerUnit(unit), area]));
