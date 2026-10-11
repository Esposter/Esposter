import { FLEET_REMOTE } from "#src/services/fleet/constants";
import { parseLsRemoteSha } from "#src/services/fleet/parseLsRemoteSha";
import { runFleetRefGit } from "#src/services/fleet/runFleetRefGit";

// The commit a ref points at on the remote, or undefined when the remote does not have it. An unreachable remote throws
export const readRemoteSha = (ref: string): string | undefined =>
  parseLsRemoteSha(runFleetRefGit(["ls-remote", FLEET_REMOTE, ref]));
