import type { ExportsGeneration } from "#src/models/ExportsGeneration";

import { BARREL_FILE, COMPONENTS_DIRECTORY } from "#src/services/constants";
import { generateComponentBarrel } from "#src/services/generateComponentBarrel";
import { generateSourceBarrel } from "#src/services/generateSourceBarrel";
import { rmSync } from "node:fs";
import { join } from "node:path";

const SOURCE_DIRECTORY_NAME = "src";
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
