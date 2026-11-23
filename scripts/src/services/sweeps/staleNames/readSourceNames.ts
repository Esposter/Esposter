import { APP_DIRECTORY, REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { addWords } from "#src/services/sweeps/staleNames/addWords";
import { getComponentName } from "#src/services/sweeps/staleNames/getComponentName";
import { readSourceEntries } from "#src/services/sweeps/staleNames/readSourceEntries";
import { globSync, readFileSync } from "node:fs";
import { join } from "node:path";

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
  const paths = readSweepFilePaths(".");

  for (const path of paths) {
    for (const segment of path.split("/")) {
      names.add(segment);
      for (const part of segment.split(".")) names.add(part);
    }

    const componentPath = COMPONENT_PATH_REGEX.exec(path)?.groups?.componentPath;
    if (componentPath) names.add(getComponentName(componentPath));
  }
  const { codeWords } = readSourceEntries(paths);

  for (const declarationPath of globSync("**/*.d.ts", { cwd: NUXT_DECLARATIONS_DIRECTORY }))
    addWords(names, readFileSync(join(NUXT_DECLARATIONS_DIRECTORY, declarationPath), "utf8"));

  return names.union(new Set(codeWords));
};
