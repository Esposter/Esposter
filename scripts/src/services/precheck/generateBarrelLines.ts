import type { BarrelLines } from "#src/models/precheck/BarrelLines";
import type { ExportsGeneration } from "@esposter/configuration";

import { readBarrelLines } from "#src/services/precheck/readBarrelLines";
import { generateExports } from "@esposter/configuration";
import { BARREL_FILE, COMPONENTS_DIRECTORY, SOURCE_DIRECTORY_NAME } from "@esposter/configuration/constants";
import { withFinalizer } from "@esposter/shared";
import { cpSync, mkdtempSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const SOURCE_FILE_REGEX = /\.(?:ts|vue)$/u;

// The barrels the generator writes for a package, computed over a copy of its source so the committed barrels are never
// Written. The copy keeps the modules and their exports, which is all the generator reads, and is removed either way.
// The generator is this checkout's own, the one its build runs, so the barrels are checked against the commit's generator
export const generateBarrelLines = (
  sourceDirectory: string,
  exportsGeneration: ExportsGeneration,
  excludedPaths: string[],
): BarrelLines => {
  const copyDirectory = mkdtempSync(join(tmpdir(), "precheck-barrel-"));
  return withFinalizer(
    () => {
      cpSync(sourceDirectory, join(copyDirectory, SOURCE_DIRECTORY_NAME), {
        filter: (source) => statSync(source).isDirectory() || SOURCE_FILE_REGEX.test(source),
        recursive: true,
      });
      generateExports(copyDirectory, exportsGeneration, excludedPaths);
      const copySourceDirectory = join(copyDirectory, SOURCE_DIRECTORY_NAME);
      return {
        components: readBarrelLines(join(copySourceDirectory, COMPONENTS_DIRECTORY, BARREL_FILE)),
        source: readBarrelLines(join(copySourceDirectory, BARREL_FILE)),
      };
    },
    () => {
      rmSync(copyDirectory, { force: true, recursive: true });
    },
  );
};
