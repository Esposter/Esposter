import type { CycleOutcome } from "#src/models/coderabbit/collect/CycleOutcome";
import type { WindowPullRequest } from "#src/models/coderabbit/collect/WindowPullRequest";

export interface WindowChain {
  // What closing the windows off the chain came to, when any were: its reason for the run's report, and the wake a
  // `develop` that moved under the run owes, since a push to `develop` fires no run of its own (`getMovedOutcome`)
  recut?: CycleOutcome;
  // The open windows on one chain from `main`, bottom up, the release from `develop` below them while it is open
  stack: WindowPullRequest[];
}
