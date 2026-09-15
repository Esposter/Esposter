import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { getSweepFilePaths } from "#src/services/sweeps/getSweepFilePaths";
import { addWords } from "#src/services/sweeps/staleNames/addWords";
import { getComponentName } from "#src/services/sweeps/staleNames/getComponentName";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Text a name can be declared or used in. Markdown is left out on purpose: the pages are what the scan judges,
// And a stale name cited on two of them would otherwise vouch for itself.
const SOURCE_EXTENSION_REGEX = /\.(?:[cm]?[jt]s|vue|json|ya?ml|toml|s?css|html|sh|ps1)$/u;
const COMPONENT_PATH_REGEX = /\/components\/(?<componentPath>.+\.vue)$/u;

// Every name the tracked tree holds: each word of every source file, every path segment (a directory a ledger
// Row names, a file name whole and by its dot-split parts, so `Foo.test.ts` vouches for `Foo`), and the registered
// Name of every Nuxt component, which no file writes
export const readSourceNames = (): Set<string> => {
  const names = new Set<string>();

  for (const path of getSweepFilePaths(".")) {
    for (const segment of path.split("/")) {
      names.add(segment);
      for (const part of segment.split(".")) names.add(part);
    }

    const componentPath = COMPONENT_PATH_REGEX.exec(path)?.groups?.componentPath;
    if (componentPath) names.add(getComponentName(componentPath));
    if (!SOURCE_EXTENSION_REGEX.test(path)) continue;

    addWords(names, readFileSync(resolve(REPOSITORY_ROOT, path), "utf8"));
  }

  return names;
};
