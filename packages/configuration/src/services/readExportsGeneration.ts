import { ExportsGeneration } from "#src/models/ExportsGeneration";
import { BARREL_FILE, SOURCE_DIRECTORY_NAME } from "#src/services/constants";
import { readPackageManifest } from "#src/services/readPackageManifest";
import { globSync } from "node:fs";
import { join } from "node:path";

// The `.` export of a package whose barrel is its entry, which is the one a library's manifest names
const BARREL_SOURCE = `./${SOURCE_DIRECTORY_NAME}/${BARREL_FILE}`;

// Read off the package itself, so no build option states it beside the package: one that ships `.vue` files answers
// Vue, one whose `.` export names its `src/index.ts` answers TypeScript, and any other names its own entrypoints, so it
// Answers None. A Nuxt module's `.` export names its `src/module.ts`, which is why it answers None too
export const readExportsGeneration = (packageDirectory: string): ExportsGeneration => {
  if (globSync("**/*.vue", { cwd: join(packageDirectory, SOURCE_DIRECTORY_NAME) }).length > 0)
    return ExportsGeneration.Vue;
  const entry = readPackageManifest(packageDirectory).exports?.["."];
  return (typeof entry === "string" ? entry : entry?.source) === BARREL_SOURCE
    ? ExportsGeneration.TypeScript
    : ExportsGeneration.None;
};
