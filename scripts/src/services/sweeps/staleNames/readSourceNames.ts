import { FORMATTER_CONFIGURATION_FILE, REPOSITORY_ROOT } from "#src/services/shared/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { addWords } from "#src/services/sweeps/staleNames/addWords";
import { getComponentName } from "#src/services/sweeps/staleNames/getComponentName";
import { globSync, readFileSync } from "node:fs";
import { join, matchesGlob, resolve } from "node:path";

// Text a name can be declared or used in. Markdown is left out on purpose: the pages are what the scan judges,
// And a stale name cited on two of them would otherwise vouch for itself.
const SOURCE_EXTENSION_REGEX = /\.(?:[cm]?[jt]s|vue|json|ya?ml|toml|s?css|html|sh|ps1)$/u;
const COMPONENT_PATH_REGEX = /\/components\/(?<componentPath>.+\.vue)$/u;
// The declarations Nuxt generates for the app — its own components and auto-imports beside the app's — which are
// Gitignored, so they are read by path rather than through git, and are simply absent on a checkout nothing has
// Prepared yet
const NUXT_DECLARATIONS_DIRECTORY = join(REPOSITORY_ROOT, "apps", "web", ".nuxt");

// A generated file vouches for nothing its generator's source does not, and an old one vouches for what that source
// Since dropped — a migration snapshot still spells every column a later migration removed. The formatter's ignore
// List is the repo's one list of what is generated, so the scan skips exactly what the formatter skips. A pattern
// Naming a directory covers the files under it, as the formatter reads it.
const readGeneratedPatterns = (): string[] =>
  parseMachineJson<{ ignorePatterns: string[] }>(
    readFileSync(join(REPOSITORY_ROOT, FORMATTER_CONFIGURATION_FILE), "utf8"),
  ).ignorePatterns.flatMap((pattern) => [pattern, `${pattern}/**`]);

// Every name the tracked tree holds: each word of every source file, every path segment (a directory a ledger
// Row names, a file name whole and by its dot-split parts, so `Foo.test.ts` vouches for `Foo`), the registered
// Name of every Nuxt component, which no file writes, and every word of the declarations Nuxt generates
export const readSourceNames = (): Set<string> => {
  const names = new Set<string>();
  const generatedPatterns = readGeneratedPatterns();

  for (const path of readSweepFilePaths(".")) {
    for (const segment of path.split("/")) {
      names.add(segment);
      for (const part of segment.split(".")) names.add(part);
    }

    const componentPath = COMPONENT_PATH_REGEX.exec(path)?.groups?.componentPath;
    if (componentPath) names.add(getComponentName(componentPath));
    if (!SOURCE_EXTENSION_REGEX.test(path) || generatedPatterns.some((pattern) => matchesGlob(path, pattern))) continue;

    addWords(names, readFileSync(resolve(REPOSITORY_ROOT, path), "utf8"));
  }

  for (const declarationPath of globSync("**/*.d.ts", { cwd: NUXT_DECLARATIONS_DIRECTORY }))
    addWords(names, readFileSync(join(NUXT_DECLARATIONS_DIRECTORY, declarationPath), "utf8"));

  return names;
};
