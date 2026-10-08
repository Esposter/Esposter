import type { DrainStepResult } from "#src/models/coderabbit/collect/DrainStepResult";
import type { DrainWindowInput } from "#src/models/coderabbit/collect/DrainWindowInput";
import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";
import type { GitHubReview } from "#src/models/coderabbit/shared/GitHubReview";

import { readAnsweredCommits } from "#src/services/coderabbit/collect/readAnsweredCommits";
import { replyPullRequestAnswers } from "#src/services/coderabbit/collect/replyPullRequestAnswers";
import { runDrainStep } from "#src/services/coderabbit/collect/runDrainStep";
import { readBotEntries } from "#src/services/coderabbit/shared/readBotEntries";
import { readEntries } from "#src/services/coderabbit/shared/readEntries";
import { runGit } from "#src/services/shared/runGit";

// One merged window's findings, drained the way one release's were: the replies its answering commits owe go first,
// Then one drain session answers what is still open. A drain that could not start ends the run, since a window cut
// Above it would be ahead of findings that must lead it.
export const drainWindow = ({
  collectorSha,
  cwd,
  developSha,
  isDryRun,
  mainSha,
  pullRequest,
  queueSha,
  reviewFixesSha,
  viewerLogin,
}: DrainWindowInput): Promise<DrainStepResult> => {
  const mergeBaseSha = runGit(["merge-base", mainSha, developSha], cwd).trim();
  const developCommits = readAnsweredCommits([`${mergeBaseSha}..${developSha}`], cwd);
  replyPullRequestAnswers({ commits: developCommits, isDryRun, pullRequest, viewerLogin });
  return runDrainStep({
    collectorSha,
    cwd,
    developCommits,
    developSha,
    isDryRun,
    issueComments: readEntries<GitHubEntry>(`issues/${pullRequest}/comments`),
    pullRequest,
    queueSha,
    reviewFixesSha,
    reviews: readBotEntries<GitHubReview>(`pulls/${pullRequest}/reviews`),
    viewerLogin,
  });
};
