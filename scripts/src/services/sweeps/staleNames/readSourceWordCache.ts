import type { SourceWordCache } from "#src/models/sweeps/staleNames/SourceWordCache";

import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { SOURCE_WORD_CACHE_PATH } from "#src/services/sweeps/staleNames/constants";
import { existsSync, readFileSync } from "node:fs";

// The last scan's cache, or an empty one where no scan has written it yet or it was written under other patterns, since
// Its entries hold only the files those patterns did not generate
export const readSourceWordCache = (generatedPatterns: string[]): SourceWordCache => {
  const emptyCache: SourceWordCache = { entries: {}, generatedPatterns, words: [] };
  if (!existsSync(SOURCE_WORD_CACHE_PATH)) return emptyCache;

  const cache = parseMachineJson<SourceWordCache>(readFileSync(SOURCE_WORD_CACHE_PATH, "utf8"));
  return JSON.stringify(cache.generatedPatterns) === JSON.stringify(generatedPatterns) ? cache : emptyCache;
};
