import type { CleanArgs } from "@/models/cli/CleanArgs";
import type { ArgsDef, CommandDef } from "citty";

import { CommandType } from "@/models/virrun/CommandType";
import { VIRRUN_TASKS_DIRECTORY_NAME } from "@/services/exec/cache/constants";
import { VIRRUN_SNAPSHOTS_DIRECTORY_NAME } from "@/services/exec/snapshot/constants";
import { removeSnapshotDirectory } from "@/services/exec/snapshot/removeSnapshotDirectory";
import { getGlobalCacheDirectory } from "@/services/exec/util/getGlobalCacheDirectory";
import { getRepoCacheDirectory } from "@/services/exec/util/getRepoCacheDirectory";
import { getResult, toAppError } from "@esposter/shared";
import { defineCommand } from "citty";
import { join } from "node:path";
import process from "node:process";

const cleanArgs: CleanArgs = {
  all: {
    default: false,
    description: "Also remove the host-global ~/.virrun/snapshots and task cache.",
    type: "boolean",
  },
} satisfies ArgsDef;
// `--all` also clears the host-global snapshots and task cache, shared across repos, so it is opt-in.
export const cacheCleanCommand: CommandDef<CleanArgs> = defineCommand({
  args: cleanArgs,
  meta: {
    description: "Remove the repo-local .virrun cache; --all also clears host-global warm snapshots.",
    name: CommandType.Clean,
  },
  run: ({ args }) => {
    getResult(() => {
      const repoCacheDirectory = getRepoCacheDirectory("");
      removeSnapshotDirectory(repoCacheDirectory);
      process.stderr.write(`[virrun] removed ${repoCacheDirectory}\n`);
      if (args.all) {
        const snapshotsPath = join(getGlobalCacheDirectory(), VIRRUN_SNAPSHOTS_DIRECTORY_NAME);
        removeSnapshotDirectory(snapshotsPath);
        process.stderr.write(`[virrun] removed ${snapshotsPath}\n`);
        const tasksPath = join(getGlobalCacheDirectory(), VIRRUN_TASKS_DIRECTORY_NAME);
        removeSnapshotDirectory(tasksPath);
        process.stderr.write(`[virrun] removed ${tasksPath}\n`);
      }
    }).match(
      () => undefined,
      (error) => {
        process.stderr.write(`${toAppError(error).message}\n`);
        process.exitCode = 1;
      },
    );
  },
});
