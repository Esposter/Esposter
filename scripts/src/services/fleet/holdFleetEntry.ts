/* oxlint-disable no-await-in-loop -- Each step reads the last: a renewal is timed from the one before it, and the hold ends at the first renewal or release that stops it */
import type { ClaimHolder } from "#src/models/fleet/ClaimHolder";

import { RENEW_MILLISECONDS } from "#src/services/fleet/constants";
import { formatClaimHolder } from "#src/services/fleet/formatClaimHolder";
import { getHoldFilePath } from "#src/services/fleet/getHoldFilePath";
import { removeHoldFile } from "#src/services/fleet/removeHoldFile";
import { renewOrStop } from "#src/services/fleet/renewOrStop";
import { writeHoldFile } from "#src/services/fleet/writeHoldFile";
import { existsSync, watch } from "node:fs";
import { dirname } from "node:path";

const RELEASED_HERE_REASON = "it was released on this machine";

// Holds `entry` for `holder` until its hold file is deleted here or a renewal finds the claim no longer this worker's.
// The holds folder is watched, so a local release stops the hold the moment its file goes, and the claim is renewed each
// Renewal interval in between
export const holdFleetEntry = async (entry: string, holder: ClaimHolder): Promise<void> => {
  writeHoldFile(entry, holder.worker);
  const holdFilePath = getHoldFilePath(entry, holder.worker);
  const released = Promise.withResolvers<string>();
  const releaseIfDeleted = () => {
    if (!existsSync(holdFilePath)) released.resolve(RELEASED_HERE_REASON);
  };
  const watcher = watch(dirname(holdFilePath), releaseIfDeleted);
  // A release made before the watch began has no event left to send, so the file is read once after it starts
  releaseIfDeleted();
  let stopReason: string | undefined;
  do {
    const renewalDue = Promise.withResolvers<void>();
    const renewalTimer = setTimeout(renewalDue.resolve, RENEW_MILLISECONDS);
    const renewWhenDue = async (): Promise<string | undefined> => {
      await renewalDue.promise;
      return renewOrStop(entry, holder);
    };
    stopReason = await Promise.race([released.promise, renewWhenDue()]);
    clearTimeout(renewalTimer);
  } while (stopReason === undefined);
  watcher.close();
  removeHoldFile(entry, holder.worker);
  console.info(`${formatClaimHolder(holder)} stopped holding ${entry}: ${stopReason}`);
};
