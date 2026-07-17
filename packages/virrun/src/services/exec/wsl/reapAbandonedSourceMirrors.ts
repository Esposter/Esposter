import { sweepStaleEntries } from "@/services/exec/snapshot/sweepStaleEntries";
import { VIRRUN_SOURCE_MIRROR_ORIGIN_FILENAME, VIRRUN_SOURCES_DIRECTORY_NAME } from "@/services/exec/wsl/constants";
import { getWslNativeCacheRoot } from "@/services/exec/wsl/getWslNativeCacheRoot";
import { getResult, noop } from "@esposter/shared";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
// Reclaim source mirrors whose host working dir is gone (deleted worktree, moved repo). Unlike snapshots/prepare —
// Keyed on a lockfile/source hash where every entry but the current one is stale — each mirror is keyed on a distinct
// Live repo path, so "stale" is decided per entry by the recorded `origin` marker: the entry is swept only when the
// Path it holds is provably absent (existsSync false). A missing or blank marker (predates the write, or a first-run
// Partial another process is mid-writing) is left alone — reap only what we can prove abandoned, never a concurrent
// Live run's mirror. Best-effort and off the critical path (via sweepStaleEntries → removeSnapshotDirectoryDetached),
// So a WSL/probe failure resolving the cache root aborts the sweep, not the run. Win32-only — mirrors exist only there.
export const reapAbandonedSourceMirrors = (): void => {
  getResult(() => {
    const sourcesDir = join(getWslNativeCacheRoot(), VIRRUN_SOURCES_DIRECTORY_NAME);
    sweepStaleEntries(sourcesDir, (name) => {
      const origin = getResult(() => readFileSync(join(sourcesDir, name, VIRRUN_SOURCE_MIRROR_ORIGIN_FILENAME), "utf8"))
        .unwrapOr("")
        .trim();
      return Boolean(origin) && !existsSync(origin);
    });
  }).match(noop, noop);
};
