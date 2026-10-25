import type { ClaimHolder } from "#src/models/fleet/ClaimHolder";

import { LOCAL_HOLD_POLL_MILLISECONDS, RENEW_MILLISECONDS } from "#src/services/fleet/constants";
import { formatClaimHolder } from "#src/services/fleet/formatClaimHolder";
import { getHoldFilePath } from "#src/services/fleet/getHoldFilePath";
import { removeHoldFile } from "#src/services/fleet/removeHoldFile";
import { renewOrStop } from "#src/services/fleet/renewOrStop";
import { writeHoldFile } from "#src/services/fleet/writeHoldFile";
import { existsSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";

const RELEASED_HERE_REASON = "it was released on this machine";

// Holds `entry` for `holder` until its hold file is deleted here or a renewal finds the claim no longer this worker's.
// The file is polled, so a local release stops the hold within one poll, and the claim is renewed every renewal interval
export const holdFleetEntry = async (entry: string, holder: ClaimHolder): Promise<void> => {
  writeHoldFile(entry, holder.worker);
  let renewedMilliseconds = Temporal.Now.instant().epochMilliseconds;
  let stopReason: string | undefined;
  do {
    // oxlint-disable-next-line no-await-in-loop -- each poll waits for the one before it
    await sleep(LOCAL_HOLD_POLL_MILLISECONDS);
    if (!existsSync(getHoldFilePath(entry, holder.worker))) stopReason = RELEASED_HERE_REASON;
    else if (Temporal.Now.instant().epochMilliseconds - renewedMilliseconds >= RENEW_MILLISECONDS) {
      renewedMilliseconds = Temporal.Now.instant().epochMilliseconds;
      // oxlint-disable-next-line no-await-in-loop -- a renewal runs once its interval is due, after the poll before it
      stopReason = await renewOrStop(entry, holder);
    }
  } while (stopReason === undefined);
  removeHoldFile(entry, holder.worker);
  console.info(`${formatClaimHolder(holder)} stopped holding ${entry}: ${stopReason}`);
};
