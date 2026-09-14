import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";

// `git cherry` prints `+ <sha>` for a patch not upstream and `- <sha>` for one that is, oldest first
const OWED_PREFIX = "+ ";

export const getCherryShas = (output: string): string[] =>
  getNonEmptyLines(output)
    .filter((line) => line.startsWith(OWED_PREFIX))
    .map((line) => line.slice(OWED_PREFIX.length).trim());
