// How a window's review ended: every batch answered (passed), a batch hit the usage limit (limited), or a batch errored
// Otherwise (failed). Only the passed prefix of the run's windows advances `main` and goes to its fixers.
export enum ReviewWindowStatus {
  Failed = "failed",
  Limited = "limited",
  Passed = "passed",
}
