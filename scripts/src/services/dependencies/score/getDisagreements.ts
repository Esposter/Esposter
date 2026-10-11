import type { DependencyScore } from "#src/models/dependencies/score/DependencyScore";

import { LedgerVerdict } from "#src/models/dependencies/score/LedgerVerdict";
import {
  ABSORB_DISAGREEMENT_MAXIMUM_SCORE,
  KEEP_DISAGREEMENT_MINIMUM_SCORE,
  KEEP_EXEMPT_REASONS,
} from "#src/services/dependencies/score/constants";
import { parseVerdict } from "#src/services/dependencies/score/parseVerdict";

// Rows to re-judge, never errors: a Keep for a reason outside the exempt list that scores as an absorb candidate, and an
// Absorb the score does not back. A row the ledger has not judged is no disagreement.
export const getDisagreements = (scores: DependencyScore[]): DependencyScore[] =>
  scores.filter(({ total, verdict }) => {
    const { kind, reason } = parseVerdict(verdict);
    if (kind === LedgerVerdict.Keep)
      return total >= KEEP_DISAGREEMENT_MINIMUM_SCORE && !KEEP_EXEMPT_REASONS.includes(reason);
    if (kind === LedgerVerdict.Absorb) return total < ABSORB_DISAGREEMENT_MAXIMUM_SCORE;
    return false;
  });
