import type { HomeRealmVisit } from "#src/models/home/HomeRealmVisit";

// The place the player is returned to on leaving the realm, by the gadget or a teleport in the open world: the place
// They went in from, so a teleport's own destination never takes them elsewhere
export const leaveHomeRealm = (visit: HomeRealmVisit): HomeRealmVisit => visit;
