import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

export const WRIOTHESLEY_CHARACTER_ID = 10_000_086;

// Wriothesley's behaviour: none of his own, since his strikes, charged attack, plunges, Icefang Rush and Darkgold
// Wolfbite's strikes are his record's alone. Not built yet: Icefang Rush's enhanced normal attacks, the strike multiplied by
// The skill's enhancement, their Chilling Penalty drain and their particles. Both wait on the wearer's HP, which a kit's
// Combatant does not carry, and the enhancement ends when the skill's ten seconds do or the wearer swaps off. Darkgold
// Wolfbite's Surging Blade hits past the burst's animation, so it waits on a timed hit. The charged attack's ascension and
// Constellation boxes are not built, nor are his passives and constellations
// Constellation 1 needs the Gracious Rebuke's change, which waits on the wearer's HP that a kit does not read
// Constellation 2 needs the Prosecution Edict stacks on Darkgold Wolfbite, which the kit does not build
// Constellation 4 needs the Rebuke: Vaulting Fist heal and its healed-amount effect, which the kit does not build
// Constellation 6 needs Rebuke: Vaulting Fist's CRIT bonus and its extra icicle, which the kit does not build
export const createWriothesleyKitBehaviour = (): KitBehaviour => ({});
