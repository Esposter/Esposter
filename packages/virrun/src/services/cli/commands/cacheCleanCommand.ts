import type { CleanArgs } from "@/models/cli/CleanArgs";
import type { ArgsDef, CommandDef } from "citty";

import { Color } from "@/models/cli/Color";
import { CommandType } from "@/models/virrun/CommandType";
import { colorize } from "@/services/cli/color/colorize";
import { formatVirrunLine } from "@/services/cli/format/formatVirrunLine";
import { VIRRUN_TASKS_DIRECTORY_NAME } from "@/services/exec/cache/constants";
import { VIRRUN_SNAPSHOTS_DIRECTORY_NAME } from "@/services/exec/snapshot/constants";
import { removeSnapshotDirectory } from "@/services/exec/snapshot/removeSnapshotDirectory";
import { getGlobalCacheDirectory } from "@/services/exec/util/getGlobalCacheDirectory";
import { getRepoCacheDirectory } from "@/services/exec/util/getRepoCacheDirectory";
import { VIRRUN_SOURCES_DIRECTORY_NAME } from "@/services/exec/wsl/constants";
import { getResult, toAppError } from "@esposter/shared";
import { defineCommand } from "citty";
import { join } from "node:path";

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
      process.stderr.write(`${formatVirrunLine(`removed ${colorize(repoCacheDirectory, Color.Red)}`)}\n`);
      if (args.all) {
        const snapshotsPath = join(getGlobalCacheDirectory(), VIRRUN_SNAPSHOTS_DIRECTORY_NAME);
        removeSnapshotDirectory(snapshotsPath);
        process.stderr.write(`${formatVirrunLine(`removed ${colorize(snapshotsPath, Color.Red)}`)}\n`);
        const tasksPath = join(getGlobalCacheDirectory(), VIRRUN_TASKS_DIRECTORY_NAME);
        removeSnapshotDirectory(tasksPath);
        process.stderr.write(`${formatVirrunLine(`removed ${colorize(tasksPath, Color.Red)}`)}\n`);
        // The win32 ext4 source mirrors (absent off win32, so a harmless no-op there).
        const sourcesPath = join(getGlobalCacheDirectory(), VIRRUN_SOURCES_DIRECTORY_NAME);
        removeSnapshotDirectory(sourcesPath);
        process.stderr.write(`${formatVirrunLine(`removed ${colorize(sourcesPath, Color.Red)}`)}\n`);
      }
    }).match(
      () => undefined,
      (error) => {
        process.stderr.write(`${formatVirrunLine(colorize(toAppError(error).message, Color.Red))}\n`);
        process.exitCode = 1;
      },
    );
  },
});
