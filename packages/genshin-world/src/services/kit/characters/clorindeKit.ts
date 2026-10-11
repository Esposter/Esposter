import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

export const CLORINDE_CHARACTER_ID = 10_000_098;

// Clorinde's behaviour: none of her own, since her strikes, charged attack, plunges and Last Lightfall are her record's
// Alone, and Hunter's Vigil's press plays its animation and starts its cooldown with no hit of its own. Not built: the
// Night Vigil stance the press starts, with its Swift Hunt, Impale the Night and Surging Blade, and Last Lightfall's Bond
// Of Life. Her passives and constellations are not built either
export const createClorindeKitBehaviour = (): KitBehaviour => ({});
