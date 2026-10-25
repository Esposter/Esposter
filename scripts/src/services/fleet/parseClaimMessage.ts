import type { ClaimMessage } from "#src/models/fleet/ClaimMessage";

import { checkIsClaimMessage } from "#src/services/fleet/checkIsClaimMessage";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { getResult } from "@esposter/shared";

// The message of a claim commit, or undefined for a commit that is not a claim this fleet wrote. A claim written before
// Workers has no `worker`, which reads as "" so no worker holds it
export const parseClaimMessage = (message: string): ClaimMessage | undefined =>
  getResult(() => parseMachineJson(message)).match(
    (claimValue) => (checkIsClaimMessage(claimValue) ? { ...claimValue, worker: claimValue.worker ?? "" } : undefined),
    () => undefined,
  );
