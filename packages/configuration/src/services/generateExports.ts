import type { ExportsGeneration } from "#src/models/ExportsGeneration";

import { BARREL_FILE, COMPONENTS_DIRECTORY } from "#src/services/constants";
import { generateComponentBarrel } from "#src/services/generateComponentBarrel";
import { generateSourceBarrel } from "#src/services/generateSourceBarrel";
import { rmSync } from "node:fs";
import { join } from "node:path";

const SOURCE_DIRECTORY_NAME = "src";
const COMPONENT_BARREL_PATH = join(COMPONENTS_DIRECTORY, BARREL_FILE);
// Each answer's `src`-relative barrels and the generators that write them. The generators run in order: the Vue answer
// Writes the component barrel first, because the source barrel then lists it like any other module. Every barrel is
// Gitignored build output, so one on disk that the answer does not write is an earlier build's, left when the package
// Changed its answer. It is removed: the package's own typecheck would still read it, naming modules the package may
// Since have deleted, and CI restores every package's barrel from the last run's cache, so nothing else would
// Ever clear it
// oxlint-disable enum-map/no-literal-map-key -- an enum here breaks tsdown loading this package's own config through strip-only type stripping, as ExportsGeneration.ts says
const BarrelsMap: Record<
  ExportsGeneration,
  { barrelPaths: string[]; generators: ((sourceDirectory: string, lazyDirectories: string[]) => void)[] }
> = {
  none: { barrelPaths: [], generators: [] },
  typescript: { barrelPaths: [BARREL_FILE], generators: [generateSourceBarrel] },
  vue: {
    barrelPaths: [COMPONENT_BARREL_PATH, BARREL_FILE],
    generators: [generateComponentBarrel, generateSourceBarrel],
  },
};
// oxlint-enable enum-map/no-literal-map-key
const ALL_BARREL_PATHS = new Set(Object.values(BarrelsMap).flatMap(({ barrelPaths }) => barrelPaths));
// Writes the barrels into `src` under the package directory tsdown resolved, from the build's `build:prepare` hook.
// `lazyDirectories` are `src`-relative directories the package loads on demand, and the source barrel leaves them out.
export const generateExports = (
  packageDirectory: string,
  exportsGeneration: ExportsGeneration,
  lazyDirectories: string[] = [],
): void => {
  const sourceDirectory = join(packageDirectory, SOURCE_DIRECTORY_NAME);
  const { barrelPaths, generators } = BarrelsMap[exportsGeneration];
  for (const barrelPath of ALL_BARREL_PATHS)
    if (!barrelPaths.includes(barrelPath)) rmSync(join(sourceDirectory, barrelPath), { force: true });
  for (const generateBarrel of generators) generateBarrel(sourceDirectory, lazyDirectories);
};
