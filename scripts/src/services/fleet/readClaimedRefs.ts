import type { ClaimedRef } from "#src/models/fleet/ClaimedRef";

import { CLAIM_REF_PREFIX, FLEET_LOCAL_CLAIM_PREFIX } from "#src/services/fleet/constants";
import { parseClaimMessage } from "#src/services/fleet/parseClaimMessage";
import { readFleetRefLines } from "#src/services/fleet/readFleetRefLines";

// Every claim on the remote, by entry id. A ref whose message is not a claim this fleet wrote is not a claim
export const readClaimedRefs = (): Map<string, ClaimedRef> =>
  new Map(
    readFleetRefLines(CLAIM_REF_PREFIX, FLEET_LOCAL_CLAIM_PREFIX).flatMap(({ id, message, sha }) => {
      const claimMessage = parseClaimMessage(message);
      return claimMessage === undefined ? [] : [[id, { message: claimMessage, sha }] as const];
    }),
  );
