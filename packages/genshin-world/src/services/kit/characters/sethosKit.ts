import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

export const SETHOS_CHARACTER_ID = 10_000_097;

// Sethos's behaviour: none of his own, as his record builds the whole kit, the fully-charged Aimed Shot its charged
// Attack. The Thundering Roar's energy regeneration is not read yet, and the buff his burst grants, Dusk Bolts for the
// Normal attacks, is not built, since a stance has no charged attack for the buff to replace, and gcsim's Aimed Shot cannot
// Be aimed under it
// Constellation 1 needs a CRIT Rate bonus on the Shadowpiercing Shot's strikes, which the kit does not build
// Constellation 2 needs the Electro DMG Bonus stacks on his conditions, which the kit does not build
// Constellation 4 needs Shadowpiercing Shot and Dusk Bolt hits on two opponents, which the kit does not read
// Constellation 6 needs the Black Kite's Enigma Elemental Energy return, which the kit does not build
export const createSethosKitBehaviour = (): KitBehaviour => ({});
