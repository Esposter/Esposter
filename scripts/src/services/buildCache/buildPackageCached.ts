import { BuildCacheOutcome } from "#src/models/buildCache/BuildCacheOutcome";
import { computeBuildKey } from "#src/services/buildCache/computeBuildKey";
import {
  BUILD_CACHE_DIRECTORY,
  BUILD_CACHE_RUN_IN_SLOT_PATH,
  BUILD_CACHE_TEMPORARY_PREFIX,
  BUILD_OUTPUT_DIRECTORY,
  BUILD_STAMP_FILE,
} from "#src/services/buildCache/constants";
import { pruneBuildCache } from "#src/services/buildCache/pruneBuildCache";
import { readPackageName } from "#src/services/buildCache/readPackageName";
import { readWorkspaceDependencyDirectories } from "#src/services/buildCache/readWorkspaceDependencyDirectories";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { getResult, InvalidOperationError, Operation } from "@esposter/shared";
import { spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  utimesSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";

// Brings one workspace package to its key, after bringing up to date every workspace package it links, so a fresh
// Worktree's leaf builds its whole chain. A dist whose stamp already names the key is left alone; otherwise a hit
// Restores the cached output, and a miss builds it in a slot and stores it. Either way the dist ends stamped.
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
  const key = computeBuildKey(packageDirectory, REPOSITORY_ROOT, keys);
  const outputDirectory = join(packageDirectory, BUILD_OUTPUT_DIRECTORY);
  const stampPath = join(outputDirectory, BUILD_STAMP_FILE);
  if (existsSync(stampPath) && readFileSync(stampPath, "utf8") === key) {
    console.info(`${name}: ${BuildCacheOutcome.Fresh}`);
    directoryOutcomeMap.set(packageDirectory, BuildCacheOutcome.Fresh);
    return BuildCacheOutcome.Fresh;
  }

  const packageCacheDirectory = join(BUILD_CACHE_DIRECTORY, name);
  const keyDirectory = join(packageCacheDirectory, key);

  // A hit is copied into the package's own ignored `node_modules`, on the output's disk, and renamed into place, so a key
  // Another worktree's prune removes under the copy leaves the current `dist` standing and falls through to a build. Each
  // Copy, and each store below, starts in a folder made empty for it, so a copy an interrupted run left never joins it
  let outcome = BuildCacheOutcome.Miss;
  if (existsSync(keyDirectory)) {
    const stagingParentDirectory = join(packageDirectory, "node_modules");
    mkdirSync(stagingParentDirectory, { recursive: true });
    const stagingDirectory = mkdtempSync(
      join(stagingParentDirectory, `${BUILD_CACHE_TEMPORARY_PREFIX}${BUILD_OUTPUT_DIRECTORY}-`),
    );
    const now = new Date();
    const isRestored = getResult(() => {
      utimesSync(keyDirectory, now, now);
      cpSync(keyDirectory, stagingDirectory, { recursive: true });
    }).match(
      () => true,
      (error) => {
        console.warn(`The cached build ${keyDirectory} could not be restored, so it is built: ${error.message}`);
        return false;
      },
    );
    if (isRestored) {
      rmSync(outputDirectory, { force: true, recursive: true });
      renameSync(stagingDirectory, outputDirectory);
      outcome = BuildCacheOutcome.Hit;
    } else rmSync(stagingDirectory, { force: true, recursive: true });
  }

  if (outcome === BuildCacheOutcome.Miss) {
    // A stale `dist` left by an earlier commit would be stored with this build's output, so the build starts from none
    rmSync(outputDirectory, { force: true, recursive: true });
    const build = spawnSync(
      "bash",
      [join(REPOSITORY_ROOT, BUILD_CACHE_RUN_IN_SLOT_PATH), "pnpm", "exec", "tsdown", "--no-clean"],
      { cwd: packageDirectory, stdio: "inherit" },
    );
    if (build.status !== 0)
      throw new InvalidOperationError(Operation.Create, packageDirectory, `its build exited with ${build.status}`);

    // The store is written beside its key and renamed into place, so a reader never sees a half-copied key
    mkdirSync(packageCacheDirectory, { recursive: true });
    const temporaryDirectory = mkdtempSync(join(packageCacheDirectory, `${BUILD_CACHE_TEMPORARY_PREFIX}${key}-`));
    cpSync(outputDirectory, temporaryDirectory, { recursive: true });
    if (existsSync(keyDirectory)) rmSync(temporaryDirectory, { force: true, recursive: true });
    else renameSync(temporaryDirectory, keyDirectory);
    pruneBuildCache(packageCacheDirectory);
  }

  // Stamped after the store, so the cached output stays the bare build and a restore is stamped the same way
  writeFileSync(stampPath, key);
  console.info(`${name}: ${outcome}`);
  directoryOutcomeMap.set(packageDirectory, outcome);
  return outcome;
};
