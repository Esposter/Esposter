import { getPackagePath } from "#src/services/sweeps/sharedExportConsumers/getPackagePath";

// A maximal run of identifier characters, `$` included — `\w` alone would split `$trpc` into `trpc` and read a
// Name carrying a `$` as one it never contains.
const NON_IDENTIFIER_REGEX = /[^\w$]+/u;

// Every identifier each package spells, read once. Answering "which packages name this export" by running a
// Regex over every file for every export reads the corpus once per export; a set per package reads it once and
// Answers each export by lookup. Insertion order is the order the packages first appear in the corpus.
export const getPackageIdentifiersMap = (
  corpus: readonly (readonly [string, string])[],
): Map<string, ReadonlySet<string>> => {
  const packageIdentifiersMap = new Map<string, Set<string>>();
  for (const [path, text] of corpus) {
    const packagePath = getPackagePath(path);
    const identifiers = packageIdentifiersMap.get(packagePath) ?? new Set<string>();
    for (const identifier of text.split(NON_IDENTIFIER_REGEX)) if (identifier) identifiers.add(identifier);
    packageIdentifiersMap.set(packagePath, identifiers);
  }
  return packageIdentifiersMap;
};
