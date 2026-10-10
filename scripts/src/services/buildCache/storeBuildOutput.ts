import {
  BUILD_CACHE_TEMPORARY_PREFIX,
  BUILD_GENERATED_DIRECTORY,
  BUILD_OUTPUT_DIRECTORY,
} from "#src/services/buildCache/constants";
import { copyFileSync, cpSync, existsSync, mkdirSync, mkdtempSync, renameSync, rmSync } from "node:fs";
import { basename, dirname, join } from "node:path";

// Writes a build's `dist` and its generated barrels into one key's folder, beside it first and renamed into place, so a
// Reader never sees a half-copied key, from a folder made empty for it so a copy an interrupted run left never joins it. The barrels sit under `generated/` at the paths they have in the package.
export const storeBuildOutput = (packageDirectory: string, keyDirectory: string, generatedPaths: string[]): void => {
  mkdirSync(dirname(keyDirectory), { recursive: true });
  const temporaryDirectory = mkdtempSync(
    join(dirname(keyDirectory), `${BUILD_CACHE_TEMPORARY_PREFIX}${basename(keyDirectory)}-`),
  );
  cpSync(join(packageDirectory, BUILD_OUTPUT_DIRECTORY), join(temporaryDirectory, BUILD_OUTPUT_DIRECTORY), {
    recursive: true,
  });
  for (const path of generatedPaths) {
    const storedPath = join(temporaryDirectory, BUILD_GENERATED_DIRECTORY, path);
    mkdirSync(dirname(storedPath), { recursive: true });
    copyFileSync(join(packageDirectory, path), storedPath);
  }
  if (existsSync(keyDirectory)) rmSync(temporaryDirectory, { force: true, recursive: true });
  else renameSync(temporaryDirectory, keyDirectory);
};
