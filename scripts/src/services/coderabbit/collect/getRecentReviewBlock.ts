import { RECENT_REVIEW_END_MARKER, RECENT_REVIEW_START_MARKER } from "#src/services/coderabbit/collect/constants";

// The walkthrough's record of the review that last completed. A review that found nothing writes no review body,
// So this block is the only place its range is stated; the block alone is read because the same comment's
// Rate-limit section names the range the bot skipped, which is the one sha the frontier must never advance to.
export const getRecentReviewBlock = (body: string): string | undefined => {
  const start = body.indexOf(RECENT_REVIEW_START_MARKER);
  const end = body.indexOf(RECENT_REVIEW_END_MARKER, start);
  if (start === -1 || end === -1) return undefined;
  return body.slice(start + RECENT_REVIEW_START_MARKER.length, end);
};
