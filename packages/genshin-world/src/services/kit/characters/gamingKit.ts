import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

export const GAMING_CHARACTER_ID = 10_000_092;

// Gaming's behaviour: none of his own, since his strikes, charged attack, plunges, Bestial Ascent and Suanni's Gilded
// Dance's strike are his record's alone. Bestial Ascent's Charmed Cloudstrider plunge, which the kit has no plunge variant
// To hold, Suanni's Gilded Dance's heal, his passives and his constellations are not built
export const createGamingKitBehaviour = (): KitBehaviour => ({});
