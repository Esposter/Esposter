import type { WindowPullRequest } from "#src/models/coderabbit/collect/WindowPullRequest";
import type { WindowPullRequestListState } from "#src/models/coderabbit/collect/WindowPullRequestListState";

import { PULL_REQUEST_LIST_LIMIT, WINDOW_BRANCH_PREFIX } from "#src/services/coderabbit/collect/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { runGh } from "#src/services/shared/runGh";

// The window pull requests in one state, as `gh` lists them newest first. `open` is the stack the cycle merges and
// stacks onto; `all` is the history the cycle reads for the next number, the hourly ceiling and the pause. Only a head
// under the window prefix that this repository holds is a window: a fork's branch of the same name is another author's
// pull request, and it would stall or fail a stack it is not part of.
export const readWindowPullRequests = (listState: WindowPullRequestListState): WindowPullRequest[] =>
  parseMachineJson<(WindowPullRequest & { isCrossRepository: boolean })[]>(
    runGh([
      "pr",
      "list",
      "--state",
      listState,
      "--limit",
      PULL_REQUEST_LIST_LIMIT.toString(),
      "--json",
      "number,state,headRefName,baseRefName,createdAt,isCrossRepository",
    ]),
  ).filter(({ headRefName, isCrossRepository }) => !isCrossRepository && headRefName.startsWith(WINDOW_BRANCH_PREFIX));
