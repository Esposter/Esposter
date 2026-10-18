import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { ReactionType } from "#src/models/combat/ReactionType";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { buffKitTeam } from "#src/services/kit/effects/buffKitTeam";

// Measured: gcsim v2.47.2 (MIT) tighnari/asc.go, A4: his charged attacks and Fashioner's Tanglevine Shaft gain 0.06% DMG
// For each point of Elemental Mastery, to 60%
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/tighnari/asc.go
const ASCENSION_4 = 4;
const ASCENSION_4_DAMAGE_PER_ELEMENTAL_MASTERY = 0.0006;
const ASCENSION_4_DAMAGE_MAX = 0.6;
const CONSTELLATION_1 = 1;
const CONSTELLATION_1_CRIT_RATE_BONUS = 0.15;
// Measured: gcsim v2.47.2 (MIT) tighnari/cons.go, Constellation 4: as his burst is cast, every member gains 60 Elemental
// Mastery for 8 seconds, raised to 120 for 8 seconds, refreshing the buff, when the burst triggers a Burning, Bloom,
// Lunar-Bloom, Quicken or Spread reaction
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/tighnari/cons.go
const CONSTELLATION_4 = 4;
const CONSTELLATION_4_ELEMENTAL_MASTERY_BONUS = 60;
const CONSTELLATION_4_RAISED_ELEMENTAL_MASTERY_BONUS = 120;
const CONSTELLATION_4_SECONDS = 8;
const CONSTELLATION_4_SOURCE = "tighnari-constellation-4";
const CONSTELLATION_4_RAISING_REACTIONS: ReadonlySet<ReactionType> = new Set([
  ReactionType.Bloom,
  ReactionType.Burning,
  ReactionType.LunarBloom,
  ReactionType.Quicken,
  ReactionType.Spread,
]);

export const TIGHNARI_CHARACTER_ID = 10_000_069;

// Tighnari's behaviour: his strikes, charged attack, plunges, Vijnana-Phala Mine and Fashioner's Tanglevine Shaft with its
// Secondary Tanglevine Shaft are his record's alone. From Ascension 4 his charged attack and his burst deal more DMG as his
// Elemental Mastery rises. A1's Elemental Mastery on each Wreath Arrow waits on Vijnana Suffusion's Wreath Arrow, which
// Turns the charged shot into a shot of its own and is not built, as the kit offers no charged variant yet. His
// Constellation 1's charged CRIT Rate and Constellation 4's team Elemental Mastery, raised by his burst's reactions, are built;
// his other Constellations are not
// Constellation 2 needs the Vijnana-Phala Mine's field, centred on the primary target, which the kit context does not name
// Constellation 6 needs the Wreath Arrow's shorter charge and its Clusterbloom Arrow, which the kit does not build
export const createTighnariKitBehaviour = (): KitBehaviour => ({
  // Constellation 4: as the burst is cast, every member gains Elemental Mastery for 8 seconds
  burst: {
    onStart: ({ activeCombatant: combatant, kitEffectState, party }) => {
      if (combatant.constellationCount < CONSTELLATION_4) return;
      buffKitTeam(kitEffectState, party, {
        amount: CONSTELLATION_4_ELEMENTAL_MASTERY_BONUS,
        attribute: Attribute.ElementalMastery,
        secondsRemaining: CONSTELLATION_4_SECONDS,
        source: CONSTELLATION_4_SOURCE,
      });
    },
  },
  // Constellation 4: a reaction the burst triggers raises every member's Elemental Mastery to 120, refreshing its 8 seconds
  onKitEvent: (event, { kitEffectState, party }, combatant) => {
    if (
      event.kind !== KitEventKind.ReactionTriggered ||
      event.attackTag !== AttackTag.ElementalBurst ||
      combatant.constellationCount < CONSTELLATION_4 ||
      event.striker.characterId !== combatant.characterId ||
      !event.reactions.some(({ reactionType }) => CONSTELLATION_4_RAISING_REACTIONS.has(reactionType))
    )
      return;
    buffKitTeam(kitEffectState, party, {
      amount: CONSTELLATION_4_RAISED_ELEMENTAL_MASTERY_BONUS,
      attribute: Attribute.ElementalMastery,
      secondsRemaining: CONSTELLATION_4_SECONDS,
      source: CONSTELLATION_4_SOURCE,
    });
  },
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
