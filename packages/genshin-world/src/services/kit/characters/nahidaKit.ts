import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

export const NAHIDA_CHARACTER_ID = 10_000_073;

// Nahida's behaviour: none of her own yet, since her strikes, charged attack, plunges and All Schemes to Know's press and
// Full hold are her record's alone. Tri-Karma Purification, a strike set off by a reaction on a marked enemy, Illusory
// Heart's field with its buffs and Tri-Karma's cooldown, and her passives and constellations are not built
export const createNahidaKitBehaviour = (): KitBehaviour => ({});
