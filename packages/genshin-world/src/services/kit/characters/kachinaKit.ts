import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

export const KACHINA_CHARACTER_ID = 10_000_100;

// Kachina's behaviour: none of her own, since her strikes, charged attack, plunges and burst's hit are her record's
// alone. Her skill's Turbo Twirly, her Nightsoul's Blessing and her passives wait on their hooks, and her record's
// frames and areas are provisional, read from Xiangling's gcsim hitmarks and the clips' durations.
export const createKachinaKitBehaviour = (): KitBehaviour => ({});
