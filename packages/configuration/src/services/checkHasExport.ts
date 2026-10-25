import { readFileSync } from "node:fs";
import { parseSync } from "rolldown/utils";

// A module with no export is a program rather than a library file — a CLI, a test setup — and listing it would
// Run it on every import of the package. The parse is oxc's, the same one the build reads the file with, and it
// Counts a type-only export as one
export const checkHasExport = (path: string): boolean =>
  parseSync(path, readFileSync(path, "utf8")).module.staticExports.length > 0;
