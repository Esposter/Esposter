import type { ReleasePullRequest } from "#src/models/coderabbit/collect/ReleasePullRequest";

import { DEVELOP_BRANCH, MAIN_BRANCH } from "#src/services/coderabbit/collect/constants";
import { runGh } from "#src/services/shared/runGh";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";

// The newest release pull request in any state, because the state is what the cycle turns on: open is the one
// It works, merged or none means the next window is filling and the cycle opens one once it has
// (`openReleasePullRequest`), and closed without merging is a person's pause the cycle must not open over.
export const readReleasePullRequest = (): ReleasePullRequest | undefined =>
  parseMachineJson<ReleasePullRequest[]>(
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
