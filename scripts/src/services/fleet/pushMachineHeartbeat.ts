import type { MachineHeartbeat } from "#src/models/fleet/MachineHeartbeat";

import { FleetPushOutcome } from "#src/models/fleet/FleetPushOutcome";
import { MACHINE_REF_PREFIX } from "#src/services/fleet/constants";
import { createFleetCommit } from "#src/services/fleet/createFleetCommit";
import { pushFleetRef } from "#src/services/fleet/pushFleetRef";
import { readRemoteSha } from "#src/services/fleet/readRemoteSha";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Points the machine's heartbeat ref at a new commit carrying `heartbeat`, leased from `lastSha`, the commit this
// Machine pushed last. With no last commit the remote's own is read first, so a restarted watcher leases correctly.
// Returns the new commit, which the caller keeps as its last
export const pushMachineHeartbeat = (heartbeat: MachineHeartbeat, lastSha: string | undefined): string => {
  const ref = `${MACHINE_REF_PREFIX}${heartbeat.machine}`;
  const sha = createFleetCommit(heartbeat);
  const outcome = pushFleetRef(ref, sha, lastSha ?? readRemoteSha(ref));
  if (outcome !== FleetPushOutcome.Pushed)
    throw new InvalidOperationError(
      Operation.Push,
      ref,
      "the heartbeat moved past the commit this machine last pushed",
    );
  return sha;
};
