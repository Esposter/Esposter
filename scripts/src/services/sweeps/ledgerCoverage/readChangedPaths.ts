import { runGit } from "#src/services/shared/runGit";

// Every repository path a commit on or after the date touched, each once, a rename counted by its old path and its new
// One. A bare date is read by git at the current time of day, which drops the commits made earlier that day, so the day
// Starts at midnight
export const readChangedPaths = (since: string): string[] => [
  ...new Set(
    runGit(["log", `--since=${since}T00:00:00`, "--name-only", "--no-renames", "--format="])
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
  ),
];
