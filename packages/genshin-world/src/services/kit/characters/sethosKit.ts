import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

import { AttackTag } from "#src/models/combat/AttackTag";

export const SETHOS_CHARACTER_ID = 10_000_097;

// Measured: gcsim v2.47.2 (MIT) sethos/cons.go, Constellation 1 adds 15% CRIT Rate to the Shadowpiercing Shot, which is the
// Fully-charged Aimed Shot, the kit's charged attack
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/sethos/cons.go
const CONSTELLATION_1 = 1;
const CONSTELLATION_1_CRITICAL_RATE = 0.15;

// Sethos's behaviour: his Constellation 1 CRIT Rate on the charged attack, as his record builds the rest of the kit, the
// Fully-charged Aimed Shot its charged Attack. The Thundering Roar's energy regeneration is not read yet, and the buff his
// Burst grants, Dusk Bolts for the Normal attacks, is not built, since a stance has no charged attack for the buff to
// Replace, and gcsim's Aimed Shot cannot be aimed under it
// Constellation 2 needs the Electro DMG Bonus stacks on his conditions, which the kit does not build
// Constellation 4 needs Shadowpiercing Shot and Dusk Bolt hits on two opponents, which the kit does not read
// Constellation 6 needs the Black Kite's Enigma Elemental Energy return, which the kit does not build
export const createSethosKitBehaviour = (): KitBehaviour => ({
  getStrikeCriticalRateBonus: ({ attackTag, combatant }) =>
    combatant.constellationCount >= CONSTELLATION_1 && attackTag === AttackTag.ChargedAttack
      ? CONSTELLATION_1_CRITICAL_RATE
      : 0,
});
