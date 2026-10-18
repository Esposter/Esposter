import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";

// Measured: gcsim v2.47.2 (MIT) tighnari/asc.go, A4: his charged attacks and Fashioner's Tanglevine Shaft gain 0.06% DMG
// For each point of Elemental Mastery, to 60%
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/tighnari/asc.go
const ASCENSION_4 = 4;
const ASCENSION_4_DAMAGE_PER_ELEMENTAL_MASTERY = 0.0006;
const ASCENSION_4_DAMAGE_MAX = 0.6;

export const TIGHNARI_CHARACTER_ID = 10_000_069;

// Tighnari's behaviour: his strikes, charged attack, plunges, Vijnana-Phala Mine and Fashioner's Tanglevine Shaft with its
// Secondary Tanglevine Shaft are his record's alone. From Ascension 4 his charged attack and his burst deal more DMG as his
// Elemental Mastery rises. A1's Elemental Mastery on each Wreath Arrow waits on Vijnana Suffusion's Wreath Arrow, which
// Turns the charged shot into a shot of its own and is not built, as the kit offers no charged variant yet. His
// Constellations are not built
export const createTighnariKitBehaviour = (): KitBehaviour => ({
  getStrikeDamageBonus: ({ attackTag, combatant }) =>
    combatant.ascension >= ASCENSION_4 &&
    (attackTag === AttackTag.ChargedAttack || attackTag === AttackTag.ElementalBurst)
      ? Math.min(
          combatant.attributes.attributeTotalMap[Attribute.ElementalMastery] * ASCENSION_4_DAMAGE_PER_ELEMENTAL_MASTERY,
          ASCENSION_4_DAMAGE_MAX,
        )
      : 0,
});
