import type { ExportsGeneration } from "@esposter/configuration";
import type { BarrelCheck } from "#src/models/precheck/BarrelCheck";

import { BARREL_FILE, COMPONENTS_DIRECTORY } from "@esposter/configuration";
import { SOURCE_DIRECTORY_NAME } from "#src/services/precheck/constants";
import { generateBarrelLines } from "#src/services/precheck/generateBarrelLines";
import { getBarrelDifference } from "#src/services/precheck/getBarrelDifference";
import { getExpectedLines } from "#src/services/precheck/getExpectedLines";
import { getLazyDirectories } from "#src/services/precheck/getLazyDirectories";
import { readBarrelLines } from "#src/services/precheck/readBarrelLines";
import { spawnGenerateExports } from "#src/services/precheck/spawnGenerateExports";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { existsSync } from "node:fs";
import { join } from "node:path";

// One package's barrel against what its generator writes: each line the generator would write that the committed barrel
// Lacks, and each committed line it would not write. With `fix`, the generator writes the barrel instead
export const checkBarrel = (packageDirectory: string, mainCheckoutRoot: string, fix: boolean): BarrelCheck => {
  const sourceDirectory = join(REPOSITORY_ROOT, packageDirectory, SOURCE_DIRECTORY_NAME);
  const barrelLabel = `${packageDirectory}/${SOURCE_DIRECTORY_NAME}/${BARREL_FILE}`;
  // A package that generates no barrel has none on disk, so there is nothing to compare
  if (!existsSync(join(sourceDirectory, BARREL_FILE))) return { findings: [], regenerated: [] };
  // A Vue package's component barrel exists only where the Vue answer writes it
  const exportsGeneration: ExportsGeneration = existsSync(join(sourceDirectory, COMPONENTS_DIRECTORY, BARREL_FILE))
    ? "vue"
    : "typescript";
  const committedLines = readBarrelLines(sourceDirectory);
  const fullLines = generateBarrelLines(sourceDirectory, exportsGeneration, mainCheckoutRoot);
  const lazyDirectories = getLazyDirectories(fullLines, committedLines);
  const { extra, missing } = getBarrelDifference(getExpectedLines(fullLines, lazyDirectories), committedLines);
  if (missing.length === 0 && extra.length === 0) return { findings: [], regenerated: [] };
  if (fix) {
    spawnGenerateExports(join(REPOSITORY_ROOT, packageDirectory), exportsGeneration, lazyDirectories, mainCheckoutRoot);
    return { findings: [], regenerated: [barrelLabel] };
  }
  return {
    findings: [
      ...missing.map((line) => `${barrelLabel} missing ${line}`),
      ...extra.map((line) => `${barrelLabel} extra ${line}`),
    ],
    regenerated: [],
  };
};
