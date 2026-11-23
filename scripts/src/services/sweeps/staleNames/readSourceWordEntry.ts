import type { SourceWordEntry } from "#src/models/sweeps/staleNames/SourceWordEntry";

import { getSourceComments } from "#src/services/citations/getSourceComments";
import { readFileWords } from "#src/services/sweeps/staleNames/readFileWords";
import { readFileSync } from "node:fs";

// A source file read afresh, its words taken with its comments blanked
export const readSourceWordEntry = (
  path: string,
  absolutePath: string,
  { mtimeMs, size }: { mtimeMs: number; size: number },
): SourceWordEntry => {
  const text = readFileSync(absolutePath, "utf8");
  return { codeWords: readFileWords(getSourceComments(path, text).code), mtimeMs, size };
};
