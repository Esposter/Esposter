import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

export const YAOYAO_CHARACTER_ID = 10_000_077;

// Yaoyao's behaviour: none of her own yet, since her strikes, charged attack, plunges, Raphanus Sky Cluster's cast and
// Moonjade Descent's initial hit are her record's alone. The Yuegui her skill throws, its radishes and their healing, the
// Yuegui her burst throws, and her passives and constellations are not built
// Constellation 1 needs the White Jade Radish explosion as an event, which the kit does not emit
// Constellation 2 needs the Adeptal Legacy state and the radish explosion damage, which the kit does not build
// Constellation 4 needs an Elemental Mastery bonus from 0.3% of her Max HP, which the kit does not build
// Constellation 6 needs the Yuegui throw's Mega Radish every two radishes, which the kit does not build
export const createYaoyaoKitBehaviour = (): KitBehaviour => ({});
