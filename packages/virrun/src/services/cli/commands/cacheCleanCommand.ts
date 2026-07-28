import type { CleanArgs } from "@/models/cli/CleanArgs";
import type { ArgsDef, CommandDef } from "citty";

import { Color } from "@/models/cli/Color";
import { CommandType } from "@/models/virrun/CommandType";
import { colorize } from "@/services/cli/color/colorize";
import { formatVirrunLine } from "@/services/cli/format/formatVirrunLine";
import { VIRRUN_TASKS_DIRECTORY_NAME } from "@/services/exec/cache/constants";
import { VIRRUN_PREPARE_DIRECTORY_NAME, VIRRUN_SNAPSHOTS_DIRECTORY_NAME } from "@/services/exec/snapshot/constants";
import { removeSnapshotDirectory } from "@/services/exec/snapshot/removeSnapshotDirectory";
import {
  CACHE_CLEAN_TIMEOUT_MS,
  CAPABILITY_CACHE_FILENAME,
  WSL_CACHE_ROOT_CACHE_FILENAME,
  WSL_LOGIN_ENVIRONMENT_CACHE_FILENAME,
} from "@/services/exec/util/constants";
import { getGlobalCacheDirectory } from "@/services/exec/util/getGlobalCacheDirectory";
import { getLocalCacheDirectory } from "@/services/exec/util/getLocalCacheDirectory";
import { getRepoCacheDirectory } from "@/services/exec/util/getRepoCacheDirectory";
import { VIRRUN_SOURCES_DIRECTORY_NAME } from "@/services/exec/wsl/constants";
import { getWslNativeCacheRoot } from "@/services/exec/wsl/getWslNativeCacheRoot";
import { getResult, noop, toAppError } from "@esposter/shared";
import { defineCommand } from "citty";
import { rmSync } from "node:fs";
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
      removeSnapshotDirectory(repoCacheDirectory, CACHE_CLEAN_TIMEOUT_MS);
      process.stderr.write(`${formatVirrunLine(`removed ${colorize(repoCacheDirectory, Color.Red)}`)}\n`);
      if (args.all) {
        const snapshotsPath = join(getGlobalCacheDirectory(), VIRRUN_SNAPSHOTS_DIRECTORY_NAME);
        removeSnapshotDirectory(snapshotsPath, CACHE_CLEAN_TIMEOUT_MS);
        process.stderr.write(`${formatVirrunLine(`removed ${colorize(snapshotsPath, Color.Red)}`)}\n`);
        const preparePath = join(getGlobalCacheDirectory(), VIRRUN_PREPARE_DIRECTORY_NAME);
        removeSnapshotDirectory(preparePath, CACHE_CLEAN_TIMEOUT_MS);
        process.stderr.write(`${formatVirrunLine(`removed ${colorize(preparePath, Color.Red)}`)}\n`);
        const tasksPath = join(getGlobalCacheDirectory(), VIRRUN_TASKS_DIRECTORY_NAME);
        removeSnapshotDirectory(tasksPath, CACHE_CLEAN_TIMEOUT_MS);
        process.stderr.write(`${formatVirrunLine(`removed ${colorize(tasksPath, Color.Red)}`)}\n`);
        // The persisted host probe caches survive a snapshot sweep, so clear them here too: they are keyed on platform
        // + kernel release, which cannot see a toolchain change, and a stale login capture is exactly what pins the
        // Sandbox to an old node. Each costs one re-probe on the next run. The bwrap capability verdict is
        // Host-global (on win32 that is the WSL-native root); the WSL probes are Windows-side by construction
        // (readWslEnvironmentCache), so the two roots are swept separately rather than assumed equal.
        for (const probeCachePath of [
          join(getGlobalCacheDirectory(), CAPABILITY_CACHE_FILENAME),
          join(getLocalCacheDirectory(), WSL_LOGIN_ENVIRONMENT_CACHE_FILENAME),
          join(getLocalCacheDirectory(), WSL_CACHE_ROOT_CACHE_FILENAME),
        ]) {
          rmSync(probeCachePath, { force: true });
          process.stderr.write(`${formatVirrunLine(`removed ${colorize(probeCachePath, Color.Red)}`)}\n`);
        }
        // The win32 ext4 source mirrors live under the WSL-native cache root (createWslSourceMirrorSync ignores the
        // VIRRUN_CACHE_HOME override to stay on ext4), so clean from there — not getGlobalCacheDirectory. Absent off
        // Win32, where the source is read in place and never mirrored.
        if (process.platform === "win32") {
          const sourcesPath = join(getWslNativeCacheRoot(), VIRRUN_SOURCES_DIRECTORY_NAME);
          removeSnapshotDirectory(sourcesPath, CACHE_CLEAN_TIMEOUT_MS);
          process.stderr.write(`${formatVirrunLine(`removed ${colorize(sourcesPath, Color.Red)}`)}\n`);
        }
      }
    }).match(noop, (error) => {
      process.stderr.write(`${formatVirrunLine(colorize(toAppError(error).message, Color.Red))}\n`);
      process.exitCode = 1;
    });
  },
});
