import type { ReleaseState } from "#src/models/coderabbit/collect/ReleaseState";
import type { ReleaseStateInput } from "#src/models/coderabbit/collect/ReleaseStateInput";
import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";
import type { GitHubReview } from "#src/models/coderabbit/shared/GitHubReview";

import { getLastReviewedSha } from "#src/services/coderabbit/collect/getLastReviewedSha";
import { getRecentReviewBlock } from "#src/services/coderabbit/collect/getRecentReviewBlock";
import { CODERABBIT_REST_LOGIN } from "#src/services/coderabbit/shared/constants";
import { readBotEntries } from "#src/services/coderabbit/shared/readBotEntries";
import { readEntries } from "#src/services/coderabbit/shared/readEntries";
import { runGit } from "#src/services/coderabbit/shared/runGit";

// What the release pull request says, and the frontier it names: the last sha a stated range ends at — a review
// Body's, or the walkthrough's recent-review block's, the only record of a review that found nothing — or the
// Merge base with no pull request open, so the first window is measured from `main`.
export const readReleaseState = ({ cwd, developSha, mainSha, pullRequest }: ReleaseStateInput): ReleaseState => {
  const reviews = pullRequest === undefined ? [] : readBotEntries<GitHubReview>(`pulls/${pullRequest}/reviews`);
  const issueComments = pullRequest === undefined ? [] : readEntries<GitHubEntry>(`issues/${pullRequest}/comments`);
  // The walkthrough's recent-review block last: it is rewritten at every completion, so it names the newest range
  const lastReviewedSha = getLastReviewedSha([
    ...reviews.map(({ body }) => body),
    ...issueComments
      .filter(({ user }) => user.login === CODERABBIT_REST_LOGIN)
      .flatMap(({ body }) => getRecentReviewBlock(body) ?? []),
  ]);
  return {
    frontier: lastReviewedSha ?? runGit(["merge-base", mainSha, developSha], cwd).trim(),
    issueComments,
    lastReviewedSha,
    reviews,
  };
};
