import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

export const ARLECCHINO_CHARACTER_ID = 10_000_096;

// Arlecchino's behaviour: none of her own, since her six strikes, charged attack, plunges, All Is Ash's Spike and Cleave
// And Balemoon Rising are her record's alone. The Bond of Life's Pyro variant of each strike, Blood-Debt Directive, the
// Skill's cooldown reset by the burst and her passives are not built. Constellations 1, 2 and 4 each need a Blood-Debt
// Directive's absorption or the Masque of the Red Death, which the kit does not record: Constellation 1 enhances the
// Masque and its interruption resistance, Constellation 2 unleashes Balemoon Bloodfire on each absorption, and
// Constellation 4 cuts Balemoon Rising's cooldown and restores energy on one. Constellation 6 needs Bond of Life's
// Percentage, which the kit does not hold, for Balemoon Rising's added damage and her attacks' Crit Rate after All Is Ash
export const createArlecchinoKitBehaviour = (): KitBehaviour => ({});
