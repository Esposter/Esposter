import type { CommandDef } from "citty";

import { CommandType } from "#src/models/virrun/CommandType";
import { formatCacheListing } from "#src/services/cli/cache/formatCacheListing";
import { readTierEntries } from "#src/services/cli/cache/readTierEntries";
import { formatVirrunError } from "#src/services/cli/format/formatVirrunError";
import { VIRRUN_TASKS_DIRECTORY_NAME } from "#src/services/exec/cache/constants";
import { VIRRUN_PREPARE_DIRECTORY_NAME, VIRRUN_SNAPSHOTS_DIRECTORY_NAME } from "#src/services/exec/snapshot/constants";
import { computeDirectoryByteSize } from "#src/services/exec/util/computeDirectoryByteSize";
import { VIRRUN_STORE_DIRECTORY_NAME } from "#src/services/exec/util/constants";
import { getGlobalCacheDirectory } from "#src/services/exec/util/getGlobalCacheDirectory";
import { getRepoCacheDirectory } from "#src/services/exec/util/getRepoCacheDirectory";
import { getResult } from "@esposter/shared";
import { defineCommand } from "citty";
import { existsSync } from "node:fs";
import { join } from "node:path";
// Reports the on-disk cache tiers: the repo-local dep store and the host-global snapshots, prepare layers and task
// Entries. IO lives here; rendering is the pure formatCacheListing.
export const cacheLsCommand: CommandDef = defineCommand({
  meta: {
    description: "List the repo-local dependency store and host-global warm snapshots.",
    name: CommandType.Ls,
  },
  run: () => {
    getResult(() => {
      const repoStorePath = join(getRepoCacheDirectory(""), VIRRUN_STORE_DIRECTORY_NAME);
      const globalCacheDirectory = getGlobalCacheDirectory();
      const snapshotsPath = join(globalCacheDirectory, VIRRUN_SNAPSHOTS_DIRECTORY_NAME);
      const preparePath = join(globalCacheDirectory, VIRRUN_PREPARE_DIRECTORY_NAME);
      const tasksPath = join(globalCacheDirectory, VIRRUN_TASKS_DIRECTORY_NAME);
      return formatCacheListing({
        isRepoStorePresent: existsSync(repoStorePath),
        prepareKeys: readTierEntries(preparePath),
        preparePath,
        repoStorePath,
        snapshotHashes: readTierEntries(snapshotsPath),
        snapshotsPath,
        taskBytes: computeDirectoryByteSize(tasksPath),
        taskCount: readTierEntries(tasksPath).length,
        tasksPath,
      });
    }).match(
      (listing) => process.stderr.write(`${listing}\n`),
      (error) => {
        process.stderr.write(`${formatVirrunError(error.message)}\n`);
        process.exitCode = 1;
      },
    );
  },
});
