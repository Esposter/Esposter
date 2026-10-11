import type { ClaimMessage } from "#src/models/fleet/ClaimMessage";

import { checkIsInstant } from "#src/services/shared/checkIsInstant";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { getResult } from "@esposter/shared";

const checkIsClaimMessage = (value: unknown): value is ClaimMessage =>
  typeof value === "object" &&
  value !== null &&
  "claimedAt" in value &&
  checkIsInstant(value.claimedAt) &&
  "entry" in value &&
  typeof value.entry === "string" &&
  "load" in value &&
  typeof value.load === "string" &&
  "machine" in value &&
  typeof value.machine === "string" &&
  "renewedAt" in value &&
  checkIsInstant(value.renewedAt) &&
  (!("miss" in value) || typeof value.miss === "string") &&
  (!("worker" in value) || typeof value.worker === "string");

// The message of a claim commit, or undefined for a commit that is not a claim this fleet wrote. A claim written before
// Workers has no `worker`, which reads as "" so no worker holds it
export const parseClaimMessage = (message: string): ClaimMessage | undefined =>
  getResult(() => parseMachineJson(message)).match(
    (claimValue) => (checkIsClaimMessage(claimValue) ? { ...claimValue, worker: claimValue.worker ?? "" } : undefined),
    () => undefined,
  );
