import type { GitHubReview } from "#src/models/coderabbit/shared/GitHubReview";
import type { HarbourState } from "#src/models/coderabbit/state/HarbourState";

import { WindowPullRequestState } from "#src/models/coderabbit/collect/WindowPullRequestState";
import { checkIsMarked } from "#src/services/coderabbit/collect/checkIsMarked";
import { HELD_MARKER } from "#src/services/coderabbit/collect/constants";
import { getGateDecision } from "#src/services/coderabbit/collect/getGateDecision";
import { getMarker } from "#src/services/coderabbit/collect/getMarker";
import { readBranchShas } from "#src/services/coderabbit/collect/readBranchShas";
import { readCheckStatus } from "#src/services/coderabbit/collect/readCheckStatus";
import { readCherryShas } from "#src/services/coderabbit/collect/readCherryShas";
import { readClaimedShas } from "#src/services/coderabbit/collect/readClaimedShas";
import { readCommitComments } from "#src/services/coderabbit/collect/readCommitComments";
import { readLegacyReleasePullRequest } from "#src/services/coderabbit/collect/readLegacyReleasePullRequest";
import { readPullRequestHeadSha } from "#src/services/coderabbit/collect/readPullRequestHeadSha";
import { readViewerLogin } from "#src/services/coderabbit/collect/readViewerLogin";
import { readBotEntries } from "#src/services/coderabbit/shared/readBotEntries";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";

// The collector's own reads, the ones a pass makes, gathered for the harbour: the collector answers what is owed, so
// The view imports that answer rather than keeping a copy that could disagree with it
export const readHarbourState = (): HarbourState => {
  const branchShas = readBranchShas(REPOSITORY_ROOT);
  const owedShas = readCherryShas(branchShas.developSha, branchShas.queueSha, REPOSITORY_ROOT);
  const claimedShas = readClaimedShas({ cwd: REPOSITORY_ROOT, ...branchShas });
  // The held notice is written on the first commit no window can take, so only the first owed commit can carry it
  const [firstOwedSha] = owedShas;
  const viewerLogin = readViewerLogin();
  const isHeld =
    firstOwedSha !== undefined &&
    readCommitComments(firstOwedSha).some((comment) =>
      checkIsMarked(comment, viewerLogin, getMarker(HELD_MARKER, firstOwedSha)),
    );
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

  return { branchShas, claimedShas, gate, heldSha: isHeld ? firstOwedSha : undefined, owedShas };
};
