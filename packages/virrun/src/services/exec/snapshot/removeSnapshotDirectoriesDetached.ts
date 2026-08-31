import { writeVirrunDebug } from "#src/services/cli/debug/writeVirrunDebug";
import { removeSnapshotDirectory } from "#src/services/exec/snapshot/removeSnapshotDirectory";
import { spawnBackground } from "#src/services/exec/util/spawnBackground";
import { VIRRUN_REMOVE_LIST_TEMP_PREFIX, WSL_REMOVE_LIST_SCRIPT, WSL_UNC_REGEX } from "#src/services/exec/wsl/constants";
import { getWslNativeCacheRoot } from "#src/services/exec/wsl/getWslNativeCacheRoot";
import { joinNullDelimited } from "#src/services/exec/wsl/joinNullDelimited";
import { readWslPath } from "#src/services/exec/wsl/readWslPath";
import { reapStaleRemoveLists } from "#src/services/exec/wsl/reapStaleRemoveLists";
import { getResult, noop } from "@esposter/shared";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
// Fire-and-forget teardown for stale-cache sweeps (pruneStaleSnapshots/pruneStalePrepareLayers/
// ReapAbandonedSourceMirrors) — dirs the current run never touches, so their removal has no bearing on correctness
// And must not block the command from starting. A `\\wsl.localhost` snapshot's rm -rf is the expensive case: a full
// Node_modules / .nuxt closure torn down inside WSL, and during active dev every source edit strands a superseded
// Prepare layer that the next run would otherwise block on. spawnBackground runs it Linux-side off the 9p bridge,
// Outliving this process. A plain win32/Linux path stays a synchronous removeSnapshotDirectory: local fs teardown is
// Cheap, and keeping it synchronous keeps the sweep deterministic for tests and needs no extra process.
//
// However many dirs a sweep finds, it is ONE wsl.exe launch: the paths go into a null-delimited list file the
// Script reads through `xargs -0`, never into the argv. Each launch costs a service RPC and a relay process, so a
// Sweep that fanned out took down the host it was tidying — >100 concurrent launches wedged the WSL service, and
// Every virrun call after it (including the one sweeping) hung until the distro was shut down. Nothing bounds how
// Many entries a sweep finds (a test suite running virrun in temp dirs strands hundreds), so the two ways to lose
// That property are both closed here rather than traded against each other: passing the paths as arguments has a
// Cliff at the win32 32767-char command line, where the spawn fails asynchronously — discarded by spawnBackground's
// Error handler — and the whole teardown silently does nothing on every run thereafter; batching the argv instead
// Trades that for one launch per batch, which is the fan-out again. The list file has neither, and xargs's own
// ARG_MAX splitting runs its `sh` invocations sequentially. The script unlinks the list as its last act; a list
// Left behind by a launch that never ran is reclaimed by the next sweep's reapStaleRemoveLists.
//
// Best-effort throughout: a local removal that throws (a file the host still has open) must not cost the remaining
// Dirs their teardown, so each is guarded rather than the batch, and the staging + launch is guarded as a whole —
// The sweep runs off the critical path for dirs this run never touches, so its failure must never fail the user's
// Command. A sweep that stages nothing simply happens again next run.
export const removeSnapshotDirectoriesDetached = (dirs: readonly string[]): void => {
  const linuxDirs: string[] = [];
  for (const dir of dirs)
    if (WSL_UNC_REGEX.test(dir)) linuxDirs.push(readWslPath(dir));
    else
      getResult(() => {
        removeSnapshotDirectory(dir);
      }).match(noop, ({ message }) => {
        writeVirrunDebug(`stale cache dir ${dir} not removed — ${message}`);
      });
  if (linuxDirs.length === 0) return;

  getResult(() => {
    const cacheRoot = getWslNativeCacheRoot();
    // Reclaim the lists of runs whose launch never happened before staging this one — this is the only path that
    // Enumerates the cache root, so a list left there has no other owner (reapStaleRemoveLists)
    reapStaleRemoveLists(cacheRoot);
    const listFilename = `${VIRRUN_REMOVE_LIST_TEMP_PREFIX}${process.pid}.${crypto.randomUUID()}`;
    const listUnc = join(cacheRoot, listFilename);
    writeFileSync(listUnc, joinNullDelimited(linuxDirs));
    spawnBackground("wsl.exe", ["--exec", "sh", "-c", WSL_REMOVE_LIST_SCRIPT, "sh", readWslPath(listUnc)]);
  }).match(noop, ({ message }) => {
    writeVirrunDebug(`detached teardown of ${linuxDirs.length} dirs not staged — ${message}`);
  });
};
