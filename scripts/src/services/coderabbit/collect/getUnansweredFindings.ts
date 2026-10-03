import type { UnansweredFindingsInput } from "#src/models/coderabbit/collect/UnansweredFindingsInput";

// The findings a drain was handed that it neither fixed under a trailer nor rejected. A clean exit says the session
// Ended, not that it answered everything, and a window cut over what it left would open a release that merges with
// Them unread — the next release is the newest merged one, and no drain reads an older review again.
export const getUnansweredFindings = ({
  commits,
  isBodyRejected,
  openThreads,
  rejectedIds,
  reviewId,
}: UnansweredFindingsInput): string[] => {
  const answeredIds = new Set([...commits.flatMap(({ answers }) => answers), ...rejectedIds]);
  const unanswered = openThreads
    .filter(({ commentId }) => !answeredIds.has(commentId))
    .map(({ commentId }) => `comment ${commentId}`);
  if (reviewId !== undefined && !isBodyRejected && !commits.some(({ drains }) => drains.includes(reviewId)))
    unanswered.push(`review ${reviewId}`);
  return unanswered;
};
