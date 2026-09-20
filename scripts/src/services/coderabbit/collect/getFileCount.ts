import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { runGit } from "#src/services/shared/runGit";

export const getFileCount = (range: string, cwd?: string): number =>
  getNonEmptyLines(runGit(["diff", "--name-only", range], cwd)).length;
