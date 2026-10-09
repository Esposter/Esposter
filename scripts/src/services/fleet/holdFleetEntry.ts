import { FleetPushOutcome } from "#src/models/fleet/FleetPushOutcome";
import { RenewalDecision } from "#src/models/fleet/RenewalDecision";
import { CLAIM_REF_PREFIX, LOCAL_HOLD_POLL_MILLISECONDS, RENEW_MILLISECONDS } from "#src/services/fleet/constants";
import { createFleetCommit } from "#src/services/fleet/createFleetCommit";
import { formatMachineLoad } from "#src/services/fleet/formatMachineLoad";
import { getHoldFilePath } from "#src/services/fleet/getHoldFilePath";
import { getRenewalDecision } from "#src/services/fleet/getRenewalDecision";
import { pushFleetRef } from "#src/services/fleet/pushFleetRef";
import { readClaimedRefs } from "#src/services/fleet/readClaimedRefs";
import { readMachineSample } from "#src/services/fleet/readMachineSample";
import { removeHoldFile } from "#src/services/fleet/removeHoldFile";
import { writeHoldFile } from "#src/services/fleet/writeHoldFile";
import { getResultAsync } from "@esposter/shared";
import { existsSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";

const RELEASED_HERE_REASON = "it was released on this machine";
const RENEWAL_STOP_REASONS: Record<Exclude<RenewalDecision, RenewalDecision.Renew>, string> = {
  [RenewalDecision.Deleted]: "its ref was deleted",
  [RenewalDecision.Missed]: "it was missed",
  [RenewalDecision.Moved]: "its claim moved during the renewal",
  [RenewalDecision.TakenOver]: "another machine holds it",
};

// Renews the claim this machine holds, judging it from the remote's claim at each renewal, and returns the decision
// When the claim is no longer this machine's to renew. A push leased from the claim just read, so a renewal that
// Races another machine's write is refused rather than overwriting it
const renewClaim = async (entry: string, machine: string): Promise<RenewalDecision> => {
  const remote = readClaimedRefs().get(entry);
  const decision = getRenewalDecision(remote, machine);
  if (decision !== RenewalDecision.Renew || remote === undefined) return decision;
  const sample = await readMachineSample();
  const message = {
    ...remote.message,
    load: formatMachineLoad(sample.cpuPercentage, sample.gpuPercentage, sample.freeGigabytes),
    renewedAt: Temporal.Now.instant().toString(),
  };
  const outcome = pushFleetRef(`${CLAIM_REF_PREFIX}${entry}`, createFleetCommit(message), remote.sha);
  if (outcome === FleetPushOutcome.Pushed) return RenewalDecision.Renew;
  return outcome === FleetPushOutcome.Gone ? RenewalDecision.Deleted : RenewalDecision.Moved;
};

// The reason a renewal stops the hold, or undefined when the hold goes on. A renewal that cannot reach the remote is
// Logged and retried on the next interval, so a network failure never ends the hold
const renewOrStop = async (entry: string, machine: string): Promise<string | undefined> =>
  (await getResultAsync(() => renewClaim(entry, machine))).match(
    (decision) => (decision === RenewalDecision.Renew ? undefined : RENEWAL_STOP_REASONS[decision]),
    (error) => {
      console.error(`renewing ${entry} failed, retrying next interval: ${error.message}`);
      return undefined;
    },
  );

// Holds `entry` for `machine` until its hold file is deleted here or a renewal finds the claim no longer this machine's.
// The file is polled, so a local release stops the hold within one poll, and the claim is renewed every renewal interval
export const holdFleetEntry = async (entry: string, machine: string): Promise<void> => {
  writeHoldFile(entry);
  let renewedMilliseconds = Temporal.Now.instant().epochMilliseconds;
  let stopReason: string | undefined;
  do {
    // oxlint-disable-next-line no-await-in-loop -- each poll waits for the one before it
    await sleep(LOCAL_HOLD_POLL_MILLISECONDS);
    if (!existsSync(getHoldFilePath(entry))) stopReason = RELEASED_HERE_REASON;
    else if (Temporal.Now.instant().epochMilliseconds - renewedMilliseconds >= RENEW_MILLISECONDS) {
      renewedMilliseconds = Temporal.Now.instant().epochMilliseconds;
      // oxlint-disable-next-line no-await-in-loop -- a renewal runs once its interval is due, after the poll before it
      stopReason = await renewOrStop(entry, machine);
    }
  } while (stopReason === undefined);
  removeHoldFile(entry);
  console.info(`${machine} stopped holding ${entry}: ${stopReason}`);
};
