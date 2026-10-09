import { FLEET_REMOTE } from "#src/services/fleet/constants";
import { parseLsRemoteSha } from "#src/services/fleet/parseLsRemoteSha";
import { runGit } from "#src/services/shared/runGit";

// The commit a ref points at on the remote, or undefined when the remote does not have it. An unreachable remote throws
export const readRemoteSha = (ref: string): string | undefined =>
  parseLsRemoteSha(runGit(["ls-remote", FLEET_REMOTE, ref]));
