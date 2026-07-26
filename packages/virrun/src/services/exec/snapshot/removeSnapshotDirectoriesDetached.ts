import { removeSnapshotDirectory } from "@/services/exec/snapshot/removeSnapshotDirectory";
import { spawnBackground } from "@/services/exec/util/spawnBackground";
import { WSL_REMOVE_ARGV_MAX_LENGTH, WSL_REMOVE_SCRIPT, WSL_UNC_REGEX } from "@/services/exec/wsl/constants";
import { readWslPath } from "@/services/exec/wsl/readWslPath";
import { getResult, noop } from "@esposter/shared";
// Fire-and-forget teardown for stale-cache sweeps (pruneStaleSnapshots/pruneStalePrepareLayers/
// ReapAbandonedSourceMirrors) — dirs the current run never touches, so their removal has no bearing on correctness
// And must not block the command from starting. A `\\wsl.localhost` snapshot's rm -rf is the expensive case: a full
// Node_modules / .nuxt closure torn down inside WSL, and during active dev every source edit strands a superseded
// Prepare layer that the next run would otherwise block on. spawnBackground runs it Linux-side off the 9p bridge,
// Outliving this process. A plain win32/Linux path stays a synchronous removeSnapshotDirectory: local fs teardown is
// Cheap, and keeping it synchronous keeps the sweep deterministic for tests and needs no extra process.
//
// The sweep is ONE wsl.exe launch per argv-sized batch (WSL_REMOVE_SCRIPT loops over its args), never one per dir.
// Each launch costs a service RPC and a relay process, so a sweep that fanned out per entry took down the host it was
// Tidying: >100 concurrent launches wedged the WSL service, and every virrun call after it — including the one doing
// The sweeping — hung until the distro was shut down. Batching by WSL_REMOVE_ARGV_MAX_LENGTH is what keeps that win
// Without trading it for a cliff: nothing bounds how many entries a sweep finds (a test suite running virrun in temp
// Dirs strands hundreds), and one over-long argv fails the spawn asynchronously — discarded by spawnBackground's own
// Error handler — so the entire teardown would silently do nothing, deterministically, on every run after it.
//
// Best-effort per entry: a local removal that throws (a file the host still has open) must not cost the remaining
// Dirs their teardown, so each is guarded rather than the batch. Each batched launch is guarded too — spawnBackground
// Deliberately lets a synchronous spawn throw (EAGAIN/EMFILE) reach its caller, and here that caller is pure cache
// Hygiene: the sweep runs off the critical path for dirs this run never touches, so its failure must never fail the
// User's command.
export const removeSnapshotDirectoriesDetached = (dirs: readonly string[]): void => {
  const linuxDirs: string[] = [];
  for (const dir of dirs)
    if (WSL_UNC_REGEX.test(dir)) linuxDirs.push(readWslPath(dir));
    else
      getResult(() => {
        removeSnapshotDirectory(dir);
      }).match(noop, noop);
  let batch: string[] = [];
  let batchLength = 0;
  const removeBatch = (): void => {
    if (batch.length === 0) return;

    const batchDirs = batch;
    getResult(() => {
      spawnBackground("wsl.exe", ["--exec", "sh", "-c", WSL_REMOVE_SCRIPT, "sh", ...batchDirs]);
    }).match(noop, noop);
    batch = [];
    batchLength = 0;
  };
  for (const linuxDir of linuxDirs) {
    // A single path longer than the budget still goes out on its own — one over-long launch that fails is strictly
    // Better than dropping the entry from the sweep entirely
    if (batchLength + linuxDir.length + 1 > WSL_REMOVE_ARGV_MAX_LENGTH) removeBatch();
    batch.push(linuxDir);
    batchLength += linuxDir.length + 1;
  }
  removeBatch();
};
