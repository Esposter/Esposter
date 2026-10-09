import type { DrainStepResult } from "#src/models/coderabbit/collect/DrainStepResult";
import type { DrainWindowInput } from "#src/models/coderabbit/collect/DrainWindowInput";
import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";
import type { GitHubReview } from "#src/models/coderabbit/shared/GitHubReview";

import { WindowPullRequestListState } from "#src/models/coderabbit/collect/WindowPullRequestListState";
import { readAnsweredCommits } from "#src/services/coderabbit/collect/readAnsweredCommits";
import { readCarriedPullRequests } from "#src/services/coderabbit/collect/readCarriedPullRequests";
import { readWindowPullRequests } from "#src/services/coderabbit/collect/readWindowPullRequests";
import { replyPullRequestAnswers } from "#src/services/coderabbit/collect/replyPullRequestAnswers";
import { runDrainStep } from "#src/services/coderabbit/collect/runDrainStep";
import { readBotEntries } from "#src/services/coderabbit/shared/readBotEntries";
import { readEntries } from "#src/services/coderabbit/shared/readEntries";
import { runGit } from "#src/services/shared/runGit";

// One merged window's findings, drained the way one release's were: the replies its answering commits owe go first,
// Then one drain session answers what is still open. The re-cut windows below it are drained after it the same way,
// One session each (`readCarriedPullRequests`), since their findings would otherwise be answered by nothing. A drain
// That could not start ends the run, since a window cut above it would be ahead of findings that must lead it.
export const drainWindow = async ({
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
  const carriedPullRequests = readCarriedPullRequests(
    readWindowPullRequests(WindowPullRequestListState.All),
    pullRequest,
    viewerLogin,
  );
  let drainedFixesSha = reviewFixesSha;
  for (const drainedPullRequest of [pullRequest, ...carriedPullRequests]) {
    replyPullRequestAnswers({ commits: developCommits, isDryRun, pullRequest: drainedPullRequest, viewerLogin });
    // oxlint-disable-next-line no-await-in-loop -- each drain builds on the fixes branch the one before it left
    const drained = await runDrainStep({
      collectorSha,
      cwd,
      developCommits,
      developSha,
      isDryRun,
      issueComments: readEntries<GitHubEntry>(`issues/${drainedPullRequest}/comments`),
      pullRequest: drainedPullRequest,
      queueSha,
      reviewFixesSha: drainedFixesSha,
      reviews: readBotEntries<GitHubReview>(`pulls/${drainedPullRequest}/reviews`),
      viewerLogin,
    });
    drainedFixesSha = drained.reviewFixesSha;
  }
  return { reviewFixesSha: drainedFixesSha };
};
