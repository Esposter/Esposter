import { FleetPushOutcome } from "#src/models/fleet/FleetPushOutcome";
import { readRemoteSha } from "#src/services/fleet/readRemoteSha";
import { runFleetRefGit } from "#src/services/fleet/runFleetRefGit";
import { REMOTE_NAME } from "#src/services/shared/constants";
import { getResult } from "@esposter/shared";

// Points `ref` on the remote at `sha`. `expectedSha` is the commit the push replaces, sent as an explicit lease, and
// Undefined creates the ref. A failed push is judged by asking the remote where the ref is now, since one killed at its
// Bound may have landed before its answer was lost: at `sha` it landed (Pushed), gone it was deleted (Gone), and at
// Another commit it is held elsewhere (Refused). Still at `expectedSha`, nothing refused the push, and if the remote
// Cannot be asked nothing is known, so either way the push's own error is thrown
export const pushFleetRef = (ref: string, sha: string, expectedSha: string | undefined): FleetPushOutcome => {
  const lease = expectedSha === undefined ? [] : [`--force-with-lease=${ref}:${expectedSha}`];
  return getResult(() => runFleetRefGit(["push", "--quiet", ...lease, REMOTE_NAME, `${sha}:${ref}`])).match(
    () => FleetPushOutcome.Pushed,
    (pushError) =>
      getResult(() => readRemoteSha(ref)).match(
        (remoteSha) => {
          if (remoteSha === sha) return FleetPushOutcome.Pushed;
          else if (remoteSha === expectedSha) throw pushError;
          else if (remoteSha === undefined) return FleetPushOutcome.Gone;
          else return FleetPushOutcome.Refused;
        },
        () => {
          throw pushError;
        },
      ),
  );
};
