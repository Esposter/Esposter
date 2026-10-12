import { parseLsRemoteSha } from "#src/services/fleet/parseLsRemoteSha";
import { runFleetRefGit } from "#src/services/fleet/runFleetRefGit";
import { REMOTE_NAME } from "#src/services/shared/constants";

// The commit a ref points at on the remote, or undefined when the remote does not have it. An unreachable remote throws
export const readRemoteSha = (ref: string): string | undefined =>
  parseLsRemoteSha(runFleetRefGit(["ls-remote", REMOTE_NAME, ref]));
