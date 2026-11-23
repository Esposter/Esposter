import type { SourceWordCache } from "#src/models/sweeps/staleNames/SourceWordCache";

import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { SOURCE_WORD_CACHE_PATH, SOURCE_WORD_CACHE_VERSION } from "#src/services/sweeps/staleNames/constants";
import { existsSync, readFileSync } from "node:fs";

// The last scan's cache, or an empty one where no scan has written it yet or it was written under other patterns or
// Another version of what a word is, since its entries hold only the files those patterns did not generate
export const readSourceWordCache = (generatedPatterns: string[]): SourceWordCache => {
  const emptyCache: SourceWordCache = {
    codeWords: [],
    entries: {},
    generatedPatterns,
    version: SOURCE_WORD_CACHE_VERSION,
  };
  if (!existsSync(SOURCE_WORD_CACHE_PATH)) return emptyCache;

  const cache = parseMachineJson<SourceWordCache>(readFileSync(SOURCE_WORD_CACHE_PATH, "utf8"));
  return JSON.stringify(cache.generatedPatterns) === JSON.stringify(generatedPatterns) &&
    cache.version === SOURCE_WORD_CACHE_VERSION
    ? cache
    : emptyCache;
};
