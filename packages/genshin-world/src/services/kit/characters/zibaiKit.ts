import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

export const ZIBAI_CHARACTER_ID = 10_000_126;

// Zibai's behaviour: none of her own, since her strikes, charged attack, plunges and burst's hit are her record's
// Alone. Her skill and passives wait on their hooks, and her record's frames and areas are provisional, read from a
// Borrowed donor's gcsim hitmarks and areas.
// Constellation 1 needs Heaven and Earth Made Manifest's effects, which the kit does not build
// Constellation 2 needs the Lunar Phase Shift's effects, which the kit does not build
// Constellation 4 needs the Lunar Phase Shift's effects, which the kit does not build
// Constellation 6 needs the Lunar Phase Shift's effects, which the kit does not build
export const createZibaiKitBehaviour = (): KitBehaviour => ({});
