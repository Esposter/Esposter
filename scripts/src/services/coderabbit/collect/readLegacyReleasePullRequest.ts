import type { WindowPullRequest } from "#src/models/coderabbit/collect/WindowPullRequest";

import { DEVELOP_BRANCH, MAIN_BRANCH } from "#src/services/coderabbit/collect/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { runGh } from "#src/services/shared/runGh";

// The newest pull request from `develop` to `main` in any state: the release the collector ran before the stack. The
// stack never reviews it, so one still open is a pull request no window may be cut over, and one closed without merging
// is a person's pause, as it was before the stack.
export const readLegacyReleasePullRequest = (): Pick<WindowPullRequest, "number" | "state"> | undefined =>
  parseMachineJson<Pick<WindowPullRequest, "number" | "state">[]>(
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
      "number,state",
    ]),
  ).at(0);
