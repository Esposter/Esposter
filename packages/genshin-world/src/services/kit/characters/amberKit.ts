import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Attribute } from "#src/models/character/Attribute";
import { buffKitTeam } from "#src/services/kit/effects/buffKitTeam";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { castKitTaunt } from "#src/services/kit/effects/castKitTaunt";
import { queueKitPassiveHit } from "#src/services/kit/queueKitPassiveHit";

// Ascension 1, Every Arrow Finds Its Target, adds 10% CRIT Rate to Fiery Rain, and widens its arrows by 30% as gcsim
// V2.47.2 (MIT) amber/burst.go gives it
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/amber/burst.go
const EVERY_ARROW_FINDS_ITS_TARGET_ASCENSION = 1;
const EVERY_ARROW_FINDS_ITS_TARGET_CRITICAL_RATE = 0.1;
const EVERY_ARROW_FINDS_ITS_TARGET_RADIUS_SHARE = 0.3;
// Constellation 4, It's Not Just Any Doll: Explosive Puppet's cooldown is cut by 20% and it gains a charge
const CONSTELLATION_4 = 4;
const CONSTELLATION_4_SKILL_COOLDOWN_MULTIPLIER = 0.8;
// Constellation 1, Wildfire: the first arrow's hit adds a second arrow of a fifth of its DMG, once per aimed shot
const CONSTELLATION_1 = 1;
const CONSTELLATION_1_SECOND_ARROW_SHARE = 0.2;
// Constellation 6, Fiery Rain: each party member gains 15% Movement SPD and 15% ATK for 10 seconds
const CONSTELLATION_6 = 6;
const CONSTELLATION_6_SHARE = 0.15;
const CONSTELLATION_6_SECONDS = 10;
const FIERY_RAIN_SOURCE = "amber-fiery-rain";

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
// The full shot. Constellations 1, 4 and 6 are built. Constellation 2 is not: its manual detonation needs a charged attack that reports the
// Bunny it lands on, and ChargedAttackLanded names no target, while the taunt's damage has no caller, so no shot reaches it
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
  // Constellation 1's second arrow is made once per aimed shot, which its start clears
  let secondArrowFired = false;

  return {
    getSkillChargeBonus: (combatant) => (combatant.constellationCount >= CONSTELLATION_4 ? 1 : 0),
    getSkillCooldownMultiplier: ({ activeCombatant }) =>
      activeCombatant.constellationCount >= CONSTELLATION_4 ? CONSTELLATION_4_SKILL_COOLDOWN_MULTIPLIER : 1,
    // Constellation 1: the first arrow's hit queues a second arrow once per shot, however many opponents it strikes
    chargedAttack: {
      hits: [
        {
          onStrike: (context, { combatant, hit }) => {
            if (combatant.constellationCount < CONSTELLATION_1 || secondArrowFired) return;
            secondArrowFired = true;
            queueKitPassiveHit(context, combatant, {
              ...hit,
              attackTag: undefined,
              onStrike: undefined,
              talentMultiplier: hit.talentMultiplier * CONSTELLATION_1_SECOND_ARROW_SHARE,
            });
          },
        },
      ],
      onStart: () => {
        secondArrowFired = false;
      },
    },
    burst: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState, party }) => {
        const hasEveryArrowFindsItsTarget = combatant.ascension >= EVERY_ARROW_FINDS_ITS_TARGET_ASCENSION;
        castKitSummon(
          kitEffectState,
          body,
          hasEveryArrowFindsItsTarget ? addEveryArrowCriticalRate(combatant) : combatant,
          hasEveryArrowFindsItsTarget ? everyArrowFindsItsTargetFieryRainArrows : fieryRainArrows,
        );
        // Constellation 6: each deployed member gains Movement SPD and ATK while Fiery Rain falls
        if (combatant.constellationCount >= CONSTELLATION_6) {
          const buff = {
            amount: CONSTELLATION_6_SHARE,
            secondsRemaining: CONSTELLATION_6_SECONDS,
            source: FIERY_RAIN_SOURCE,
          };
          buffKitTeam(kitEffectState, party, { ...buff, attribute: Attribute.MovementSpeed });
          buffKitTeam(kitEffectState, party, { ...buff, attribute: Attribute.AttackPercent });
        }
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
