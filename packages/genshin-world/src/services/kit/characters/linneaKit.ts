import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

export const LINNEA_CHARACTER_ID = 10_000_130;

// Linnea's behaviour: none of her own, since her strikes, charged attack, plunges and burst's hit are her record's
// Alone. Her skill and passives wait on their hooks, and her record's frames and areas are provisional, read from a
// Borrowed donor's gcsim hitmarks and areas.
// Constellation 1 needs Field Catalog stacks from Countermeasure and Moondrift Harmony, which the kit does not build
// Constellation 2 needs Moondrift Harmony's CRIT DMG buff on Hydro and Geo members, which the kit does not build
// Constellation 4 needs Moondrift Harmony's DEF buffs on Linnea and the active character, which the kit does not build
// Constellation 6 needs the enhanced Field Catalog, which fills to its maximum and doubles its use, not built
export const createLinneaKitBehaviour = (): KitBehaviour => ({});
