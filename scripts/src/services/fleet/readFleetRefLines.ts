import type { FleetRefLine } from "#src/models/fleet/FleetRefLine";

import { parseForEachRefLine } from "#src/services/fleet/parseForEachRefLine";
import { runFleetRefGit } from "#src/services/fleet/runFleetRefGit";
import { REMOTE_NAME } from "#src/services/shared/constants";
import { runGit } from "#src/services/shared/runGit";

// Mirrors one family of the remote's fleet refs into the local namespace, pruning those the remote deleted, and reads
// The mirror back. Every read of claims or heartbeats goes through here, so none names a remote ref directly
export const readFleetRefLines = (remotePrefix: string, localPrefix: string): FleetRefLine[] => {
  runFleetRefGit(["fetch", "--quiet", "--prune", REMOTE_NAME, `+${remotePrefix}*:${localPrefix}*`]);
  return runGit(["for-each-ref", "--format=%(objectname) %(refname:lstrip=3) %(contents:subject)", localPrefix])
    .split("\n")
    .map((line) => parseForEachRefLine(line))
    .filter((line) => line !== undefined);
};
