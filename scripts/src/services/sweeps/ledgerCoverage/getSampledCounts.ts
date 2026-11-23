import type { LedgerFixerResult } from "#src/models/sweeps/ledgerCoverage/LedgerFixerResult";
import type { LedgerSample } from "#src/models/sweeps/ledgerCoverage/LedgerSample";
import type { LedgerSampledCount } from "#src/models/sweeps/ledgerCoverage/LedgerSampledCount";

import { LedgerFindingKind } from "#src/models/sweeps/ledgerCoverage/LedgerFindingKind";
import { LedgerFixerOutcome } from "#src/models/sweeps/ledgerCoverage/LedgerFixerOutcome";
import { compareText } from "@esposter/shared";

// Each question's count in a sample: the cells the sample drew for it, and its defects, the defect findings its fixers
// Did not refute, an open one included. A tidy is not a defect
export const getSampledCounts = (
  samples: readonly LedgerSample[],
  results: readonly LedgerFixerResult[],
): LedgerSampledCount[] =>
  [...new Set(samples.flatMap(({ ledgers }) => ledgers))]
    .toSorted(compareText)
    .map((ledger) => ({
      defects: results.filter(
        (result) =>
          result.ledger === ledger &&
          result.kind === LedgerFindingKind.Defect &&
          result.outcome !== LedgerFixerOutcome.Refuted,
      ).length,
      ledger,
      size: samples.filter(({ ledgers }) => ledgers.includes(ledger)).length,
    }));
