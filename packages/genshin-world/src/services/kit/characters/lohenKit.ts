import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

export const LOHEN_CHARACTER_ID = 10_000_129;

// Lohen's behaviour: none of her own, since her strikes, charged attack, plunges and burst's hit are her record's
// Alone. Her skill and passives wait on their hooks, and her record's frames and areas are provisional, read from a
// Borrowed donor's gcsim hitmarks and areas.
export const createLohenKitBehaviour = (): KitBehaviour => ({});
