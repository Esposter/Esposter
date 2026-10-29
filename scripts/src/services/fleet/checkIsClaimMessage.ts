import type { ClaimMessage } from "#src/models/fleet/ClaimMessage";

import { checkIsInstant } from "#src/services/fleet/checkIsInstant";

export const checkIsClaimMessage = (value: unknown): value is ClaimMessage =>
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
