import type { FleetEntry } from "#src/models/fleet/FleetEntry";
import type { MachineProfile } from "#src/models/fleet/MachineProfile";
import type { ClaimedRef } from "#src/models/shared/ClaimedRef";

import { ClaimStatus } from "#src/models/shared/ClaimStatus";
import { checkTouchesOverlap } from "#src/services/fleet/checkTouchesOverlap";
import { ALL_AREAS } from "#src/services/fleet/constants";
import { getClaimStatus } from "#src/services/fleet/getClaimStatus";

// Two entries that both hold a phase compare by it, and two that hold none compare equal, so the listed order holds
const comparePhases = (firstEntry: FleetEntry, secondEntry: FleetEntry): number =>
  Number(firstEntry.phase === undefined) - Number(secondEntry.phase === undefined) ||
  (firstEntry.phase ?? 0) - (secondEntry.phase ?? 0);
// The entries this machine may take, in the order they are offered: the lowest phase first, an entry with no phase after
// Every phase, and the listed order within a phase, so the first one is the next entry to claim. An entry is takeable
// When the machine meets its needs and lends its area, when it is not waiting on a blocker, when no live claim holds it
// (a stale claim is taken over, so it does not hold), and when its touch set overlaps no live claim's. A missed claim is
// Live, so a missed entry and its paths wait for the coordinator
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
  return entries
    .filter(
      ({ area, id, needs, touches, waiting }) =>
        needs.every((need) => profile.capabilities.includes(need)) &&
        isLent(area) &&
        waiting === "" &&
        !liveClaimIds.has(id) &&
        !checkTouchesOverlap(touches, liveTouches),
    )
    .toSorted(comparePhases);
};
