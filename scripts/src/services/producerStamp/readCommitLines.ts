import { runGit } from "#src/services/shared/runGit";

export const readCommitLines = (args: string[], cwd?: string): string[] =>
  runGit(["log", "--format=%h %s", ...args], cwd)
    .split("\n")
    .filter(Boolean);
