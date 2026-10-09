import type { ClaimMessage } from "#src/models/fleet/ClaimMessage";

import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { getResult } from "@esposter/shared";

// Whether a value is an instant Temporal reads, since a claim is aged by its instants and a malformed one must not throw
const checkIsInstant = (value: unknown): boolean =>
  typeof value === "string" &&
  getResult(() => Temporal.Instant.from(value)).match(
    () => true,
    () => false,
  );

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
  (!("miss" in value) || typeof value.miss === "string");

// The message of a claim commit, or undefined for a commit that is not a claim this fleet wrote
export const parseClaimMessage = (message: string): ClaimMessage | undefined =>
  getResult(() => parseMachineJson(message)).match(
    (parsed) => (checkIsClaimMessage(parsed) ? parsed : undefined),
    () => undefined,
  );
