import type { ExportsGeneration } from "@esposter/configuration";

import { SOURCE_DIRECTORY_NAME } from "#src/services/precheck/constants";
import { spawnGenerateExports } from "#src/services/precheck/spawnGenerateExports";
import { readBarrelLines } from "#src/services/precheck/readBarrelLines";
import { withFinalizer } from "@esposter/shared";
import { cpSync, mkdtempSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const SOURCE_FILE_REGEX = /\.(?:ts|vue)$/u;

// The barrel the generator writes for a package, computed over a copy of its source so the committed barrel is never
// Written. The copy keeps the modules and their exports, which is all the generator reads, and is removed either way
export const generateBarrelLines = (
  sourceDirectory: string,
  exportsGeneration: ExportsGeneration,
  mainCheckoutRoot: string,
): string[] => {
  const copyDirectory = mkdtempSync(join(tmpdir(), "precheck-barrel-"));
  return withFinalizer(
    () => {
      cpSync(sourceDirectory, join(copyDirectory, SOURCE_DIRECTORY_NAME), {
        filter: (source) => statSync(source).isDirectory() || SOURCE_FILE_REGEX.test(source),
        recursive: true,
      });
      spawnGenerateExports(copyDirectory, exportsGeneration, [], mainCheckoutRoot);
      return readBarrelLines(join(copyDirectory, SOURCE_DIRECTORY_NAME));
    },
    () => {
      rmSync(copyDirectory, { force: true, recursive: true });
    },
  );
};
