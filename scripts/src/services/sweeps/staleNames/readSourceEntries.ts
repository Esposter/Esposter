import type { SourceWordCache } from "#src/models/sweeps/staleNames/SourceWordCache";
import type { SourceWordEntry } from "#src/models/sweeps/staleNames/SourceWordEntry";

import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { writeFileAtomically } from "#src/services/shared/writeFileAtomically";
import {
  SOURCE_EXTENSION_REGEX,
  SOURCE_WORD_CACHE_PATH,
  SOURCE_WORD_CACHE_VERSION,
} from "#src/services/sweeps/staleNames/constants";
import { readGeneratedPatterns } from "#src/services/sweeps/staleNames/readGeneratedPatterns";
import { readSourceWordCache } from "#src/services/sweeps/staleNames/readSourceWordCache";
import { readSourceWordEntry } from "#src/services/sweeps/staleNames/readSourceWordEntry";
import { statSync } from "node:fs";
import { matchesGlob, resolve } from "node:path";

// The entries of the source files among `paths` that the patterns did not generate, each with its code words and its
// Comments. A file whose modification time and size still match the cache is taken from it, and the cache is rewritten
// When any entry changed, so the stale-names scan and the citations read each source file once per change
export const readSourceEntries = (paths: string[]): SourceWordCache => {
  const generatedPatterns = readGeneratedPatterns();
  const cache = readSourceWordCache(generatedPatterns);
  const entries: Record<string, SourceWordEntry> = {};
  let isEntryChanged = false;

  for (const path of paths) {
    if (!SOURCE_EXTENSION_REGEX.test(path)) continue;

    // Only a file the patterns did not generate has an entry, so a cached entry needs no pattern check again
    const cached = cache.entries[path];
    if (!cached && generatedPatterns.some((pattern) => matchesGlob(path, pattern))) continue;

    const absolutePath = resolve(REPOSITORY_ROOT, path);
    const { mtimeMs, size } = statSync(absolutePath);
    const isCurrent = cached?.mtimeMs === mtimeMs && cached.size === size;
    if (!isCurrent) isEntryChanged = true;
    entries[path] = isCurrent ? cached : readSourceWordEntry(path, absolutePath, { mtimeMs, size });
  }

  // A file read again, or a file gone since the last scan, changes the unions the cache holds
  const isCacheUnchanged = !isEntryChanged && Object.keys(cache.entries).length === Object.keys(entries).length;
  const codeWords = isCacheUnchanged
    ? cache.codeWords
    : [...new Set(Object.values(entries).flatMap((entry) => entry.codeWords))];
  const sourceCache: SourceWordCache = { codeWords, entries, generatedPatterns, version: SOURCE_WORD_CACHE_VERSION };
  if (!isCacheUnchanged) writeFileAtomically(SOURCE_WORD_CACHE_PATH, JSON.stringify(sourceCache));

  return sourceCache;
};
