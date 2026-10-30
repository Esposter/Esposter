import { GameTextKey } from "genshin-text";

// The last floor on the short clock, the fourth of the Abyss Corridor. Every floor above it gives its chambers the long clock
export const ABYSS_SHORT_CLOCK_LAST_FLOOR_INDEX = 4;
// The seconds a chamber's clock runs on a short-clock floor and on any other, as the wiki's Spiral Abyss page gives them.
// Provisional until a recording measures a chamber's clock at its clear
export const ABYSS_SHORT_CLOCK_SECONDS = 300;
export const ABYSS_LONG_CLOCK_SECONDS = 600;
// The last floor of the Abyss Corridor, the eighth. Every floor above it is the Abyssal Moon Spire's, whose period gives its blessing
export const ABYSS_CORRIDOR_LAST_FLOOR_INDEX = 8;
// A floor's chambers, each paying its first clear's reward, and its star milestones at 3, 6 and 9 stars
export const ABYSS_FLOOR_CHAMBER_COUNT = 3;
export const ABYSS_STAR_MILESTONE_COUNT = 3;
// The rewards one cycle can claim: each floor's chambers and milestones over the Corridor's eight floors, the most any
// Cycle holds, as a Moon Spire period holds four
export const MAX_ABYSS_CYCLE_REWARD_CLAIM_COUNT =
  ABYSS_CORRIDOR_LAST_FLOOR_INDEX * (ABYSS_FLOOR_CHAMBER_COUNT + ABYSS_STAR_MILESTONE_COUNT);

// The key the Corridor's progress is saved under, the one cycle that never resets; a Moon Spire period is saved under its id
export const ABYSS_CORRIDOR_CYCLE_KEY = "corridor";
// The reward group the Corridor's floors pay from. Its floors 1 to 8 give the same rewards in groups 1, 2 and 13, so
// The group read changes none
export const ABYSS_CORRIDOR_REWARD_GROUP = 1;
// The Adventure Rank the Abyss opens at, as the wiki's Spiral Abyss page gives it
export const ABYSS_OPEN_ADVENTURE_RANK = 20;
// A Ley Line Monolith starts at full health, and a chamber with none has no percent at all
export const ABYSS_MONOLITH_FULL_PERCENT = 100;
// The Spiral Abyss's entrance, which the Moon Spire's screen opens from on the key. It stands at the centre of Cape Oath's
// Outline in the catalogue, provisionally, until the wormhole's own place is read from the game's scene export
export const ABYSS_ENTRANCE_INTERACTABLE_ID = "spiralAbyss";
export const ABYSS_ENTRANCE_POSITION = { x: -483.6, z: 719.2 };
// The game's text key for each scope's tag, the chamber's or the floor's, which a Benediction's tag reads by its scope
export const SCOPE_TEXT_KEYS = {
  chamber: GameTextKey.AbyssBenedictionEffectiveChamber,
  floor: GameTextKey.AbyssBenedictionEffectiveFloor,
} as const;
