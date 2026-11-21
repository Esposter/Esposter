import type { BarrelLines } from "#src/models/precheck/BarrelLines";
import type { GeneratedFileCheck } from "#src/models/precheck/GeneratedFileCheck";
import type { ExportsGeneration } from "@esposter/configuration";

import { generateBarrelLines } from "#src/services/precheck/generateBarrelLines";
import { getBarrelFindings } from "#src/services/precheck/getBarrelFindings";
import { getExpectedLines } from "#src/services/precheck/getExpectedLines";
import { getLazyDirectories } from "#src/services/precheck/getLazyDirectories";
import { readBarrelLines } from "#src/services/precheck/readBarrelLines";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { generateExports, getSubpathExclusions, readPackageManifest } from "@esposter/configuration";
import { BARREL_FILE, COMPONENTS_DIRECTORY, SOURCE_DIRECTORY_NAME } from "@esposter/configuration/constants";
import { existsSync } from "node:fs";
import { join } from "node:path";

// One package's barrels against what its generator writes: each line the generator would write that a committed barrel
// Lacks, and each committed line it would not write. With `fix`, the generator writes the barrels instead
export const checkBarrel = (packageDirectory: string, fix: boolean): GeneratedFileCheck => {
  const packageRoot = join(REPOSITORY_ROOT, packageDirectory);
  const sourceDirectory = join(packageRoot, SOURCE_DIRECTORY_NAME);
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
  // The barrels are compared without the modules the package's subpath arms name, which its build leaves out of them
  const excludedPaths = getSubpathExclusions(readPackageManifest(packageRoot));
  const fullLines = generateBarrelLines(sourceDirectory, exportsGeneration, excludedPaths);
  const lazyDirectories = getLazyDirectories(fullLines.source, committedLines.source);
  // The component barrel leaves out its own lazy directories, which the source barrel does not name, so they are read off
  // The component lines the committed barrel holds, and the generator is handed them under `components`
  const lazyComponentDirectories = getLazyDirectories(fullLines.components, committedLines.components);
  const findings = [
    ...getBarrelFindings(barrelLabel, getExpectedLines(fullLines.source, lazyDirectories), committedLines.source),
    ...getBarrelFindings(
      componentsLabel,
      getExpectedLines(fullLines.components, lazyComponentDirectories),
      committedLines.components,
    ),
  ];
  if (findings.length === 0) return { findings: [], regenerated: [] };
  if (fix) {
    generateExports(packageRoot, exportsGeneration, [
      ...excludedPaths,
      ...lazyDirectories,
      ...lazyComponentDirectories.map((directory) => join(COMPONENTS_DIRECTORY, directory)),
    ]);
    return { findings: [], regenerated: exportsGeneration === "vue" ? [barrelLabel, componentsLabel] : [barrelLabel] };
  }
  return { findings, regenerated: [] };
};
