import { ExportsGeneration } from "#src/models/ExportsGeneration";
import { BARREL_FILE, COMPONENTS_DIRECTORY, SOURCE_DIRECTORY_NAME } from "#src/services/constants";
import { generateComponentBarrel } from "#src/services/generateComponentBarrel";
import { generateSourceBarrel } from "#src/services/generateSourceBarrel";
import { rmSync } from "node:fs";
import { join } from "node:path";

const COMPONENT_BARREL_PATH = join(COMPONENTS_DIRECTORY, BARREL_FILE);
// Each answer's `src`-relative barrels and the generators that write them. The generators run in order: the Vue answer
// Writes the component barrel first, because the source barrel then lists it like any other module. Every barrel is
// Build output the repository tracks, so one on disk that the answer does not write is an earlier build's, left when
// The package changed its answer. It is removed: the package's own typecheck would still read it, naming modules the
// Package may have since deleted, and nothing else would ever clear it
const BarrelsMap: Record<
  ExportsGeneration,
  { barrelPaths: string[]; generators: ((sourceDirectory: string, excludedPaths: string[]) => void)[] }
> = {
  [ExportsGeneration.None]: { barrelPaths: [], generators: [] },
  [ExportsGeneration.TypeScript]: { barrelPaths: [BARREL_FILE], generators: [generateSourceBarrel] },
  [ExportsGeneration.Vue]: {
    barrelPaths: [COMPONENT_BARREL_PATH, BARREL_FILE],
    generators: [generateComponentBarrel, generateSourceBarrel],
  },
};
const ALL_BARREL_PATHS = new Set(Object.values(BarrelsMap).flatMap(({ barrelPaths }) => barrelPaths));
// Writes the barrels into `src` under the package directory tsdown resolved, from the build's `build:prepare` hook.
// `excludedPaths` are the `src`-relative folders and modules both barrels leave out: a directory the package loads on demand,
// And a subpath entry's module or folder, which `getSubpathExclusions` derives from the package's entries.
export const generateExports = (
  packageDirectory: string,
  exportsGeneration: ExportsGeneration,
  excludedPaths: string[] = [],
): void => {
  const sourceDirectory = join(packageDirectory, SOURCE_DIRECTORY_NAME);
  const { barrelPaths, generators } = BarrelsMap[exportsGeneration];
  // Under None the package writes `src/index.ts` itself as its curated entry, so that name is kept rather than removed
  const keptPaths = exportsGeneration === ExportsGeneration.None ? [...barrelPaths, BARREL_FILE] : barrelPaths;
  for (const barrelPath of ALL_BARREL_PATHS)
    if (!keptPaths.includes(barrelPath)) rmSync(join(sourceDirectory, barrelPath), { force: true });
  for (const generateBarrel of generators) generateBarrel(sourceDirectory, excludedPaths);
};
