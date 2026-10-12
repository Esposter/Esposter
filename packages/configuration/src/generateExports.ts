import type { ExportsGeneration } from "#src/models/ExportsGeneration";

import { NON_SOURCE_SUFFIXES } from "#src/constants";
import { getComponentName } from "#src/getComponentName";
import { existsSync, globSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseSync } from "rolldown/utils";

const SOURCE_DIRECTORY_NAME = "src";
const COMPONENTS_DIRECTORY = "components";
const BARREL_FILE = "index.ts";
// Every line is `export *`, so two modules exporting one name are an ambiguity TypeScript reports (TS2308) in the
// Package's own typecheck and in every consumer resolving its source — never a name quietly left out of the barrel.
// An unchanged barrel is never rewritten: a sibling vendoring this source, built at the same time, reads it mid-write,
// Resolves nothing and reports the package as an import its `onlyImport` gate rejects
const writeBarrel = (directory: string, specifiers: string[], toLine: (specifier: string) => string): void => {
  const path = join(directory, BARREL_FILE);
  const barrel = specifiers
    .toSorted()
    .map((specifier) => `${toLine(specifier)}\n`)
    .join("");
  if (existsSync(path) && readFileSync(path, "utf8") === barrel) return;
  writeFileSync(path, barrel);
};
// A module with no export is a program rather than a library file — a CLI, a test setup — and listing it would
// Run it on every import of the package. The parse is oxc's, the same one the build reads the file with, and it
// Counts a type-only export as one
const checkHasExport = (path: string): boolean =>
  parseSync(path, readFileSync(path, "utf8")).module.staticExports.length > 0;

// Every component at any depth, named by its path as Nuxt names the app's (`getComponentName`); two of one name are two
// Exports of one name, which the build rejects rather than letting one shadow the other
const generateComponentBarrel = (sourceDirectory: string): void => {
  const directory = join(sourceDirectory, COMPONENTS_DIRECTORY);
  writeBarrel(
    directory,
    globSync("**/*.vue", { cwd: directory }).map((path) => path.replaceAll("\\", "/")),
    (path) => `export { default as ${getComponentName(path)} } from "./${path}";`,
  );
};

// The `src`-relative modules the source barrel lists, which a sweep reads as the barrel's own list without the build having
// Written it. A module under a lazy directory is left out so the entry does not load it: the package reaches it through an
// `import()` of its own, which a barrel line would undo by statically importing the module into the entry.
export const getSourceSpecifiers = (sourceDirectory: string, lazyDirectories: string[]): string[] =>
  globSync("**/*.ts", { cwd: sourceDirectory })
    .map((path) => path.replaceAll("\\", "/"))
    .filter(
      (path) =>
        path !== BARREL_FILE &&
        !path.endsWith(".d.ts") &&
        !NON_SOURCE_SUFFIXES.some((suffix) => path.endsWith(suffix)) &&
        !lazyDirectories.some((directory) => path.startsWith(`${directory}/`)) &&
        checkHasExport(join(sourceDirectory, path)),
    );

const generateSourceBarrel = (sourceDirectory: string, lazyDirectories: string[]): void => {
  // Each module keeps its `.ts` extension, which a bundler takes as it is and which node's own resolution — the one the
  // App's configuration loads and typechecks under — requires of a relative import
  writeBarrel(
    sourceDirectory,
    getSourceSpecifiers(sourceDirectory, lazyDirectories),
    (specifier) => `export * from "./${specifier}";`,
  );
};
// In order: the Vue answer writes the component barrel first, because the source barrel then lists it like any other
// Module
const BarrelGeneratorsMap: Record<ExportsGeneration, ((sourceDirectory: string, lazyDirectories: string[]) => void)[]> =
  { none: [], typescript: [generateSourceBarrel], vue: [generateComponentBarrel, generateSourceBarrel] };
// The `src`-relative barrel each answer writes. Every barrel is gitignored build output, so one on disk that the answer
// Does not write is an earlier build's, left when the package changed its answer. It is removed: the package's own
// Typecheck would still read it, naming modules the package may since have deleted, and CI restores every package's
// Barrel from the last run's cache, so nothing else would ever clear it
const COMPONENT_BARREL_PATH = join(COMPONENTS_DIRECTORY, BARREL_FILE);
const BarrelPathsMap: Record<ExportsGeneration, string[]> = {
  none: [],
  typescript: [BARREL_FILE],
  vue: [COMPONENT_BARREL_PATH, BARREL_FILE],
};
const ALL_BARREL_PATHS = new Set(Object.values(BarrelPathsMap).flat());
// Writes the barrels into `src` under the package directory tsdown resolved, from the build's `build:prepare` hook.
// `lazyDirectories` are `src`-relative directories the package loads on demand, and the source barrel leaves them out.
export const generateExports = (
  packageDirectory: string,
  exportsGeneration: ExportsGeneration,
  lazyDirectories: string[] = [],
): void => {
  const sourceDirectory = join(packageDirectory, SOURCE_DIRECTORY_NAME);
  for (const barrelPath of ALL_BARREL_PATHS)
    if (!BarrelPathsMap[exportsGeneration].includes(barrelPath))
      rmSync(join(sourceDirectory, barrelPath), { force: true });
  for (const generateBarrel of BarrelGeneratorsMap[exportsGeneration]) generateBarrel(sourceDirectory, lazyDirectories);
};
