import type { ExportsGeneration } from "#src/models/ExportsGeneration";

import { NON_SOURCE_SUFFIXES } from "#src/constants";
import { getComponentName } from "#src/getComponentName";
import { existsSync, globSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseSync } from "rolldown/utils";

const SOURCE_DIRECTORY_NAME = "src";
const COMPONENTS_DIRECTORY = "components";
const BARREL_FILE = "index.ts";
// Every line is `export *`, so two modules exporting one name are an ambiguity TypeScript reports (TS2308) in the
// Package's own typecheck and in every consumer resolving its source — never a name quietly left out of the barrel.
// An unchanged barrel is never rewritten: under `watch:packages` a sibling vendoring this source reads it mid-write,
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

const generateSourceBarrel = (sourceDirectory: string): void => {
  const specifiers = globSync("**/*.ts", { cwd: sourceDirectory })
    .map((path) => path.replaceAll("\\", "/"))
    .filter(
      (path) =>
        path !== BARREL_FILE &&
        !path.endsWith(".d.ts") &&
        !NON_SOURCE_SUFFIXES.some((suffix) => path.endsWith(suffix)) &&
        checkHasExport(join(sourceDirectory, path)),
    )
    .map((path) => path.slice(0, -".ts".length));
  writeBarrel(sourceDirectory, specifiers, (specifier) => `export * from "./${specifier}";`);
};
// In order: the Vue answer writes the component barrel first, because the source barrel then lists it like any other
// Module
const BarrelGeneratorsMap: Record<ExportsGeneration, ((sourceDirectory: string) => void)[]> = {
  none: [],
  typescript: [generateSourceBarrel],
  vue: [generateComponentBarrel, generateSourceBarrel],
};
// Writes the barrels into `src` under the package directory tsdown resolved, from the build's `build:prepare` hook
export const generateExports = (packageDirectory: string, exportsGeneration: ExportsGeneration): void => {
  const sourceDirectory = join(packageDirectory, SOURCE_DIRECTORY_NAME);
  for (const generateBarrel of BarrelGeneratorsMap[exportsGeneration]) generateBarrel(sourceDirectory);
};
