import {
  BUILD_CACHE_TEMPORARY_PREFIX,
  BUILD_GENERATED_DIRECTORY,
  BUILD_OUTPUT_DIRECTORY,
} from "#src/services/buildCache/constants";
import { getResult } from "@esposter/shared";
import { cpSync, existsSync, mkdirSync, mkdtempSync, renameSync, rmSync, utimesSync } from "node:fs";
import { join } from "node:path";

// Writes back the generated barrels of one key, each at its path in the package, so a sibling typechecking against this
// Package's source finds the barrels the build would have written
export const restoreGeneratedPaths = (packageDirectory: string, keyDirectory: string): void => {
  const generatedDirectory = join(keyDirectory, BUILD_GENERATED_DIRECTORY);
  if (existsSync(generatedDirectory)) cpSync(generatedDirectory, packageDirectory, { recursive: true });
};

// Replaces a package's `dist` and barrels with one key's stored output, true when it did. The `dist` is copied into the
// Package's own ignored `node_modules`, on the output's disk, and renamed into place, so a key another worktree's prune
// Removes under the copy leaves the current `dist` standing and answers false, for the caller to build instead. The copy
// Starts in a folder made empty for it, so a copy an interrupted run left never joins it
export const restoreBuildOutput = (packageDirectory: string, keyDirectory: string): boolean => {
  const outputDirectory = join(packageDirectory, BUILD_OUTPUT_DIRECTORY);
  const stagingParentDirectory = join(packageDirectory, "node_modules");
  mkdirSync(stagingParentDirectory, { recursive: true });
  const stagingDirectory = mkdtempSync(
    join(stagingParentDirectory, `${BUILD_CACHE_TEMPORARY_PREFIX}${BUILD_OUTPUT_DIRECTORY}-`),
  );
  const now = new Date();
  const isStaged = getResult(() => {
    utimesSync(keyDirectory, now, now);
    cpSync(join(keyDirectory, BUILD_OUTPUT_DIRECTORY), stagingDirectory, { recursive: true });
  }).match(
    () => true,
    (error) => {
      console.warn(`The cached build ${keyDirectory} could not be restored, so it is built: ${error.message}`);
      return false;
    },
  );
  if (!isStaged) {
    rmSync(stagingDirectory, { force: true, recursive: true });
    return false;
  }

  rmSync(outputDirectory, { force: true, recursive: true });
  renameSync(stagingDirectory, outputDirectory);
  restoreGeneratedPaths(packageDirectory, keyDirectory);
  return true;
};
