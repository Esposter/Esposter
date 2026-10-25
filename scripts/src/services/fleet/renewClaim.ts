import type { ClaimHolder } from "#src/models/fleet/ClaimHolder";

import { FleetPushOutcome } from "#src/models/fleet/FleetPushOutcome";
import { RenewalDecision } from "#src/models/fleet/RenewalDecision";
import { CLAIM_REF_PREFIX } from "#src/services/fleet/constants";
import { createFleetCommit } from "#src/services/fleet/createFleetCommit";
import { formatMachineLoad } from "#src/services/fleet/formatMachineLoad";
import { getRenewalDecision } from "#src/services/fleet/getRenewalDecision";
import { pushFleetRef } from "#src/services/fleet/pushFleetRef";
import { readClaimedRefs } from "#src/services/fleet/readClaimedRefs";
import { readMachineSample } from "#src/services/fleet/readMachineSample";

// Renews the claim `holder` holds, judging it from the remote's claim at each renewal, and returns the decision
// When the claim is no longer this worker's to renew. A push leased from the claim just read, so a renewal that
// Races another worker's write is refused rather than overwriting it
export const renewClaim = async (entry: string, holder: ClaimHolder): Promise<RenewalDecision> => {
  const remote = readClaimedRefs().get(entry);
  const decision = getRenewalDecision(remote, holder);
  if (decision !== RenewalDecision.Renew || remote === undefined) return decision;
  const sample = await readMachineSample();
  const message = {
    ...remote.message,
    load: formatMachineLoad(sample.cpuPercentage, sample.gpuPercentage, sample.freeGigabytes, process.platform),
    renewedAt: Temporal.Now.instant().toString(),
  };
  const outcome = pushFleetRef(`${CLAIM_REF_PREFIX}${entry}`, createFleetCommit(message), remote.sha);
  if (outcome === FleetPushOutcome.Pushed) return RenewalDecision.Renew;
  return outcome === FleetPushOutcome.Gone ? RenewalDecision.Deleted : RenewalDecision.Moved;
};
