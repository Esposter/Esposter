import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";

// `git cherry <upstream> <head>` prints `+ <sha>` for a commit whose patch is not upstream and `- <sha>` for one
// Whose patch is, oldest first. The `+` lines are what a branch still owes; equality by patch id is what makes
// A cherry-picked copy on develop count as the same commit.
const OWED_PREFIX = "+ ";

export const getCherryShas = (output: string): string[] =>
  getNonEmptyLines(output)
    .filter((line) => line.startsWith(OWED_PREFIX))
    .map((line) => line.slice(OWED_PREFIX.length).trim());
