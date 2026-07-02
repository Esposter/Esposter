import type { CommandDef } from "citty";

import { CommandType } from "@/models/virrun/CommandType";
import { formatCacheListing } from "@/services/cli/formatCacheListing";
import { VIRRUN_TASKS_DIRECTORY_NAME } from "@/services/exec/cache/constants";
import { VIRRUN_SNAPSHOTS_DIRECTORY_NAME } from "@/services/exec/snapshot/constants";
import { VIRRUN_STORE_DIRECTORY_NAME } from "@/services/exec/util/constants";
import { getGlobalCacheDirectory } from "@/services/exec/util/getGlobalCacheDirectory";
import { getRepoCacheDirectory } from "@/services/exec/util/getRepoCacheDirectory";
import { getResult, toAppError } from "@esposter/shared";
import { defineCommand } from "citty";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
// Reports the two on-disk caches: the repo-local dep store and the host-global warm-snapshot dir (one
// `<lockfile-hash>` entry per captured snapshot). IO lives here; rendering is the pure formatCacheListing.
export const cacheLsCommand: CommandDef = defineCommand({
  meta: {
    description: "List the repo-local dependency store and host-global warm snapshots.",
    name: CommandType.Ls,
  },
  run: () => {
    getResult(() => {
      const repoStorePath = join(getRepoCacheDirectory(""), VIRRUN_STORE_DIRECTORY_NAME);
      const snapshotsPath = join(getGlobalCacheDirectory(), VIRRUN_SNAPSHOTS_DIRECTORY_NAME);
      const snapshotHashes = existsSync(snapshotsPath) ? readdirSync(snapshotsPath).toSorted() : [];
      const tasksPath = join(getGlobalCacheDirectory(), VIRRUN_TASKS_DIRECTORY_NAME);
      return formatCacheListing({
        isRepoStorePresent: existsSync(repoStorePath),
        repoStorePath,
        snapshotHashes,
        snapshotsPath,
        taskCount: existsSync(tasksPath) ? readdirSync(tasksPath).length : 0,
        tasksPath,
      });
    }).match(
      (listing) => process.stderr.write(`${listing}\n`),
      (error) => {
        process.stderr.write(`${toAppError(error).message}\n`);
        process.exitCode = 1;
      },
    );
  },
});
