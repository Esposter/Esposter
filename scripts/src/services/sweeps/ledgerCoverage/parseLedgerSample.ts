import type { LedgerSample } from "#src/models/sweeps/ledgerCoverage/LedgerSample";

import { SAMPLE_LEDGER_SEPARATOR, SAMPLE_UNIT_SEPARATOR } from "#src/services/sweeps/ledgerCoverage/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

// One line of a sample read back into its unit and the questions it is judged for. A line with no separator is not a
// Sample line, and throws naming where it sits
export const parseLedgerSample = (line: string, location: string): LedgerSample => {
  const separatorIndex = line.indexOf(SAMPLE_UNIT_SEPARATOR);
  if (separatorIndex === -1) throw new InvalidOperationError(Operation.Read, location, "is not a sample line");

  return {
    ledgers: line.slice(separatorIndex + SAMPLE_UNIT_SEPARATOR.length).split(SAMPLE_LEDGER_SEPARATOR),
    unit: line.slice(0, separatorIndex),
  };
};
