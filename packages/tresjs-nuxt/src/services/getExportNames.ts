import { findExportNames } from "mlly";
import { readFile } from "node:fs/promises";

// Read statically: importing a package to list its exports would load its whole runtime, three included, into every build
export const getExportNames = async (entryPath: string): Promise<string[]> =>
  findExportNames(await readFile(entryPath, "utf8"));
