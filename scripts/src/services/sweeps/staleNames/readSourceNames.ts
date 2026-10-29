import type { SourceWordEntry } from "#src/models/sweeps/staleNames/SourceWordEntry";

import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { addWords } from "#src/services/sweeps/staleNames/addWords";
import { SOURCE_WORD_CACHE_PATH } from "#src/services/sweeps/staleNames/constants";
import { getComponentName } from "#src/services/sweeps/staleNames/getComponentName";
import { readFileWords } from "#src/services/sweeps/staleNames/readFileWords";
import { readGeneratedPatterns } from "#src/services/sweeps/staleNames/readGeneratedPatterns";
import { readSourceWordCache } from "#src/services/sweeps/staleNames/readSourceWordCache";
import { writeCacheFile } from "#src/services/sweeps/staleNames/writeCacheFile";
import { globSync, readFileSync, statSync } from "node:fs";
import { join, matchesGlob, resolve } from "node:path";

// Text a name can be declared or used in. Markdown is left out on purpose: the pages are what the scan judges,
// And a stale name cited on two of them would otherwise vouch for itself.
const SOURCE_EXTENSION_REGEX = /\.(?:[cm]?[jt]s|vue|json|ya?ml|toml|s?css|html|sh|ps1)$/u;
const COMPONENT_PATH_REGEX = /\/components\/(?<componentPath>.+\.vue)$/u;
// The declarations Nuxt generates for the app — its own components and auto-imports beside the app's — which are
// Gitignored, so they are read by path rather than through git, and are simply absent on a checkout nothing has
// Prepared yet
const NUXT_DECLARATIONS_DIRECTORY = join(REPOSITORY_ROOT, "apps", "web", ".nuxt");

// Every name the tracked tree holds: each word of every source file, every path segment (a directory a ledger
// Row names, a file name whole and by its dot-split parts, so `Foo.test.ts` vouches for `Foo`), the registered
// Name of every Nuxt component, which no file writes, and every word of the declarations Nuxt generates. A source
// File whose modification time and size still match the cache is not read again, and a tree none of whose files
// Changed takes its words from the cache's union rather than from every entry
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
    entries[path] = isCurrent ? cached : { mtimeMs, size, words: readFileWords(absolutePath) };
  }

  // A file read again, or a file gone since the last scan, changes the union the cache holds
  const isCacheUnchanged = !isEntryChanged && Object.keys(cache.entries).length === Object.keys(entries).length;
  const words = isCacheUnchanged ? cache.words : [...new Set(Object.values(entries).flatMap((entry) => entry.words))];
  for (const word of words) names.add(word);

  for (const declarationPath of globSync("**/*.d.ts", { cwd: NUXT_DECLARATIONS_DIRECTORY }))
    addWords(names, readFileSync(join(NUXT_DECLARATIONS_DIRECTORY, declarationPath), "utf8"));

  if (!isCacheUnchanged) writeCacheFile(SOURCE_WORD_CACHE_PATH, JSON.stringify({ entries, generatedPatterns, words }));
  return names;
};
