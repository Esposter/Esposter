import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";

// Measured: gcsim v2.47.2 (MIT) tighnari/asc.go, A4: his charged attacks and Fashioner's Tanglevine Shaft gain 0.06% DMG
// For each point of Elemental Mastery, to 60%
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/tighnari/asc.go
const ASCENSION_4 = 4;
const ASCENSION_4_DAMAGE_PER_ELEMENTAL_MASTERY = 0.0006;
const ASCENSION_4_DAMAGE_MAX = 0.6;
const CONSTELLATION_1 = 1;
const CONSTELLATION_1_CRIT_RATE_BONUS = 0.15;

export const TIGHNARI_CHARACTER_ID = 10_000_069;

// Tighnari's behaviour: his strikes, charged attack, plunges, Vijnana-Phala Mine and Fashioner's Tanglevine Shaft with its
// Secondary Tanglevine Shaft are his record's alone. From Ascension 4 his charged attack and his burst deal more DMG as his
// Elemental Mastery rises. A1's Elemental Mastery on each Wreath Arrow waits on Vijnana Suffusion's Wreath Arrow, which
// Turns the charged shot into a shot of its own and is not built, as the kit offers no charged variant yet. His
// Constellation 1's charged CRIT Rate is built; his other Constellations are not built
// Constellation 2 needs the Vijnana-Phala Mine's field and the opponents within it, which the kit does not read
// Constellation 4 needs the Fashioner's Tanglevine Shaft's party Elemental Mastery buff, which the kit does not build
// Constellation 6 needs the Wreath Arrow's shorter charge and its Clusterbloom Arrow, which the kit does not build
export const createTighnariKitBehaviour = (): KitBehaviour => ({
  // Beginnings Determined at the Roots, from Constellation 1: his charged attacks crit 15% more often
  getStrikeCriticalRateBonus: ({ attackTag, combatant }) =>
    combatant.constellationCount >= CONSTELLATION_1 && attackTag === AttackTag.ChargedAttack
      ? CONSTELLATION_1_CRIT_RATE_BONUS
      : 0,
  getStrikeDamageBonus: ({ attackTag, combatant }) =>
    combatant.ascension >= ASCENSION_4 &&
    (attackTag === AttackTag.ChargedAttack || attackTag === AttackTag.ElementalBurst)
      ? Math.min(
          combatant.attributes.attributeTotalMap[Attribute.ElementalMastery] * ASCENSION_4_DAMAGE_PER_ELEMENTAL_MASTERY,
          ASCENSION_4_DAMAGE_MAX,
        )
      : 0,
});
