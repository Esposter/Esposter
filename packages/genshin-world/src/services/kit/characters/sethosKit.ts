import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

export const SETHOS_CHARACTER_ID = 10_000_097;

// Sethos's behaviour: none of his own, as his record builds the whole kit, the fully-charged Aimed Shot its charged
// Attack. The Thundering Roar's energy regeneration is not read yet, and the buff his burst grants, Dusk Bolts for the
// Normal attacks, is not built, since a stance has no charged attack for the buff to replace, and gcsim's Aimed Shot cannot
// Be aimed under it
export const createSethosKitBehaviour = (): KitBehaviour => ({});
