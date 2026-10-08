import type { CycleOutcome } from "#src/models/coderabbit/collect/CycleOutcome";

export interface WindowStackWalkResult {
  // Why each window above the bottom waited or was asked for — the run's reason when nothing else happened
  blockReasons: string[];
  // The merged windows whose findings were drained, in stack order
  drainedPullRequests: number[];
  // A stop that ends the run before any window is opened
  outcome?: CycleOutcome;
  // The soonest deadline a rate limit across the stack states, slept to before the cycle runs again
  retriggerDelaySeconds?: number;
}
