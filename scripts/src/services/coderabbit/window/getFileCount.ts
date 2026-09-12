import { getNonEmptyLines } from "#src/services/getNonEmptyLines";
import { runGit } from "#src/services/runGit";

export const getFileCount = (range: string): number => getNonEmptyLines(runGit(["diff", "--name-only", range])).length;
