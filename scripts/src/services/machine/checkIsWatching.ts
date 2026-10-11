import type { MachineStateFile } from "#src/models/machine/MachineStateFile";

import { MACHINE_STATE_STALE_MILLISECONDS } from "#src/services/machine/constants";
import { checkIsProcessRunning } from "#src/services/shared/checkIsProcessRunning";

// Whether another watcher already keeps the state file: its reading is fresh and its process is alive. The session's
// Watcher is started per session, so a second one would sample the machine twice and push a heartbeat twice
export const checkIsWatching = (
  state: MachineStateFile | undefined,
  ownProcessId: number,
  nowMilliseconds: number,
): boolean =>
  state !== undefined &&
  state.processId !== ownProcessId &&
  nowMilliseconds - Temporal.Instant.from(state.at).epochMilliseconds < MACHINE_STATE_STALE_MILLISECONDS &&
  checkIsProcessRunning(state.processId);
