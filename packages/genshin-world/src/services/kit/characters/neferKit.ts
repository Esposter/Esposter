import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

export const NEFER_CHARACTER_ID = 10_000_122;

// Nefer's behaviour: none of her own, since her strikes, charged attack, plunges and burst's hit are her record's
// Alone. Her skill and passives wait on their hooks, and her record's frames and areas are provisional, read from
// Borrowed donors' gcsim hitmarks and areas.
// Constellation 1 needs the Lunar-Bloom base DMG and the Shadow Dance Charged Attack, which the kit does not build
// Constellation 2 needs the Ascension talent A Wager of Moonlight's Veil of Falsehood, which the kit does not build
// Constellation 4 needs the Shadow Dance Charged Attack with Verdant Dew, which the kit does not build
// Constellation 6 needs the Shadow Dance Charged Attack and Phantasm Performance, which the kit does not build
export const createNeferKitBehaviour = (): KitBehaviour => ({});
