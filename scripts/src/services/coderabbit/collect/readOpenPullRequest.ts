import type { OpenPullRequest } from "#src/models/coderabbit/collect/OpenPullRequest";

import { DEVELOP_BRANCH, MAIN_BRANCH } from "#src/services/coderabbit/collect/constants";
import { runGh } from "#src/services/coderabbit/shared/runGh";
import { parseMachineJson } from "#src/services/parseMachineJson";

// The release pull request is the one open pull request from develop to main. None is a state the collector
// Exits on rather than repairs: opening one spends a review slot, and the skill says that is always asked for.
export const readOpenPullRequest = (): OpenPullRequest | undefined =>
  parseMachineJson<OpenPullRequest[]>(
    runGh([
      "pr",
      "list",
      "--base",
      MAIN_BRANCH,
      "--head",
      DEVELOP_BRANCH,
      "--state",
      "open",
      "--json",
      "number,baseRefName,headRefName",
    ]),
  ).at(0);
