import { PULL_REQUEST_LIST_LIMIT } from "#src/services/coderabbit/collect/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { runGh } from "#src/services/shared/runGh";

// The pull requests merged since an instant, by number. Fixes ride whole at the head of the next cut, so the ones a cut
// Carries answer pull requests merged since the cut before it opened — a run that drained one and opened nothing leaves
// It for a later run's cut, which reads it back here. The search index lags a merge by moments, which only a merge of
// The opening run itself could fall in, and that one is already among the run's own drained pull requests.
export const readMergedPullRequestsSince = (instant: string): number[] =>
  parseMachineJson<{ number: number }[]>(
    runGh([
      "pr",
      "list",
      "--state",
      "merged",
      "--search",
      `merged:>=${instant}`,
      "--limit",
      PULL_REQUEST_LIST_LIMIT.toString(),
      "--json",
      "number",
    ]),
  ).map(({ number }) => number);
