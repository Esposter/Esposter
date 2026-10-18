import { ChestKind } from "#src/models/chest/ChestKind";

// A timed monument goes out this many seconds after it was last lit
// Provisional: a recording of a timed monument going out, on the Recordings owed list, until then the wiki gives no time
export const ELEMENTAL_MONUMENT_LIT_SECONDS = 60;
// The chest a Seelie settled in its court spawns: the Seelie page's general rule gives the chest on settling but names no
// Kind, so a court takes the Exquisite Chest the Chest page lists for it, as the puzzles design decides
export const SEELIE_CHEST_KIND = ChestKind.Exquisite;
// A Seelie led along its route goes back to where it rests once it has not been followed this many seconds
// Provisional: a recording of a Seelie left behind, on the Recordings owed list, until then the wiki gives no time
export const SEELIE_RETURN_SECONDS = 30;
// A Seelie followed the whole of its route takes this many seconds to reach its court
// Provisional: the route's walk measured from a recording, on the Recordings owed list, until then a stand-in pace
export const SEELIE_ROUTE_SECONDS = 20;
// A Seelie is followed while the character stands within this many metres of it on the ground
// Provisional: a stand-in until a recording of a Seelie led home measures it, on the Recordings owed list
export const SEELIE_FOLLOW_DISTANCE = 10;
