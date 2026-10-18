import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

export const LOHEN_CHARACTER_ID = 10_000_129;

// Lohen's behaviour: none of her own, since her strikes, charged attack, plunges and burst's hit are her record's
// Alone. Her skill and passives wait on their hooks, and her record's frames and areas are provisional, read from a
// Borrowed donor's gcsim hitmarks and areas.
// Constellation 1 needs Will to Win from Masterstroke, which the kit does not build
// Constellation 2 needs Masterstroke's Cryo infusion and Joy, which the kit does not build
// Constellation 4 needs Manifest Judgment's Masterstroke effect, which waits on Masterstroke, not built
// Constellation 6 needs Etched Into Bone, the skill that spends Joy and Will to Win, which the kit does not build
export const createLohenKitBehaviour = (): KitBehaviour => ({});
