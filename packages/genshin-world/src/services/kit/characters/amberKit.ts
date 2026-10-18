import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Attribute } from "#src/models/character/Attribute";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { castKitTaunt } from "#src/services/kit/effects/castKitTaunt";

// Ascension 1, Every Arrow Finds Its Target, adds 10% CRIT Rate to Fiery Rain, and widens its arrows by 30% as gcsim
// V2.47.2 (MIT) amber/burst.go gives it
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/amber/burst.go
const EVERY_ARROW_FINDS_ITS_TARGET_ASCENSION = 1;
const EVERY_ARROW_FINDS_ITS_TARGET_CRITICAL_RATE = 0.1;
const EVERY_ARROW_FINDS_ITS_TARGET_RADIUS_SHARE = 0.3;
// Constellation 4, It's Not Just Any Doll: Explosive Puppet's cooldown is cut by 20% and it gains a charge
const CONSTELLATION_4 = 4;
const CONSTELLATION_4_SKILL_COOLDOWN_MULTIPLIER = 0.8;

// Ascension 1's CRIT Rate on Fiery Rain, priced by the combatant that cast it
const addEveryArrowCriticalRate = (combatant: Combatant): Combatant => {
  const { attributeTotalMap } = combatant.attributes;
  return {
    ...combatant,
    attributes: {
      ...combatant.attributes,
      attributeTotalMap: {
        ...attributeTotalMap,
        [Attribute.CriticalRate]:
          attributeTotalMap[Attribute.CriticalRate] + EVERY_ARROW_FINDS_ITS_TARGET_CRITICAL_RATE,
      },
    },
  };
};

// Ascension 1's arrows are the base arrows with each radius widened, as gcsim scales the burst's radius at Ascension 1
const widenFieryRainArrows = (arrows: KitHit[]): KitHit[] =>
  arrows.map((arrow) => ({
    ...arrow,
    hitArea: { ...arrow.hitArea, radius: arrow.hitArea.radius * (1 + EVERY_ARROW_FINDS_ITS_TARGET_RADIUS_SHARE) },
  }));

export const AMBER_CHARACTER_ID = 10_000_021;

// Amber's behaviour: Explosive Puppet's Baron Bunny, which draws the enemies' strikes and explodes, and Fiery Rain's
// Arrows, a summon's hits landing from where Amber cast it, with Ascension 1's CRIT Rate and wider arrows. The aimed shot's
// Unlit form, the bow's aim binding and Amber's Ascension 4 weak-point ATK bonus are not built, so the charged attack is
// The full shot. Constellations 1, 2 and 6 are not built: 1's second arrow is an extra hit on the charged attack, which waits
// On the shared extra hit a passive owns, not yet held for a charged attack; 2's manual detonation waits on the charged attack
// Landed on the bunny's foot, a shared event not yet reported; and 6's Movement SPD waits on the movement SPD attribute, which
// The Attribute enum lacks, so its ATK half waits with it
export const createAmberKitBehaviour = ({
  readHit,
  readHits,
  readParameter,
  readSeconds,
}: KitRecordReader): KitBehaviour => {
  const bunnyExplosion = readHit("baronBunnyExplosion");
  // Baron Bunny's HP is the table's share of Amber's Max HP
  const bunnyMaxHealthShare = readParameter("baronBunnyMaxHealthShare");
  const bunnySeconds = readSeconds("baronBunnySeconds");
  const fieryRainArrows = readHits("fieryRainArrows");
  const everyArrowFindsItsTargetFieryRainArrows = widenFieryRainArrows(fieryRainArrows);

  return {
    getSkillChargeBonus: (combatant) => (combatant.constellationCount >= CONSTELLATION_4 ? 1 : 0),
    getSkillCooldownMultiplier: ({ activeCombatant }) =>
      activeCombatant.constellationCount >= CONSTELLATION_4 ? CONSTELLATION_4_SKILL_COOLDOWN_MULTIPLIER : 1,
    burst: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        const hasEveryArrowFindsItsTarget = combatant.ascension >= EVERY_ARROW_FINDS_ITS_TARGET_ASCENSION;
        castKitSummon(
          kitEffectState,
          body,
          hasEveryArrowFindsItsTarget ? addEveryArrowCriticalRate(combatant) : combatant,
          hasEveryArrowFindsItsTarget ? everyArrowFindsItsTargetFieryRainArrows : fieryRainArrows,
        );
      },
    },
    skill: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) =>
        castKitTaunt(kitEffectState, body, combatant, {
          explosion: bunnyExplosion,
          health: bunnyMaxHealthShare * combatant.attributes.maxHealth,
          secondsRemaining: bunnySeconds,
        }),
    },
  };
};
