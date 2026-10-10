import { BuildCacheOutcome } from "#src/models/buildCache/BuildCacheOutcome";
import { computeBuildKey } from "#src/services/buildCache/computeBuildKey";
import {
  BUILD_CACHE_DIRECTORY,
  BUILD_CACHE_RUN_IN_SLOT_PATH,
  BUILD_OUTPUT_DIRECTORY,
  BUILD_STAMP_FILE,
} from "#src/services/buildCache/constants";
import { pruneBuildCache } from "#src/services/buildCache/pruneBuildCache";
import { readGeneratedBarrelPaths } from "#src/services/buildCache/readGeneratedBarrelPaths";
import { readPackageName } from "#src/services/buildCache/readPackageName";
import { readWorkspaceDependencyDirectories } from "#src/services/buildCache/readWorkspaceDependencyDirectories";
import { restoreBuildOutput, restoreGeneratedPaths } from "#src/services/buildCache/restoreBuildOutput";
import { storeBuildOutput } from "#src/services/buildCache/storeBuildOutput";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const TSDOWN_CONFIGURATION_REGEX = /^tsdown\.config\.[cm]?[jt]s$/u;

// Brings one workspace package to its key, after bringing up to date every workspace package it links, so a fresh
// Worktree's leaf builds its whole chain. A dist stamped with the key, and its barrels present, is left alone; otherwise
// A hit restores the cached output, and a miss builds it in a slot and stores it. Either way the dist ends stamped.
// A package two dependency paths reach is brought up to date once per request, its outcome kept by its directory
export const buildPackageCached = (
  packageDirectory: string,
  visiting: ReadonlySet<string> = new Set<string>(),
  directoryOutcomeMap: Map<string, BuildCacheOutcome> = new Map<string, BuildCacheOutcome>(),
  keys: Map<string, string> = new Map<string, string>(),
): BuildCacheOutcome => {
  const finishedOutcome = directoryOutcomeMap.get(packageDirectory);
  if (finishedOutcome) return finishedOutcome;
  if (visiting.has(packageDirectory))
    throw new InvalidOperationError(Operation.Create, packageDirectory, "its workspace dependencies form a cycle");

  const nextVisiting = new Set([...visiting, packageDirectory]);
  for (const dependencyDirectory of readWorkspaceDependencyDirectories(packageDirectory))
    buildPackageCached(dependencyDirectory, nextVisiting, directoryOutcomeMap, keys);

  const name = readPackageName(packageDirectory);
  if (!readdirSync(packageDirectory).some((entry) => TSDOWN_CONFIGURATION_REGEX.test(entry))) {
    console.info(`${name}: ${BuildCacheOutcome.NotBuilt}`);
    directoryOutcomeMap.set(packageDirectory, BuildCacheOutcome.NotBuilt);
    return BuildCacheOutcome.NotBuilt;
  }

  const key = computeBuildKey(packageDirectory, REPOSITORY_ROOT, keys);
  const outputDirectory = join(packageDirectory, BUILD_OUTPUT_DIRECTORY);
  const stampPath = join(outputDirectory, BUILD_STAMP_FILE);
  const keyDirectory = join(BUILD_CACHE_DIRECTORY, name, key);
  if (existsSync(stampPath) && readFileSync(stampPath, "utf8") === key) {
    restoreGeneratedPaths(packageDirectory, keyDirectory);
    console.info(`${name}: ${BuildCacheOutcome.Fresh}`);
    directoryOutcomeMap.set(packageDirectory, BuildCacheOutcome.Fresh);
    return BuildCacheOutcome.Fresh;
  }

  let outcome = BuildCacheOutcome.Miss;
  if (existsSync(join(keyDirectory, BUILD_OUTPUT_DIRECTORY)) && restoreBuildOutput(packageDirectory, keyDirectory))
    outcome = BuildCacheOutcome.Hit;
  else {
    // A stale `dist` left by an earlier commit would be stored with this build's output, so the build starts from none
    rmSync(outputDirectory, { force: true, recursive: true });
    const build = spawnSync(
      "bash",
      [join(REPOSITORY_ROOT, BUILD_CACHE_RUN_IN_SLOT_PATH), "pnpm", "exec", "tsdown", "--no-clean"],
      { cwd: packageDirectory, stdio: "inherit" },
    );
    if (build.status !== 0)
      throw new InvalidOperationError(Operation.Create, packageDirectory, `its build exited with ${build.status}`);

    storeBuildOutput(packageDirectory, keyDirectory, readGeneratedBarrelPaths(packageDirectory));
    pruneBuildCache(join(BUILD_CACHE_DIRECTORY, name));
  }

  // Stamped after the store, so the cached output stays the bare build and a restore is stamped the same way
  mkdirSync(outputDirectory, { recursive: true });
  writeFileSync(stampPath, key);
  console.info(`${name}: ${outcome}`);
  directoryOutcomeMap.set(packageDirectory, outcome);
  return outcome;
};
