import { BARREL_FILE } from "#src/services/constants";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Every line is `export *`, so two modules exporting one name are an ambiguity TypeScript reports (TS2308) in the
// Package's own typecheck and in every consumer resolving its source — never a name quietly left out of the barrel.
// An unchanged barrel is never rewritten: a sibling vendoring this source, built at the same time, reads it mid-write,
// Resolves nothing and reports the package as an import its `onlyImport` gate rejects
export const writeBarrel = (directory: string, specifiers: string[], toLine: (specifier: string) => string): void => {
  const path = join(directory, BARREL_FILE);
  const barrel = specifiers
    .toSorted()
    .map((specifier) => `${toLine(specifier)}\n`)
    .join("");
  if (existsSync(path) && readFileSync(path, "utf8") === barrel) return;
  writeFileSync(path, barrel);
};
