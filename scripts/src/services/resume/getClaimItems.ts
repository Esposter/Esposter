import type { ClaimedRef } from "#src/models/fleet/ClaimedRef";
import type { HoldFile } from "#src/models/resume/HoldFile";
import type { ResumeItem } from "#src/models/resume/ResumeItem";

import { ClaimStatus } from "#src/models/fleet/ClaimStatus";
import { formatAge } from "#src/services/fleet/formatAge";
import { formatClaimHolder } from "#src/services/fleet/formatClaimHolder";
import { getClaimStatus } from "#src/services/fleet/getClaimStatus";
import { HOLD_DIED_ACTION, MISSED_CLAIM_ACTION, STALE_CLAIM_ACTION } from "#src/services/resume/constants";

const MISS_LENGTH = 40;

// The claims this machine holds, each with its state and age. A live claim whose hold process is gone is no longer renewed
export const getClaimItems = (
  claimedRefMap: ReadonlyMap<string, ClaimedRef>,
  machineId: string,
  holdFiles: readonly HoldFile[],
  now: number,
): ResumeItem[] =>
  [...claimedRefMap]
    .filter(([_entry, { message }]) => message.machine === machineId)
    .map(([entry, { message }]) => {
      const age = formatAge(now - Temporal.Instant.from(message.renewedAt).epochMilliseconds);
      const label = `${entry} ${formatClaimHolder(message)}`;
      const status = getClaimStatus(message, now);
      if (status === ClaimStatus.Stale) return { action: STALE_CLAIM_ACTION, text: `${label} stale, ${age}` };
      if (status === ClaimStatus.Missed)
        return {
          action: MISSED_CLAIM_ACTION,
          text: `${label} missed (${(message.miss ?? "").slice(0, MISS_LENGTH)}), ${age}`,
        };
      const isHoldRunning = holdFiles.some(
        (holdFile) => holdFile.entry === entry && holdFile.worker === message.worker && holdFile.isRunning,
      );
      return isHoldRunning
        ? { action: "", text: `${label} live, ${age}` }
        : { action: HOLD_DIED_ACTION, text: `${label} live, ${age}` };
    });
