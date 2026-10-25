import type { ClaimHolder } from "#src/models/fleet/ClaimHolder";

import { RenewalDecision } from "#src/models/fleet/RenewalDecision";
import { renewClaim } from "#src/services/fleet/renewClaim";
import { getResultAsync } from "@esposter/shared";

const RENEWAL_STOP_REASONS: Record<Exclude<RenewalDecision, RenewalDecision.Renew>, string> = {
  [RenewalDecision.Deleted]: "its ref was deleted",
  [RenewalDecision.Missed]: "it was missed",
  [RenewalDecision.Moved]: "its claim moved during the renewal",
  [RenewalDecision.TakenOver]: "another machine or worker holds it",
};

// The reason a renewal stops the hold, or undefined when the hold goes on. A renewal that cannot reach the remote is
// Logged and retried on the next interval, so a network failure never ends the hold
export const renewOrStop = async (entry: string, holder: ClaimHolder): Promise<string | undefined> =>
  (await getResultAsync(() => renewClaim(entry, holder))).match(
    (decision) => (decision === RenewalDecision.Renew ? undefined : RENEWAL_STOP_REASONS[decision]),
    (error) => {
      console.error(`renewing ${entry} failed, retrying next interval: ${error.message}`);
      return undefined;
    },
  );
