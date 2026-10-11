import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

export const ARLECCHINO_CHARACTER_ID = 10_000_096;

// Arlecchino's behaviour: none of her own, since her six strikes, charged attack, plunges, All Is Ash's Spike and Cleave
// And Balemoon Rising are her record's alone. The Bond of Life's Pyro variant of each strike, Blood-Debt Directive, the
// Skill's cooldown reset by the burst, her passives and her constellations are not built
export const createArlecchinoKitBehaviour = (): KitBehaviour => ({});
