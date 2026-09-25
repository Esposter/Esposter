import type { ReleaseState } from "#src/models/coderabbit/collect/ReleaseState";
import type { ReleaseStateInput } from "#src/models/coderabbit/collect/ReleaseStateInput";
import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";
import type { GitHubReview } from "#src/models/coderabbit/shared/GitHubReview";

import { RECENT_REVIEW_MARKER } from "#src/services/coderabbit/collect/constants";
import { getLastReviewedSha } from "#src/services/coderabbit/collect/getLastReviewedSha";
import { getMarkedBlock } from "#src/services/coderabbit/feedback/getMarkedBlock";
import { getBotBodies } from "#src/services/coderabbit/shared/getBotBodies";
import { readBotEntries } from "#src/services/coderabbit/shared/readBotEntries";
import { readEntries } from "#src/services/coderabbit/shared/readEntries";
import { runGit } from "#src/services/shared/runGit";

// What the release pull request says, and the frontier it names: the last sha a stated range ends at — a review
// Body's, or the walkthrough's recent-review block's, the only record of a review that found nothing — or the
// Merge base with no pull request open, so the first window is measured from `main`.
export const readReleaseState = ({ cwd, developSha, mainSha, pullRequest }: ReleaseStateInput): ReleaseState => {
  const reviews = pullRequest === undefined ? [] : readBotEntries<GitHubReview>(`pulls/${pullRequest}/reviews`);
  const issueComments = pullRequest === undefined ? [] : readEntries<GitHubEntry>(`issues/${pullRequest}/comments`);
  // The walkthrough's recent-review block last: it is rewritten at every completion, so it names the newest range
  const lastReviewedSha = getLastReviewedSha([
    ...reviews.map(({ body }) => body),
    ...getBotBodies(issueComments).flatMap((body) => getMarkedBlock(body, RECENT_REVIEW_MARKER) ?? []),
  ]);
  return {
    frontier: lastReviewedSha ?? runGit(["merge-base", mainSha, developSha], cwd).trim(),
    issueComments,
    lastReviewedSha,
    reviews,
  };
};
