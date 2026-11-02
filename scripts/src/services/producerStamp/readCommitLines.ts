import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { runGit } from "#src/services/shared/runGit";

export const readCommitLines = (args: string[], cwd?: string): string[] =>
  getNonEmptyLines(runGit(["log", "--format=%h %s", ...args], cwd));
