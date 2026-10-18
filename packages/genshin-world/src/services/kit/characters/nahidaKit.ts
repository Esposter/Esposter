import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

export const NAHIDA_CHARACTER_ID = 10_000_073;

// Nahida's behaviour: none of her own yet, since her strikes, charged attack, plunges and All Schemes to Know's press and
// Full hold are her record's alone. Tri-Karma Purification, a strike set off by a reaction on a marked enemy, Illusory
// Heart's field with its buffs and Tri-Karma's cooldown, and her passives and constellations are not built
// Constellation 1 needs the Shrine of Maya's elemental tally, which the kit does not build
// Constellation 2 needs Seeds of Skandha and its effects on opponents, which the kit does not build
// Constellation 4 needs the Seeds of Skandha count on nearby opponents, which the kit does not build
// Constellation 6 needs Illusory Heart and Tri-Karma Purification, which the kit does not build
export const createNahidaKitBehaviour = (): KitBehaviour => ({});
