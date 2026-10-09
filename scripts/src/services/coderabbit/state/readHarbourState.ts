import type { GitHubReview } from "#src/models/coderabbit/shared/GitHubReview";
import type { HarbourState } from "#src/models/coderabbit/state/HarbourState";

import { WindowPullRequestState } from "#src/models/coderabbit/collect/WindowPullRequestState";
import { getGateDecision } from "#src/services/coderabbit/collect/getGateDecision";
import { readBranchShas } from "#src/services/coderabbit/collect/readBranchShas";
import { readCheckStatus } from "#src/services/coderabbit/collect/readCheckStatus";
import { readCherryShas } from "#src/services/coderabbit/collect/readCherryShas";
import { readClaimedShas } from "#src/services/coderabbit/collect/readClaimedShas";
import { readHeldTipShas } from "#src/services/coderabbit/collect/readHeldTipShas";
import { readLegacyReleasePullRequest } from "#src/services/coderabbit/collect/readLegacyReleasePullRequest";
import { readPullRequestHeadSha } from "#src/services/coderabbit/collect/readPullRequestHeadSha";
import { readBotEntries } from "#src/services/coderabbit/shared/readBotEntries";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";

// The collector's own reads, the ones a pass makes, gathered for the harbour: the collector answers what is owed, so
// The view imports that answer rather than keeping a copy that could disagree with it
export const readHarbourState = (): HarbourState => {
  const branchShas = readBranchShas(REPOSITORY_ROOT);
  const owedShas = readCherryShas(branchShas.developSha, branchShas.queueSha, REPOSITORY_ROOT);
  const claimedShas = readClaimedShas({ cwd: REPOSITORY_ROOT, ...branchShas });
  const releasePullRequest = readLegacyReleasePullRequest();
  const isReleaseOpen = releasePullRequest?.state === WindowPullRequestState.Open;
  const gate =
    releasePullRequest && isReleaseOpen
      ? getGateDecision(
          readCheckStatus(releasePullRequest.number),
          readPullRequestHeadSha(releasePullRequest.number),
          readBotEntries<GitHubReview>(`pulls/${releasePullRequest.number}/reviews`).at(-1)?.commit_id ?? "",
        )
      : undefined;

  return { branchShas, claimedShas, gate, heldShas: readHeldTipShas(REPOSITORY_ROOT), owedShas };
};
