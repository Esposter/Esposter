import type { ClaimedRef } from "#src/models/fleet/ClaimedRef";
import type { HoldFile } from "#src/models/resume/HoldFile";
import type { ResumeItem } from "#src/models/resume/ResumeItem";

import { getHoldFilePath } from "#src/services/fleet/getHoldFilePath";
import { DELETE_PID_FILE_ACTION } from "#src/services/resume/constants";

// The hold pid files nothing needs any more: the process is dead, or the claim it held is gone or another worker's
export const getHoldItems = (
  holdFiles: readonly HoldFile[],
  claimedRefMap: ReadonlyMap<string, ClaimedRef>,
): ResumeItem[] =>
  holdFiles.flatMap(({ entry, isRunning, worker }) => {
    const path = getHoldFilePath(entry, worker);
    if (!isRunning) return [{ action: DELETE_PID_FILE_ACTION, text: `${path} process dead` }];
    return claimedRefMap.get(entry)?.message.worker === worker
      ? []
      : [{ action: DELETE_PID_FILE_ACTION, text: `${path} claim gone` }];
  });
