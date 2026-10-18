import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

export const FREMINET_CHARACTER_ID = 10_000_085;

// Freminet's behaviour: none of his own, since his strikes, charged attack, plunges, Pressurized Floe's Upward Thrust and
// Shadowhunter's Ambush's strike are his record's alone. Not built yet: Pressurized Floe's Pers Time stance, which holds
// The frost of each strike, the stacks it gains, and the Detonation that takes its place on the skill's next press, waits
// On a stance that counts its stacks. Spiritbreath Thorn hits past the skill's animation, so it waits on a timed hit.
// Shadowhunter's Ambush's stalking state, its skill cooldown lowered to three seconds and its reset of the skill's
// Cooldown wait on a status that outlives the action. His passives and constellations are not built
// Constellation 1 needs Shattering Pressure's CRIT Rate, which the skill does not build yet
// Constellation 2 needs Shattering Pressure's energy at Pressure Level 4, which the skill does not build yet
// Constellation 4 needs his Frozen, Shatter and Superconduct reactions and a stacked ATK buff, neither built
// Constellation 6 needs those reactions and a stacked CRIT DMG buff of up to three stacks, which are not built
export const createFreminetKitBehaviour = (): KitBehaviour => ({});
