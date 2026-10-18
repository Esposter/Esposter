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
// A Time Trial Challenge's clock is set to this many seconds when it starts
// Provisional: the wiki gives "X second(s)" and no limit per challenge, and the one challenge in the recording
// The banner reads "Open the chest in 45s" (captures/yt-B_l5b_KXt-o-time-trial-limit.mp4)
export const TIME_TRIAL_CHALLENGE_LIMIT_SECONDS = 45;
// A Time Trial Challenge is solved once this many of its targets are done within its limit
// Provisional: the wiki names each challenge's objective kinds (Aiming, Battling, Traversing) but gives no count per
// Challenge, so one target stands in until a recording counts a challenge's targets
export const TIME_TRIAL_CHALLENGE_TARGET_COUNT = 1;
// A Time Trial Challenge is started by the character standing within this many metres of its marker
// Provisional: a stand-in for the marker's interaction until a recording of a challenge started measures its reach
export const TIME_TRIAL_MARKER_REACH_DISTANCE = 10;
// The chest a solved Time Trial Challenge spawns, at its marker: the Chest page lists Time Trial chests under Common,
// Exquisite and Precious, and Exquisite is the kind the Seelie chest takes, so it stands in here too. The main session
// Confirmed it, provisional until a recording shows the chest
export const TIME_TRIAL_CHEST_KIND = ChestKind.Exquisite;
// A Seelie is followed while the character stands within this many metres of it on the ground
// Provisional: a stand-in until a recording of a Seelie led home measures it, on the Recordings owed list
export const SEELIE_FOLLOW_DISTANCE = 10;
