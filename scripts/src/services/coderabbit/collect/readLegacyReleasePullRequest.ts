import type { WindowPullRequest } from "#src/models/coderabbit/collect/WindowPullRequest";

import { DEVELOP_BRANCH, MAIN_BRANCH } from "#src/services/coderabbit/collect/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { runGh } from "#src/services/shared/runGh";

// The newest pull request from `develop` to `main` in any state: the release the collector ran before the stack. It is
// Read as a window is, so an open one is the stack's bottom — gated, merged and drained the way a window is — and one
// Closed without merging is a person's pause, as it was before the stack.
export const readLegacyReleasePullRequest = (): undefined | WindowPullRequest =>
  parseMachineJson<WindowPullRequest[]>(
    runGh([
      "pr",
      "list",
      "--base",
      MAIN_BRANCH,
      "--head",
      DEVELOP_BRANCH,
      "--state",
      "all",
      "--limit",
      "1",
      "--json",
      "number,state,headRefName,baseRefName,createdAt",
    ]),
  ).at(0);
