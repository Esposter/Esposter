import type { WindowPullRequest } from "#src/models/coderabbit/collect/WindowPullRequest";
import type { WindowPullRequestListState } from "#src/models/coderabbit/collect/WindowPullRequestListState";

import { checkIsWindowBranch } from "#src/services/coderabbit/collect/checkIsWindowBranch";
import { PULL_REQUEST_LIST_LIMIT } from "#src/services/coderabbit/collect/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { runGh } from "#src/services/shared/runGh";

// The window pull requests in one state, as `gh` lists them newest first. `open` is the stack the cycle merges and
// Stacks onto; `all` is the history the cycle reads for the next number, the hourly ceiling and the pause. Only a
// Numbered window head that this repository holds is a window: a fork's branch of the same name is another author's
// Pull request, and a person's branch under the prefix would be merged by the stack on the bot's completed review.
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
  ).filter(({ headRefName, isCrossRepository }) => !isCrossRepository && checkIsWindowBranch(headRefName));
