import type { OpenBodyReviewInput } from "#src/models/coderabbit/collect/OpenBodyReviewInput";

import { checkIsMarked } from "#src/services/coderabbit/collect/checkIsMarked";
import { DRAINS_MARKER } from "#src/services/coderabbit/collect/constants";
import { getMarker } from "#src/services/coderabbit/collect/getMarker";
import { getStatedCounts } from "#src/services/coderabbit/feedback/getStatedCounts";

// The newest review's body is a finding set no thread carries — the nitpicks and out-of-diff remarks it states
// Counts for. Open when it states any, no `Drains` trailer names it and no marker says a run drained it: a
// Trailer is lost the moment its commit is ported, a marker outlives every rebase. A review stating none owes
// Nothing, which keeps the bot's replies — each a review of its own — from re-opening an answered set.
export const getOpenBodyReviewId = ({
  drainedReviewIds,
  issueComments,
  newestReview,
  viewerLogin,
}: OpenBodyReviewInput): number | undefined => {
  if (!newestReview) return undefined;

  const { nitpick, outsideDiff } = getStatedCounts(newestReview.body);
  if (nitpick + outsideDiff === 0 || drainedReviewIds.has(newestReview.id)) return undefined;
  const drainsMarker = getMarker(DRAINS_MARKER, newestReview.id);
  return issueComments.some((comment) => checkIsMarked(comment, viewerLogin, drainsMarker))
    ? undefined
    : newestReview.id;
};
