import { CLAIM_REF_PREFIX, FLEET_REMOTE } from "#src/services/fleet/constants";
import { readRemoteSha } from "#src/services/fleet/readRemoteSha";
import { runGit } from "#src/services/shared/runGit";
import { getResult, noop } from "@esposter/shared";

// Deletes an entry's claim, so the entry is free for any machine. A ref the remote no longer has is released all the same
export const releaseFleetEntry = (entry: string): void => {
  const ref = `${CLAIM_REF_PREFIX}${entry}`;
  getResult(() => runGit(["push", "--quiet", FLEET_REMOTE, `:${ref}`])).match(noop, (pushError) => {
    if (readRemoteSha(ref) !== undefined) throw pushError;
  });
};
