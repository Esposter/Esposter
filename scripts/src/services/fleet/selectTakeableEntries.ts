import type { ClaimedRef } from "#src/models/fleet/ClaimedRef";
import type { FleetEntry } from "#src/models/fleet/FleetEntry";
import type { MachineProfile } from "#src/models/fleet/MachineProfile";

import { ClaimStatus } from "#src/models/fleet/ClaimStatus";
import { checkTouchesOverlap } from "#src/services/fleet/checkTouchesOverlap";
import { ALL_AREAS } from "#src/services/fleet/constants";
import { getClaimStatus } from "#src/services/fleet/getClaimStatus";

// The entries this machine may take, in the order they are listed. An entry is takeable when the machine meets its needs
// And lends its area, when it is not waiting on a blocker, when no live claim holds it (a stale claim is taken over, so
// It does not hold), and when its touch set overlaps no live claim's. A missed claim is live, so a missed entry and its
// Paths wait for the coordinator
export const selectTakeableEntries = (
  entries: readonly FleetEntry[],
  profile: MachineProfile,
  claims: ReadonlyMap<string, ClaimedRef>,
  now: number,
): FleetEntry[] => {
  const isLent = (area: string) => profile.areas.some((lent) => ALL_AREAS.includes(lent) || lent === area);
  const isLive = (claim: ClaimedRef) => getClaimStatus(claim.message, now) !== ClaimStatus.Stale;
  const liveClaimIds = new Set([...claims].filter(([, claim]) => isLive(claim)).map(([id]) => id));
  const liveTouches = entries.filter(({ id }) => liveClaimIds.has(id)).flatMap(({ touches }) => touches);
  return entries.filter(
    ({ area, id, needs, touches, waiting }) =>
      needs.every((need) => profile.capabilities.includes(need)) &&
      isLent(area) &&
      waiting === "" &&
      !liveClaimIds.has(id) &&
      !checkTouchesOverlap(touches, liveTouches),
  );
};
