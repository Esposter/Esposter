import { removeSnapshotDirectory } from "@/services/exec/snapshot/removeSnapshotDirectory";
import { spawnBackground } from "@/services/exec/util/spawnBackground";
import { WSL_REMOVE_SCRIPT, WSL_UNC_REGEX } from "@/services/exec/wsl/constants";
import { readWslPath } from "@/services/exec/wsl/readWslPath";
import { getResult, noop } from "@esposter/shared";
// Fire-and-forget teardown for stale-cache sweeps (pruneStaleSnapshots/pruneStalePrepareLayers/
// ReapAbandonedSourceMirrors) — dirs the current run never touches, so their removal has no bearing on correctness
// And must not block the command from starting. A `\\wsl.localhost` snapshot's rm -rf is the expensive case: a full
// Node_modules / .nuxt closure torn down inside WSL, and during active dev every source edit strands a superseded
// prepare layer that the next run would otherwise block on. spawnBackground runs it Linux-side off the 9p bridge,
// Outliving this process. A plain win32/Linux path stays a synchronous removeSnapshotDirectory: local fs teardown is
// Cheap, and keeping it synchronous keeps the sweep deterministic for tests and needs no extra process.
//
// The whole sweep is ONE wsl.exe launch (WSL_REMOVE_SCRIPT loops over its args), never one per dir. Each launch costs
// A service RPC and a relay process, so a sweep that fanned out per entry took down the host it was tidying: >100
// Concurrent launches wedged the WSL service, and every virrun call after it — including the one doing the sweeping —
// Hung until the distro was shut down. Batch size is bounded by the sweep's own listing, so no arg-length guard is
// Warranted: a directory whose entry names could overflow ARG_MAX would have overflowed readdir's own use long first.
//
// Best-effort per entry: a local removal that throws (a file the host still has open) must not cost the remaining
// Dirs their teardown, so each is guarded rather than the batch.
export const removeSnapshotDirectoriesDetached = (dirs: readonly string[]): void => {
  const linuxDirs: string[] = [];
  for (const dir of dirs)
    if (WSL_UNC_REGEX.test(dir)) linuxDirs.push(readWslPath(dir));
    else
      getResult(() => {
        removeSnapshotDirectory(dir);
      }).match(noop, noop);
  if (linuxDirs.length > 0) spawnBackground("wsl.exe", ["--exec", "sh", "-c", WSL_REMOVE_SCRIPT, "sh", ...linuxDirs]);
};
