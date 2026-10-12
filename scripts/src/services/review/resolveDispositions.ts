import type { ReviewDisposition } from "#src/models/review/ReviewDisposition";

import { ReviewOutcome } from "#src/models/review/ReviewOutcome";

// One disposition per finding, by its index. A finding the fixer did not answer, or every one of them when the fixer
// failed, is deferred with the reason the run gives, so nothing is left unsettled and no finding is silently dropped.
export const resolveDispositions = (
  findingCount: number,
  answered: ReviewDisposition[] | undefined,
  failureReason: string,
): ReviewDisposition[] =>
  Array.from({ length: findingCount }, (_, index) => {
    if (answered === undefined) return { index, outcome: ReviewOutcome.Deferred, reason: failureReason };
    const disposition = answered.find((answer) => answer.index === index);
    return disposition ?? { index, outcome: ReviewOutcome.Deferred, reason: "the fixer did not answer this finding" };
  });
