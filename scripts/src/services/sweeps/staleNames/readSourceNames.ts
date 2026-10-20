import type { SourceWordCache } from "#src/models/sweeps/staleNames/SourceWordCache";
import type { SourceWordEntry } from "#src/models/sweeps/staleNames/SourceWordEntry";

import { CACHE_DIRECTORY, REPOSITORY_ROOT } from "#src/services/shared/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { addWords } from "#src/services/sweeps/staleNames/addWords";
import { getComponentName } from "#src/services/sweeps/staleNames/getComponentName";
import { readFileWords } from "#src/services/sweeps/staleNames/readFileWords";
import { existsSync, globSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, matchesGlob, resolve } from "node:path";

// oxlint-disable-next-line no-restricted-imports -- the repo-root formatter config, which no `#` map can reach
import formatterConfiguration from "../../../../../oxfmt.config.ts";

// Text a name can be declared or used in. Markdown is left out on purpose: the pages are what the scan judges,
// And a stale name cited on two of them would otherwise vouch for itself.
const SOURCE_EXTENSION_REGEX = /\.(?:[cm]?[jt]s|vue|json|ya?ml|toml|s?css|html|sh|ps1)$/u;
const COMPONENT_PATH_REGEX = /\/components\/(?<componentPath>.+\.vue)$/u;
// The declarations Nuxt generates for the app — its own components and auto-imports beside the app's — which are
// Gitignored, so they are read by path rather than through git, and are simply absent on a checkout nothing has
// Prepared yet
const NUXT_DECLARATIONS_DIRECTORY = join(REPOSITORY_ROOT, "apps", "web", ".nuxt");
const SOURCE_WORD_CACHE_PATH = join(CACHE_DIRECTORY, "sourceWords.json");
// A generated file vouches for nothing its generator's source does not, and an old one vouches for what that source
// Since dropped — a migration snapshot still spells every column a later migration removed. The formatter's ignore
// List is the repo's one list of what is generated, so the scan skips exactly what the formatter skips. A pattern
// Naming a directory covers the files under it, as the formatter reads it.
const readGeneratedPatterns = (): string[] =>
  (formatterConfiguration.ignorePatterns ?? []).flatMap((pattern) => [pattern, `${pattern}/**`]);
// The last scan's cache, or an empty one where no scan has written it yet or it was written under other patterns, since
// Its entries hold only the files those patterns did not generate
const readSourceWordCache = (generatedPatterns: string[]): SourceWordCache => {
  const emptyCache: SourceWordCache = { entries: {}, generatedPatterns, words: [] };
  if (!existsSync(SOURCE_WORD_CACHE_PATH)) return emptyCache;

  const cache = parseMachineJson<SourceWordCache>(readFileSync(SOURCE_WORD_CACHE_PATH, "utf8"));
  return JSON.stringify(cache.generatedPatterns) === JSON.stringify(generatedPatterns) ? cache : emptyCache;
};
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

  if (!isCacheUnchanged) {
    mkdirSync(CACHE_DIRECTORY, { recursive: true });
    writeFileSync(SOURCE_WORD_CACHE_PATH, JSON.stringify({ entries, generatedPatterns, words }));
  }
  return names;
};
