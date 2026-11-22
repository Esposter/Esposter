import { runGit } from "#src/services/shared/runGit";

// Every repository path a commit on or after the date touched, each once
export const readChangedPaths = (since: string): string[] => [
  ...new Set(
    runGit(["log", `--since=${since}`, "--name-only", "--format="])
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
  ),
];
