import { normalizeLedgerUnit } from "#src/services/sweeps/ledgerCoverage/normalizeLedgerUnit";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";

// What may follow a unit's path when a reader has shortened the unit to it: a cell separator, or the comma of a list
const PATH_END_REGEX = /^[ ,]/u;

// The sampled unit a reader's judgement is for. A reader may shorten a unit to its path, which then names the one sampled
// Unit beginning with that path. Zero matches, or several, name nothing, and the error names where the judgement sits
export const matchLedgerJudgement = (sampledUnits: readonly string[], unit: string, location: string): string => {
  const bareUnit = normalizeLedgerUnit(unit);
  const exactUnits = sampledUnits.filter((sampledUnit) => sampledUnit === bareUnit);
  const matches =
    exactUnits.length > 0
      ? exactUnits
      : sampledUnits.filter(
          (sampledUnit) => sampledUnit.startsWith(bareUnit) && PATH_END_REGEX.test(sampledUnit.slice(bareUnit.length)),
        );
  if (matches.length !== 1)
    throw new InvalidOperationError(Operation.Read, location, `${unit} matches ${matches.length} sampled units`);

  return takeOne(matches, 0);
};
