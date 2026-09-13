import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";
import type { GitHubReview } from "#src/models/coderabbit/shared/GitHubReview";

export interface OpenBodyReviewInput {
  // The reviews a fix commit's `Drains` trailer already names, ported or not
  drainedReviewIds: ReadonlySet<number>;
  // The pull request's issue comments, where the collector's own markers live
  issueComments: GitHubEntry[];
  // The newest review that carries a body. Absent when the pull request has none yet
  newestReview?: GitHubReview;
  viewerLogin: string;
}
