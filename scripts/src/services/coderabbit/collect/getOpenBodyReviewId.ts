import type { OpenBodyReviewInput } from "#src/models/coderabbit/collect/OpenBodyReviewInput";

import { checkHasMarkerComment } from "#src/services/coderabbit/collect/checkHasMarkerComment";
import { DRAINS_MARKER } from "#src/services/coderabbit/collect/constants";
import { getMarker } from "#src/services/coderabbit/collect/getMarker";
import { getStatedCounts } from "#src/services/coderabbit/feedback/getStatedCounts";

// The newest review's own body is a finding set no thread carries: the nitpicks and the out-of-diff remarks it
// States counts for and posts inline nowhere. It is open when the review states any of either, no fix commit's
// `Drains` trailer names it, and no marker comment says a run already drained it — the two halves of the same
// Memory, because a trailer is lost the moment its commit is ported and a marker outlives every rebase.
//
// A review stating none of either owes no body drain at all, which is what keeps every reply the bot posts —
// Each of which arrives as a review of its own — from re-opening a set that was answered.
export const getOpenBodyReviewId = ({
  drainedReviewIds,
  issueComments,
  newestReview,
  viewerLogin,
}: OpenBodyReviewInput): number | undefined => {
  if (!newestReview) return undefined;

  const { nitpick, outsideDiff } = getStatedCounts(newestReview.body);
  if (nitpick + outsideDiff === 0 || drainedReviewIds.has(newestReview.id)) return undefined;
  return checkHasMarkerComment(issueComments, viewerLogin, getMarker(DRAINS_MARKER, newestReview.id))
    ? undefined
    : newestReview.id;
};
