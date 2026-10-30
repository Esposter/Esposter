import type { BarrelCheck } from "#src/models/precheck/BarrelCheck";
import type { BarrelLines } from "#src/models/precheck/BarrelLines";
import type { ExportsGeneration } from "@esposter/configuration";

import { SOURCE_DIRECTORY_NAME } from "#src/services/precheck/constants";
import { generateBarrelLines } from "#src/services/precheck/generateBarrelLines";
import { getBarrelFindings } from "#src/services/precheck/getBarrelFindings";
import { getExpectedLines } from "#src/services/precheck/getExpectedLines";
import { getLazyDirectories } from "#src/services/precheck/getLazyDirectories";
import { readBarrelLines } from "#src/services/precheck/readBarrelLines";
import { spawnGenerateExports } from "#src/services/precheck/spawnGenerateExports";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { BARREL_FILE, COMPONENTS_DIRECTORY } from "@esposter/configuration";
import { existsSync } from "node:fs";
import { join } from "node:path";

// One package's barrels against what its generator writes: each line the generator would write that a committed barrel
// Lacks, and each committed line it would not write. With `fix`, the generator writes the barrels instead
export const checkBarrel = (packageDirectory: string, mainCheckoutRoot: string, fix: boolean): BarrelCheck => {
  const sourceDirectory = join(REPOSITORY_ROOT, packageDirectory, SOURCE_DIRECTORY_NAME);
  const barrelLabel = `${packageDirectory}/${SOURCE_DIRECTORY_NAME}/${BARREL_FILE}`;
  const componentsLabel = `${packageDirectory}/${SOURCE_DIRECTORY_NAME}/${COMPONENTS_DIRECTORY}/${BARREL_FILE}`;
  // A package that generates no barrel has none on disk, so there is nothing to compare
  if (!existsSync(join(sourceDirectory, BARREL_FILE))) return { findings: [], regenerated: [] };
  // A Vue package's component barrel exists only where the Vue answer writes it
  const exportsGeneration: ExportsGeneration = existsSync(join(sourceDirectory, COMPONENTS_DIRECTORY, BARREL_FILE))
    ? "vue"
    : "typescript";
  const committedLines: BarrelLines = {
    components: readBarrelLines(join(sourceDirectory, COMPONENTS_DIRECTORY, BARREL_FILE)),
    source: readBarrelLines(join(sourceDirectory, BARREL_FILE)),
  };
  const fullLines = generateBarrelLines(sourceDirectory, exportsGeneration, mainCheckoutRoot);
  const lazyDirectories = getLazyDirectories(fullLines.source, committedLines.source);
  const findings = [
    ...getBarrelFindings(barrelLabel, getExpectedLines(fullLines.source, lazyDirectories), committedLines.source),
    ...getBarrelFindings(componentsLabel, fullLines.components, committedLines.components),
  ];
  if (findings.length === 0) return { findings: [], regenerated: [] };
  if (fix) {
    spawnGenerateExports(join(REPOSITORY_ROOT, packageDirectory), exportsGeneration, lazyDirectories, mainCheckoutRoot);
    return { findings: [], regenerated: exportsGeneration === "vue" ? [barrelLabel, componentsLabel] : [barrelLabel] };
  }
  return { findings, regenerated: [] };
};
