import { buildWslOrphanReapCommand } from "@/services/exec/wsl/buildWslOrphanReapCommand";
import { VIRRUN_WSL_PROCESS_MARKER } from "@/services/exec/wsl/constants";
import { spawn } from "node:child_process";
// Fire the startup orphan sweep: a detached, unref'd `wsl.exe` that group-kills virrun runs a hard kill left
// Reparented off the `wsl.exe` Relay (buildWslOrphanReapCommand). Detached + unref (the createWslOsBackend reaper
// Pattern) so it outlives this process and runs Linux-side off the 9p bridge; the `error` event is swallowed because
// A best-effort background reap must never surface, and a synchronous spawn throw is caught by the caller. Passing the
// Shared base marker (not a per-run uuid) matches every run's shell, and the Relay-parent test inside the script keeps
// The kill to orphans only — so this is safe to run even while a concurrent virrun run is live.
export const reapOrphanedWslRuns = (): void => {
  const [file, ...args] = buildWslOrphanReapCommand(VIRRUN_WSL_PROCESS_MARKER);
  const reaper = spawn(file, args, { detached: true, stdio: "ignore" });
  reaper.on("error", () => undefined);
  reaper.unref();
};
