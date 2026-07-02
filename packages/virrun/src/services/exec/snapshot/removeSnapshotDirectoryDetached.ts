import { removeSnapshotDirectory } from "@/services/exec/snapshot/removeSnapshotDirectory";
import { WSL_REMOVE_SCRIPT, WSL_UNC_REGEX } from "@/services/exec/wsl/constants";
import { readWslPath } from "@/services/exec/wsl/readWslPath";
import { spawn } from "node:child_process";
// Fire-and-forget teardown for stale-cache sweeps (pruneStaleSnapshots/pruneStalePrepareLayers) — dirs the current
// Run never touches, so their removal has no bearing on correctness and must not block the command from starting.
// A `\\wsl.localhost` snapshot's rm -rf is the expensive case: a full node_modules / .nuxt closure torn down inside
// WSL, and during active dev every source edit strands a superseded prepare layer that the next run would otherwise
// Block on. Detach + unref it (the createWslOsBackend reaper pattern) so it outlives this process and runs Linux-side
// Off the 9p bridge. A plain win32/Linux path stays a synchronous removeSnapshotDirectory: local fs teardown is cheap,
// And keeping it synchronous keeps the sweep deterministic for tests and needs no extra process.
export const removeSnapshotDirectoryDetached = (dir: string): void => {
  if (!WSL_UNC_REGEX.test(dir)) {
    removeSnapshotDirectory(dir);
    return;
  }
  // A synchronous spawn throw (wsl.exe missing) is caught by the caller's getResult; the async `error` event is
  // Swallowed since a best-effort background sweep must never surface, and unref lets this process exit while it runs.
  const linuxDir = readWslPath(dir);
  const child = spawn("wsl.exe", ["--exec", "sh", "-c", WSL_REMOVE_SCRIPT, "sh", linuxDir], {
    detached: true,
    stdio: "ignore",
  });
  child.on("error", () => undefined);
  child.unref();
};
