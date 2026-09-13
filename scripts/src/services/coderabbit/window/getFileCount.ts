import { runGit } from "#src/services/coderabbit/shared/runGit";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";

export const getFileCount = (range: string, cwd?: string): number =>
  getNonEmptyLines(runGit(["diff", "--name-only", range], cwd)).length;
