import { sweepStaleEntries } from "@/services/exec/snapshot/sweepStaleEntries";
import { SOURCE_MIRROR_UNMARKED_MAX_AGE_MS } from "@/services/exec/util/constants";
import { VIRRUN_SOURCE_MIRROR_ORIGIN_FILENAME, VIRRUN_SOURCES_DIRECTORY_NAME } from "@/services/exec/wsl/constants";
import { getWslNativeCacheRoot } from "@/services/exec/wsl/getWslNativeCacheRoot";
import { getResult, noop } from "@esposter/shared";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
// Reclaim source mirrors whose host working dir is gone (deleted worktree, moved repo). Unlike snapshots/prepare —
// Keyed on a lockfile/source hash where every entry but the current one is stale — each mirror is keyed on a distinct
// Live repo path, so "stale" is decided per entry by the recorded `origin` marker: the entry is swept only when the
// Path it holds is provably absent (existsSync false). A blank marker (a first-run partial another process is
// Mid-writing) is left alone — reap only what we can prove abandoned, never a concurrent live run's mirror.
//
// An entry with NO marker is the one case the marker can't settle, and treating it as untouchable leaked forever:
// CreateWslSourceMirrorSync publishes the marker the instant it creates the entry dir, so its absence means the sync
// Died inside that same instant, and the corpse is then unattributable for the life of the machine. Age settles it —
// Past SOURCE_MIRROR_UNMARKED_MAX_AGE_MS no live planner can still be in that gap. Best-effort and off the critical
// Path (via sweepStaleEntries → removeSnapshotDirectoriesDetached), so a WSL/probe failure resolving the cache root
// Aborts the sweep, not the run. Win32-only — mirrors exist only there.
export const reapAbandonedSourceMirrors = (): void => {
  getResult(() => {
    const sourcesDir = join(getWslNativeCacheRoot(), VIRRUN_SOURCES_DIRECTORY_NAME);
    sweepStaleEntries(sourcesDir, (name) => {
      const entryPath = join(sourcesDir, name);
      const origin = getResult(() => readFileSync(join(entryPath, VIRRUN_SOURCE_MIRROR_ORIGIN_FILENAME), "utf8"))
        .unwrapOr("")
        .trim();
      if (origin) return !existsSync(origin);
      return getResult(() => statSync(entryPath).mtimeMs)
        .map((mtimeMs) => Date.now() - mtimeMs > SOURCE_MIRROR_UNMARKED_MAX_AGE_MS)
        .unwrapOr(false);
    });
  }).match(noop, noop);
};
