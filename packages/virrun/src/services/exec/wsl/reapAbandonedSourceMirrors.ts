import { sweepStaleEntries } from "#src/services/exec/snapshot/sweepStaleEntries";
import { SOURCE_MIRROR_UNMARKED_MAX_AGE_MS } from "#src/services/exec/util/constants";
import { VIRRUN_SOURCE_MIRROR_ORIGIN_FILENAME, VIRRUN_SOURCES_DIRECTORY_NAME } from "#src/services/exec/wsl/constants";
import { getWslNativeCacheRoot } from "#src/services/exec/wsl/getWslNativeCacheRoot";
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
// CreateWslSourceMirrorSync publishes the marker the instant it creates the entry dir AND republishes it from any
// Later planning pass that finds it missing — including the no-delta early return a live repo takes on nearly every
// Run — so an absent marker means no planning pass has completed for this entry since it died. Age settles it: past
// SOURCE_MIRROR_UNMARKED_MAX_AGE_MS no live planner can still be in that gap. That republish is what this arm rests
// On; without it a single swallowed marker rename would age a live repo's mirror into this sweep.
//
// Which is why the caller runs this AFTER planning its own sync, and hands in that run's entry key: the republish the
// Age arm rests on has then already happened for this repo, and the one entry no evidence can be allowed to condemn
// — the one whose tree bwrap is about to mount as its `--overlay-src` lower — is excluded outright rather than
// Argued about. A detached `rm -rf` takes no lock, so nothing downstream can serialize it against a live reader.
// Best-effort and off the critical path (via sweepStaleEntries → removeSnapshotDirectoriesDetached), so a WSL/probe
// Failure resolving the cache root aborts the sweep, not the run. Win32-only — mirrors exist only there.
export const reapAbandonedSourceMirrors = (liveEntryName: string): void => {
  getResult(() => {
    const sourcesDir = join(getWslNativeCacheRoot(), VIRRUN_SOURCES_DIRECTORY_NAME);
    sweepStaleEntries(sourcesDir, (name) => {
      if (name === liveEntryName) return false;

      const entryPath = join(sourcesDir, name);
      const originPath = join(entryPath, VIRRUN_SOURCE_MIRROR_ORIGIN_FILENAME);
      // A marker that exists settles the entry on its own, whatever it says: a path that is gone means abandoned, a
      // Path that is there means live, and a marker we cannot read or that is still blank (a first-run partial
      // Another process is mid-writing) proves nothing either way, so the entry is left for a later sweep. Only the
      // Age fallback below may reclaim it, and only when there is no marker at all — collapsing an unreadable
      // Marker into that case is how a live run's mirror gets deleted out from under it
      if (existsSync(originPath)) {
        const origin = getResult(() => readFileSync(originPath, "utf8"))
          .unwrapOr("")
          .trim();
        return origin ? !existsSync(origin) : false;
      }
      return getResult(() => statSync(entryPath).mtimeMs)
        .map((mtimeMs) => Date.now() - mtimeMs > SOURCE_MIRROR_UNMARKED_MAX_AGE_MS)
        .unwrapOr(false);
    });
  }).match(noop, noop);
};
