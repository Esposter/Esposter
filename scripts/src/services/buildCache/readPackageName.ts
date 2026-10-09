import { jsonDateParse } from "@esposter/shared";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// The name a package is cached under, read from its manifest in its own folder
export const readPackageName = (packageDirectory: string): string =>
  jsonDateParse<{ name: string }>(readFileSync(join(packageDirectory, "package.json"), "utf8")).name;
