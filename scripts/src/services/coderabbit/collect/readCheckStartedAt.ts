import { CHECK_NAME } from "#src/services/coderabbit/collect/constants";
import { runGh } from "#src/services/shared/runGh";

// When the CodeRabbit check took the state it holds now — for a pending one, when its review started. The bot posts a
// Commit status, for which `gh pr checks` reports no start, so this reads the pull request's status rollup, where a
// Status carries the time it was posted. Empty when the pull request carries no such check.
export const readCheckStartedAt = (pullRequest: number): string =>
  runGh([
    "pr",
    "view",
    pullRequest.toString(),
    "--json",
    "statusCheckRollup",
    "--jq",
    `.statusCheckRollup[] | select(.context == "${CHECK_NAME}") | .startedAt`,
  ]).trim();
