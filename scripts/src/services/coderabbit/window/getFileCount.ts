import { runGit } from "#src/services/coderabbit/runGit";
import { getNonEmptyLines } from "#src/services/getNonEmptyLines";

export const getFileCount = (range: string): number => getNonEmptyLines(runGit(["diff", "--name-only", range])).length;
