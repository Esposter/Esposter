import type { RelandedAnswersInput } from "#src/models/coderabbit/collect/RelandedAnswersInput";

import { WindowPullRequestState } from "#src/models/coderabbit/collect/WindowPullRequestState";
import { replyPullRequestAnswers } from "#src/services/coderabbit/collect/replyPullRequestAnswers";

// A parked fix that comes back answers findings of a merged window that is often no longer the newest merged one, and
// No opening replies on such a window: an opening replies only on the windows its own run drained and those merged
// Since the window below it opened. So the reply is posted as the fix re-lands, citing the re-landed copy, on each
// Merged window whose findings it names — searched newest first, until every finding is placed. A thread the opening
// Later reaches already ends on the collector's reply, so the newest merged window is answered once as well.
export const replyRelandedAnswers = ({ commit, isDryRun, viewerLogin, windowHistory }: RelandedAnswersInput): void => {
  const mergedNumbers = windowHistory
    .filter(({ state }) => state === WindowPullRequestState.Merged)
    .map(({ number }) => number)
    .toSorted((firstNumber, secondNumber) => secondNumber - firstNumber);
  let unplacedCount = commit.answers.length + commit.drains.length;
  for (const pullRequest of mergedNumbers) {
    if (unplacedCount === 0) return;
    unplacedCount -= replyPullRequestAnswers({ commits: [commit], isDryRun, pullRequest, viewerLogin });
  }
};
