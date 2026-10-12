import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

export const ZIBAI_CHARACTER_ID = 10_000_126;

// Zibai's behaviour: none of her own, since her strikes, charged attack, plunges and burst's hit are her record's
// alone. Her skill and passives wait on their hooks, and her record's frames and areas are provisional, read from a
// borrowed donor's gcsim hitmarks and areas.
export const createZibaiKitBehaviour = (): KitBehaviour => ({});
