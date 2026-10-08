import type { WindowPullRequest } from "#src/models/coderabbit/collect/WindowPullRequest";
import type { WindowPullRequestListState } from "#src/models/coderabbit/collect/WindowPullRequestListState";

import { PULL_REQUEST_LIST_LIMIT, WINDOW_BRANCH_PREFIX } from "#src/services/coderabbit/collect/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { runGh } from "#src/services/shared/runGh";

// The window pull requests in one state, as `gh` lists them newest first. `open` is the stack the cycle merges and
// Stacks onto; `all` is the history the cycle reads for the next number, the hourly ceiling and the pause. Only a head
// Under the window prefix is a window.
export const readWindowPullRequests = (listState: WindowPullRequestListState): WindowPullRequest[] =>
  parseMachineJson<WindowPullRequest[]>(
    runGh([
      "pr",
      "list",
      "--state",
      listState,
      "--limit",
      PULL_REQUEST_LIST_LIMIT.toString(),
      "--json",
      "number,state,headRefName,baseRefName,createdAt",
    ]),
  ).filter(({ headRefName }) => headRefName.startsWith(WINDOW_BRANCH_PREFIX));
