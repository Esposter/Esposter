import { removeSnapshotDirectory } from "@/services/exec/snapshot/removeSnapshotDirectory";
import { spawnBackground } from "@/services/exec/util/spawnBackground";
import { WSL_REMOVE_SCRIPT, WSL_UNC_REGEX } from "@/services/exec/wsl/constants";
import { readWslPath } from "@/services/exec/wsl/readWslPath";
// Fire-and-forget teardown for stale-cache sweeps (pruneStaleSnapshots/pruneStalePrepareLayers) — dirs the current
// Run never touches, so their removal has no bearing on correctness and must not block the command from starting.
// A `\\wsl.localhost` snapshot's rm -rf is the expensive case: a full node_modules / .nuxt closure torn down inside
// WSL, and during active dev every source edit strands a superseded prepare layer that the next run would otherwise
// Block on. spawnBackground runs it Linux-side off the 9p bridge, outliving this process. A plain win32/Linux path
// Stays a synchronous removeSnapshotDirectory: local fs teardown is cheap, and keeping it synchronous keeps the sweep
// Deterministic for tests and needs no extra process.
export const removeSnapshotDirectoryDetached = (dir: string): void => {
  if (!WSL_UNC_REGEX.test(dir)) {
    removeSnapshotDirectory(dir);
    return;
  }
  const linuxDir = readWslPath(dir);
  spawnBackground("wsl.exe", ["--exec", "sh", "-c", WSL_REMOVE_SCRIPT, "sh", linuxDir]);
};
