import type { GadgetRow } from "#src/models/gadget/GadgetRow";
import type { HomeRealmToggleOptions } from "#src/models/home/HomeRealmToggleOptions";
import type { HomeRealmVisit } from "#src/models/home/HomeRealmVisit";
import type { WorldJumpPose } from "#src/models/world/WorldJumpPose";

import { computeHomeRealmVisit } from "#src/services/home/computeHomeRealmVisit";
import { HOME_POT_GADGET_ID, HOME_REALM_SPAWN, HOME_STAND_IN_POT_REGION_ID } from "#src/services/home/constants";
import { leaveHomeRealm } from "#src/services/home/leaveHomeRealm";
import { placeHomePot } from "#src/services/home/placeHomePot";
import { shallowRef } from "vue";

// The Serenitea Pot on the open world and the realm the player goes into from it
export const useWorldHomeRealm = () => {
  // The realm the player is in, once they have gone into it from the pot: the place they went in from. While it is set
  // The realm's Island is shown in place of the world, and the world's ground gives way to the realm's flat ground
  const homeRealmVisit = shallowRef<HomeRealmVisit>();
  // The point the Serenitea Pot is set down at in the open world, from the gadget slot at the player's feet. The save
  // Does Not hold it yet, so it lasts for the session
  const homePotPoint = shallowRef<{ x: number; z: number }>();
  // The pot used from the gadget slot is set down at the player's feet, unless the open world already holds one
  const placeUsedGadget = (usedGadget: GadgetRow | undefined, feet: { x: number; z: number }) => {
    if (usedGadget?.id === HOME_POT_GADGET_ID && !homeRealmVisit.value)
      homePotPoint.value = placeHomePot(usedGadget, homePotPoint.value, feet);
  };
  // The realm is left to the place the player went in from, by the gadget or a teleport, so a teleport's own
  // Destination Never takes them elsewhere
  const leaveRealm = (visit: HomeRealmVisit, jumpTo: (pose: WorldJumpPose) => void) => {
    jumpTo(leaveHomeRealm(visit).pose);
    homeRealmVisit.value = undefined;
  };
  // The pot's gadget takes the player into the realm from where they stand, and out of it to the place they went in
  // From
  const toggleHomeRealm = ({ getGroundHeight, jumpTo, standing }: HomeRealmToggleOptions) => {
    if (homeRealmVisit.value) leaveRealm(homeRealmVisit.value, jumpTo);
    else {
      homeRealmVisit.value = computeHomeRealmVisit(
        standing,
        getGroundHeight(standing.position.x, standing.position.z),
        HOME_STAND_IN_POT_REGION_ID,
      );
      jumpTo(HOME_REALM_SPAWN);
    }
  };
  // A teleport in the open world leaves the realm in place of its destination, and goes where it was sent outside it
  const teleport = (pose: WorldJumpPose, jumpTo: (pose: WorldJumpPose) => void) => {
    if (homeRealmVisit.value) leaveRealm(homeRealmVisit.value, jumpTo);
    else jumpTo(pose);
  };
  return { homePotPoint, homeRealmVisit, placeUsedGadget, teleport, toggleHomeRealm };
};
