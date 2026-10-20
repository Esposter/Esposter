import type { SpawnSyncReturns } from "node:child_process";

import { NUXT_MODULE_ENTRY_PATH } from "#src/services/package/new/constants";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { spawnSync } from "@esposter/shared-node/child-process";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

// Loads one Nuxt module entry under plain node from its package directory, the way Nuxt reads it, and returns the process result
export const spawnNuxtModuleEntryLoad = (packagePath: string): SpawnSyncReturns<string> => {
  const packageDirectory = resolve(REPOSITORY_ROOT, packagePath);
  const moduleEntryUrl = pathToFileURL(resolve(packageDirectory, NUXT_MODULE_ENTRY_PATH)).href;

  return spawnSync(process.execPath, ["--input-type=module", "-e", `await import(${JSON.stringify(moduleEntryUrl)})`], {
    cwd: packageDirectory,
    encoding: "utf8",
  });
};
