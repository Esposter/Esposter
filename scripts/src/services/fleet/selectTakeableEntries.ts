import type { FleetEntry } from "#src/models/fleet/FleetEntry";
import type { MachineProfile } from "#src/models/fleet/MachineProfile";
import type { ClaimedRef } from "#src/models/shared/ClaimedRef";

import { ClaimStatus } from "#src/models/shared/ClaimStatus";
import { checkTouchesOverlap } from "#src/services/fleet/checkTouchesOverlap";
import { comparePhases } from "#src/services/fleet/comparePhases";
import { ALL_AREAS } from "#src/services/fleet/constants";
import { getClaimStatus } from "#src/services/fleet/getClaimStatus";

// The entries this machine may take are offered in order: the lowest phase first, then the listed order.
// An entry with no phase comes after every phase.
// So the first one is the next entry to claim.
// An entry is takeable when the machine meets its needs and lends its area.
// It is also not waiting on a blocker, and no live claim holds it.
// Its touch set must overlap no live claim's.
// A stale claim is taken over, so it does not hold.
// A missed claim is live, so a missed entry and its paths wait for the coordinator.
export const selectTakeableEntries = (
  entries: readonly FleetEntry[],
  profile: MachineProfile,
  claims: ReadonlyMap<string, ClaimedRef>,
  now: number,
): FleetEntry[] => {
  const isLent = (area: string) => profile.areas.some((lent) => ALL_AREAS.includes(lent) || lent === area);
  const checkIsLive = (claim: ClaimedRef) => getClaimStatus(claim.message, now) !== ClaimStatus.Stale;
  const liveClaimIds = new Set([...claims].filter(([, claim]) => checkIsLive(claim)).map(([id]) => id));
  const liveTouches = entries.filter(({ id }) => liveClaimIds.has(id)).flatMap(({ touches }) => touches);
  return entries
    .filter(
      ({ area, id, needs, touches, waiting }) =>
        needs.every((need) => profile.capabilities.includes(need)) &&
        isLent(area) &&
        /* oxlint-disable-next-line selector-ban/no-restricted-syntax -- a waiting reason the fleet holds, empty
           when none */
        waiting === "" &&
        !liveClaimIds.has(id) &&
        !checkTouchesOverlap(touches, liveTouches),
    )
    .toSorted(comparePhases);
};
