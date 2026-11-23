import { readGitChangedPaths } from "#src/services/sweeps/ledgerCoverage/readGitChangedPaths";

// Every repository path a commit on or after the date touched. A bare date is read by git at the current time of day,
// Which drops the commits made earlier that day, so the day starts at midnight
export const readChangedPaths = (since: string): string[] =>
  readGitChangedPaths(["log", `--since=${since}T00:00:00`, "--format="]);
