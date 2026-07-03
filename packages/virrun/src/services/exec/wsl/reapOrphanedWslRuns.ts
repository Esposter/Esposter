import { spawnBackground } from "@/services/exec/util/spawnBackground";
import { buildWslOrphanReapCommand } from "@/services/exec/wsl/buildWslOrphanReapCommand";
import { VIRRUN_WSL_PROCESS_MARKER } from "@/services/exec/wsl/constants";
// Fire the startup orphan sweep: a hidden, unref'd `wsl.exe` that group-kills virrun runs a hard kill left reparented
// Off the `wsl.exe` Relay (buildWslOrphanReapCommand). spawnBackground runs it Linux-side off the 9p bridge, outliving
// This process (see there for why it must not be `detached`). Passing the shared base marker (not a per-run uuid)
// Matches every run's shell, and the Relay-parent test inside the script keeps the kill to orphans only — so this is
// Safe to run even while a concurrent virrun run is live.
export const reapOrphanedWslRuns = (): void => {
  const [file, ...args] = buildWslOrphanReapCommand(VIRRUN_WSL_PROCESS_MARKER);
  spawnBackground(file, args);
};
