import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { runGit } from "#src/services/shared/runGit";

// Every path the working tree differs on, untracked ones included: the collector owns the checkout, so any is
// Someone else's work — a person's before the run, the drain's after it
export const readDirtyPaths = (cwd?: string): string[] =>
  getNonEmptyLines(runGit(["status", "--porcelain", "-uall"], cwd));
