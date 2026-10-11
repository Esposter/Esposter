import type { MachineStateFile } from "#src/models/machine/MachineStateFile";
import type { ResumeItem } from "#src/models/resume/ResumeItem";

import { MACHINE_STATE_STALE_MILLISECONDS } from "#src/services/machine/constants";
import { WATCHER_ACTION, WATCHER_MISSING_TEXT } from "#src/services/resume/constants";

// The machine watcher is running when its latest reading is fresh and the process that wrote it is alive
export const getWatcherItems = (
  state: MachineStateFile | undefined,
  nowMilliseconds: number,
  isProcessRunning: boolean,
): ResumeItem[] => {
  const isFresh =
    state !== undefined &&
    nowMilliseconds - Temporal.Instant.from(state.at).epochMilliseconds < MACHINE_STATE_STALE_MILLISECONDS;
  return isFresh && isProcessRunning ? [] : [{ action: WATCHER_ACTION, text: WATCHER_MISSING_TEXT }];
};
