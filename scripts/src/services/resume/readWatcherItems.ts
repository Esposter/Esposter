import type { ResumeItem } from "#src/models/resume/ResumeItem";

import { readMachineState } from "#src/services/machine/readMachineState";
import { getWatcherItems } from "#src/services/resume/getWatcherItems";
import { checkIsProcessRunning } from "#src/services/shared/checkIsProcessRunning";

export const readWatcherItems = (): ResumeItem[] => {
  const state = readMachineState();
  return getWatcherItems(
    state,
    Temporal.Now.instant().epochMilliseconds,
    state !== undefined && checkIsProcessRunning(state.processId),
  );
};
