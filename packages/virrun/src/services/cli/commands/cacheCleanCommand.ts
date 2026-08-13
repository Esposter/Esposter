import type { CleanArgs } from "@/models/cli/CleanArgs";
import type { ArgsDef, CommandDef } from "citty";

import { Color } from "@/models/cli/Color";
import { CommandType } from "@/models/virrun/CommandType";
import { colorize } from "@/services/cli/color/colorize";
import { formatVirrunError } from "@/services/cli/format/formatVirrunError";
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
import { getResult, noop } from "@esposter/shared";
import { defineCommand } from "citty";
import { rmSync } from "node:fs";
import { join } from "node:path";
// Each removal is announced as it lands, the path reddened — destruction outranks the palette's plain path=Blue rule.
const writeRemoved = (path: string): void => {
  process.stderr.write(`${formatVirrunLine(`removed ${colorize(path, Color.Red)}`)}\n`);
};
// Every cache root is torn down identically — unbounded (CACHE_CLEAN_TIMEOUT_MS), because a clean is explicit and must
// Run to completion rather than be SIGTERM'd into a half-swept cache — so the roots below read as a list of what is
// Removed rather than as a repeated remove-then-report pair.
const removeCacheDirectory = (path: string): void => {
  removeSnapshotDirectory(path, CACHE_CLEAN_TIMEOUT_MS);
  writeRemoved(path);
};

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
      removeCacheDirectory(getRepoCacheDirectory(""));
      if (!args.all) return;
      for (const directoryName of [
        VIRRUN_SNAPSHOTS_DIRECTORY_NAME,
        VIRRUN_PREPARE_DIRECTORY_NAME,
        VIRRUN_TASKS_DIRECTORY_NAME,
      ])
        removeCacheDirectory(join(getGlobalCacheDirectory(), directoryName));
      // The persisted host probe caches survive a snapshot sweep, so clear them here too: they are keyed on platform
      // + kernel release, which cannot see a toolchain change, and a stale login capture is exactly what pins the
      // Sandbox to an old node. Each costs one re-probe on the next run. The bwrap capability verdict is
      // Host-global (on win32 that is the WSL-native root); the WSL probes are Windows-side by construction
      // (readWslEnvironmentCache), so the two roots are swept separately rather than assumed equal. A plain unlink,
      // Not removeCacheDirectory: these are single small files, so routing a WSL-rooted one through a wsl.exe spawn
      // Would buy nothing the 9p bridge cannot already do.
      for (const probeCachePath of [
        join(getGlobalCacheDirectory(), CAPABILITY_CACHE_FILENAME),
        join(getLocalCacheDirectory(), WSL_LOGIN_ENVIRONMENT_CACHE_FILENAME),
        join(getLocalCacheDirectory(), WSL_CACHE_ROOT_CACHE_FILENAME),
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
