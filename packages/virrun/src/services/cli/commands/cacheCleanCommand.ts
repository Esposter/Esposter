import type { CleanArgs } from "#src/models/cli/CleanArgs";
import type { ArgsDef, CommandDef } from "citty";

import { CommandType } from "#src/models/virrun/CommandType";
import { removeCacheDirectory } from "#src/services/cli/cache/removeCacheDirectory";
import { writeRemoved } from "#src/services/cli/cache/writeRemoved";
import { formatVirrunError } from "#src/services/cli/format/formatVirrunError";
import { VIRRUN_TASKS_DIRECTORY_NAME } from "#src/services/exec/cache/constants";
import { VIRRUN_PREPARE_DIRECTORY_NAME, VIRRUN_SNAPSHOTS_DIRECTORY_NAME } from "#src/services/exec/snapshot/constants";
import {
  CAPABILITY_CACHE_FILENAME,
  WSL_CACHE_ROOT_CACHE_FILENAME,
  WSL_LOGIN_ENVIRONMENT_CACHE_FILENAME,
} from "#src/services/exec/util/constants";
import { getGlobalCacheDirectory } from "#src/services/exec/util/getGlobalCacheDirectory";
import { getLocalCacheDirectory } from "#src/services/exec/util/getLocalCacheDirectory";
import { getRepoCacheDirectory } from "#src/services/exec/util/getRepoCacheDirectory";
import { VIRRUN_SOURCES_DIRECTORY_NAME } from "#src/services/exec/wsl/constants";
import { getWslNativeCacheRoot } from "#src/services/exec/wsl/getWslNativeCacheRoot";
import { reapOrphanedWslRuns } from "#src/services/exec/wsl/reapOrphanedWslRuns";
import { getResult, noop } from "@esposter/shared";
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
      // Corpses first, on win32: a hard-killed run's surviving WSL tree holds the store and snapshot directories open, so a
      // Clean that ran ahead of the sweep would be asked to remove exactly what something still has mounted. Blocking,
      // Unlike the startup sweep: TERM only asks, so a fire-and-forget reap returns while the tree is still unwinding
      // And hands the removals below the very race the sweep is here to close. The sweep is keyed on owner liveness,
      // Which is also why the run registry is swept rather than deleted outright — a live run's entry is the only
      // Record of a tree that is still to be reaped if that run is killed later, and a clean that dropped it would
      // Strand the tree with nothing left to find it by.
      if (process.platform === "win32") reapOrphanedWslRuns(true);
      removeCacheDirectory(getRepoCacheDirectory(""));
      if (!args.all) return;
      const globalCacheDirectory = getGlobalCacheDirectory();
      const localCacheDirectory = getLocalCacheDirectory();
      for (const directoryName of [
        VIRRUN_SNAPSHOTS_DIRECTORY_NAME,
        VIRRUN_PREPARE_DIRECTORY_NAME,
        VIRRUN_TASKS_DIRECTORY_NAME,
      ])
        removeCacheDirectory(join(globalCacheDirectory, directoryName));
      // The persisted host probe caches survive a snapshot sweep, so clear them here too: they are keyed on platform
      // + kernel release, which cannot see a toolchain change, and a stale login capture is exactly what pins the
      // Sandbox to an old node. Each costs one re-probe on the next run. The bwrap capability verdict is
      // Host-global (on win32 that is the WSL-native root); the WSL probes are Windows-side by construction
      // (readWslEnvironmentCache), so the two roots are swept separately rather than assumed equal. A plain unlink,
      // Not removeCacheDirectory: these are single small files, so routing a WSL-rooted one through a wsl.exe spawn
      // Would buy nothing the 9p bridge cannot already do.
      for (const probeCachePath of [
        join(globalCacheDirectory, CAPABILITY_CACHE_FILENAME),
        join(localCacheDirectory, WSL_LOGIN_ENVIRONMENT_CACHE_FILENAME),
        join(localCacheDirectory, WSL_CACHE_ROOT_CACHE_FILENAME),
      ]) {
        rmSync(probeCachePath, { force: true });
        writeRemoved(probeCachePath);
      }
      // The win32 ext4 source mirrors live under the WSL-native cache root (createWslSourceMirrorSync ignores the
      // VIRRUN_CACHE_HOME override to stay on ext4), so clean from there — not getGlobalCacheDirectory. Absent off
      // Win32, where the source is read in place and never mirrored.
      if (process.platform === "win32")
        removeCacheDirectory(join(getWslNativeCacheRoot(), VIRRUN_SOURCES_DIRECTORY_NAME));
    }).match(noop, (error) => {
      process.stderr.write(`${formatVirrunError(error.message)}\n`);
      process.exitCode = 1;
    });
  },
});
