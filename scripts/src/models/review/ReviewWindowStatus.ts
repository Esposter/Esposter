// How a window's review ended: every batch answered (passed), a batch hit the usage limit (limited), a batch errored
// Otherwise (failed), or a batch was left for the next run by the deadline (unreached). Only the passed prefix of the run's
// Windows advances `main` and opens its issues.
export enum ReviewWindowStatus {
  Failed = "failed",
  Limited = "limited",
  Passed = "passed",
  Unreached = "unreached",
}
