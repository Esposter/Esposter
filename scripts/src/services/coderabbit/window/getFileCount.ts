import { runGit } from "#src/services/coderabbit/shared/runGit";
import { getNonEmptyLines } from "#src/services/getNonEmptyLines";

export const getFileCount = (range: string, cwd?: string): number =>
  getNonEmptyLines(runGit(["diff", "--name-only", range], cwd)).length;
