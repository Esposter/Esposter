import type { FleetRefLine } from "#src/services/fleet/parseForEachRefLine";

import { FLEET_REMOTE } from "#src/services/fleet/constants";
import { parseForEachRefLine } from "#src/services/fleet/parseForEachRefLine";
import { runGit } from "#src/services/shared/runGit";

// Mirrors one family of the remote's fleet refs into the local namespace, pruning those the remote deleted, and reads
// The mirror back. Every read of claims or heartbeats goes through here, so none names a remote ref directly
export const readFleetRefLines = (remotePrefix: string, localPrefix: string): FleetRefLine[] => {
  runGit(["fetch", "--quiet", "--prune", FLEET_REMOTE, `+${remotePrefix}*:${localPrefix}*`]);
  return runGit(["for-each-ref", "--format=%(objectname) %(refname:lstrip=3) %(contents:subject)", localPrefix])
    .split("\n")
    .map((line) => parseForEachRefLine(line))
    .filter((line) => line !== undefined);
};
