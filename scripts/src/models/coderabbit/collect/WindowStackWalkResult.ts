import type { CycleOutcome } from "#src/models/coderabbit/collect/CycleOutcome";

export interface WindowStackWalkResult {
  // Why each window above the bottom waited or was asked for — the run's reason when nothing else happened
  blockReasons: string[];
  // The merged windows whose findings were drained, in stack order
  drainedPullRequests: number[];
  // A stop that ends the run before any window is opened
  outcome?: CycleOutcome;
  // The soonest wake any window's hold states — a rate limit's deadline, a check's wait, an ask's wait — slept to before
  // The cycle runs again
  retriggerDelaySeconds?: number;
}
