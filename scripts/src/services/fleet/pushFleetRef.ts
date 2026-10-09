import { FleetPushOutcome } from "#src/models/fleet/FleetPushOutcome";
import { FLEET_REMOTE } from "#src/services/fleet/constants";
import { readRemoteSha } from "#src/services/fleet/readRemoteSha";
import { runGit } from "#src/services/shared/runGit";
import { getResult } from "@esposter/shared";

// Points `ref` on the remote at `sha`. `expectedSha` is the commit the push replaces, sent as an explicit lease, and
// Undefined creates the ref. A refused push is told apart from a failed one by asking the remote again: if the ref is
// There it is held elsewhere (Refused), if not it was deleted (Gone), and if the remote cannot be asked the push's
// Own error is thrown, since nothing reached the remote to refuse it
export const pushFleetRef = (ref: string, sha: string, expectedSha: string | undefined): FleetPushOutcome => {
  const lease = expectedSha === undefined ? [] : [`--force-with-lease=${ref}:${expectedSha}`];
  return getResult(() => runGit(["push", "--quiet", ...lease, FLEET_REMOTE, `${sha}:${ref}`])).match(
    () => FleetPushOutcome.Pushed,
    (pushError) =>
      getResult(() => readRemoteSha(ref)).match(
        (remoteSha) => (remoteSha === undefined ? FleetPushOutcome.Gone : FleetPushOutcome.Refused),
        () => {
          throw pushError;
        },
      ),
  );
};
