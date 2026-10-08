import type { WindowPullRequest } from "#src/models/coderabbit/collect/WindowPullRequest";

import { WindowPullRequestState } from "#src/models/coderabbit/collect/WindowPullRequestState";
import { checkIsAncestor } from "#src/services/coderabbit/collect/checkIsAncestor";

// A folded window's head reaches `main` by a push, which GitHub records as a merge only once it has processed it; the
// Head's branch is deleted straight after, and a deletion processed first closes the pull request instead. A closed
// Window whose head `main` carries is read as the merge it was, so it is never a pause and its findings are drained.
export const markFoldedWindowsMerged = (
  windowHistory: WindowPullRequest[],
  mainSha: string,
  cwd: string,
): WindowPullRequest[] =>
  windowHistory.map((windowPullRequest) =>
    windowPullRequest.state === WindowPullRequestState.Closed &&
    checkIsAncestor(windowPullRequest.headRefOid, mainSha, cwd)
      ? { ...windowPullRequest, state: WindowPullRequestState.Merged }
      : windowPullRequest,
  );
