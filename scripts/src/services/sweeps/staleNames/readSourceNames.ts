import type { SourceWordEntry } from "#src/models/sweeps/staleNames/SourceWordEntry";

import { APP_DIRECTORY, REPOSITORY_ROOT } from "#src/services/shared/constants";
import { writeFileAtomically } from "#src/services/shared/writeFileAtomically";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { addWords } from "#src/services/sweeps/staleNames/addWords";
import {
  SOURCE_EXTENSION_REGEX,
  SOURCE_WORD_CACHE_PATH,
  SOURCE_WORD_CACHE_VERSION,
} from "#src/services/sweeps/staleNames/constants";
import { getComponentName } from "#src/services/sweeps/staleNames/getComponentName";
import { readGeneratedPatterns } from "#src/services/sweeps/staleNames/readGeneratedPatterns";
import { readSourceWordCache } from "#src/services/sweeps/staleNames/readSourceWordCache";
import { readSourceWordEntry } from "#src/services/sweeps/staleNames/readSourceWordEntry";
import { globSync, readFileSync, statSync } from "node:fs";
import { join, matchesGlob, resolve } from "node:path";

const COMPONENT_PATH_REGEX = /\/components\/(?<componentPath>.+\.vue)$/u;
// The declarations Nuxt generates for the app — its own components and auto-imports beside the app's — which are
// Gitignored, so they are read by path rather than through git, and are simply absent on a checkout nothing has
// Prepared yet
const NUXT_DECLARATIONS_DIRECTORY = join(REPOSITORY_ROOT, APP_DIRECTORY, ".nuxt");

// Every name the code holds: each word of every source file with its comments blanked, every path segment (a directory
// A ledger row names, a file name whole and by its dot-split parts, so `Foo.test.ts` vouches for `Foo`), the registered
// Name of every Nuxt component, which no file writes, and every word of the declarations Nuxt generates. A comment's
// Own words vouch for nothing, so a name only a comment holds is not here. A source file whose modification time and
// Size still match the cache is not read again, and a tree none of whose files changed takes its words from the cache
// Rather than from every entry
export const readSourceNames = (): Set<string> => {
  const names = new Set<string>();
  const generatedPatterns = readGeneratedPatterns();
  const cache = readSourceWordCache(generatedPatterns);
  const entries: Record<string, SourceWordEntry> = {};
  let isEntryChanged = false;

  for (const path of readSweepFilePaths(".")) {
    for (const segment of path.split("/")) {
      names.add(segment);
      for (const part of segment.split(".")) names.add(part);
    }

    const componentPath = COMPONENT_PATH_REGEX.exec(path)?.groups?.componentPath;
    if (componentPath) names.add(getComponentName(componentPath));
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

  for (const declarationPath of globSync("**/*.d.ts", { cwd: NUXT_DECLARATIONS_DIRECTORY }))
    addWords(names, readFileSync(join(NUXT_DECLARATIONS_DIRECTORY, declarationPath), "utf8"));

  if (!isCacheUnchanged)
    writeFileAtomically(
      SOURCE_WORD_CACHE_PATH,
      JSON.stringify({ codeWords, entries, generatedPatterns, version: SOURCE_WORD_CACHE_VERSION }),
    );

  return names.union(new Set(codeWords));
};
