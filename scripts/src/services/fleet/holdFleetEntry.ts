import type { ClaimedRef } from "#src/models/fleet/ClaimedRef";

import { FleetPushOutcome } from "#src/models/fleet/FleetPushOutcome";
import { CLAIM_REF_PREFIX, RENEW_MILLISECONDS } from "#src/services/fleet/constants";
import { createFleetCommit } from "#src/services/fleet/createFleetCommit";
import { formatMachineLoad } from "#src/services/fleet/formatMachineLoad";
import { pushFleetRef } from "#src/services/fleet/pushFleetRef";
import { readMachineSample } from "#src/services/fleet/readMachineSample";
import { getResultAsync } from "@esposter/shared";
import { setTimeout as sleep } from "node:timers/promises";

// Renews a claim this machine holds every renewal interval until its ref is deleted or taken over. Each renewal carries
// The latest load line and is leased from the commit this loop last pushed. A renewal that cannot reach the remote is
// Logged and retried on the next interval, so a network failure never ends the hold
export const holdFleetEntry = async (entry: string, machine: string, claimed: ClaimedRef): Promise<void> => {
  let current = claimed;
  let isHeld = true;
  while (isHeld) {
    // oxlint-disable-next-line no-await-in-loop -- each renewal is one interval after the last, so the waits cannot overlap
    await sleep(RENEW_MILLISECONDS);
    // oxlint-disable-next-line no-await-in-loop -- as above
    const renewal = await getResultAsync(async () => {
      const sample = await readMachineSample();
      const message = {
        ...current.message,
        load: formatMachineLoad(sample.cpuPercentage, sample.gpuPercentage, sample.freeGigabytes),
        renewedAt: Temporal.Now.instant().toString(),
      };
      const sha = createFleetCommit(message);
      return { outcome: pushFleetRef(`${CLAIM_REF_PREFIX}${entry}`, sha, current.sha), renewed: { message, sha } };
    });
    renewal.match(
      ({ outcome, renewed }) => {
        if (outcome === FleetPushOutcome.Pushed) current = renewed;
        else {
          isHeld = false;
          const reason = outcome === FleetPushOutcome.Gone ? "its ref was deleted" : "another machine holds it";
          console.info(`${machine} stopped holding ${entry}: ${reason}`);
        }
      },
      (error) => {
        console.error(`renewing ${entry} failed, retrying next interval: ${error.message}`);
      },
    );
  }
};
