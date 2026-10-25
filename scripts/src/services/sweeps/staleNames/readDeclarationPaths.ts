import { DECLARATION_REGEX } from "#src/services/sweeps/staleNames/constants";
import { readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";

// A package's type declarations, its own nested `node_modules` left out — those are another package's
export const readDeclarationPaths = (packageDirectory: string): string[] =>
  readdirSync(packageDirectory, { recursive: true, withFileTypes: true })
    .filter(
      (entry) =>
        entry.isFile() &&
        DECLARATION_REGEX.test(entry.name) &&
        !relative(packageDirectory, entry.parentPath).split(sep).includes("node_modules"),
    )
    .map((entry) => join(entry.parentPath, entry.name));
