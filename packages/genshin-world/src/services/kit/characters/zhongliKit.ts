import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitHitBehaviour } from "#src/models/kit/KitHitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { Element, Elements } from "#src/models/Element";
import { KitPlunge } from "#src/models/kit/record/KitPlunge";
import { FIXED_STEP_SECONDS } from "#src/services/constants";
import { createAheadBody } from "#src/services/kit/createAheadBody";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitShield } from "#src/services/kit/effects/castKitShield";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { removeKitEffects } from "#src/services/kit/effects/removeKitEffects";
import { scheduleKitTask } from "#src/services/kit/effects/scheduleKitTask";
import { takeOne } from "@esposter/shared";

// A Stone Stele stands 3 metres ahead of Zhongli, as gcsim v2.47.2 (MIT) zhongli/stele.go places it
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/zhongli/stele.go
const STELE_OFFSET = 3;
// One Stone Stele stands at a time, as the wiki's Dominus Lapidis and gcsim v2.47.2 (MIT) zhongli/zhongli.go give it, and
// Rock, the Backbone of Earth, from one constellation, lets 2 stand
// https://genshin-impact.fandom.com/wiki/Rock,_the_Backbone_of_Earth
const STELE_COUNT = 1;
const ROCK_THE_BACKBONE_OF_EARTH_CONSTELLATION = 1;
const ROCK_THE_BACKBONE_OF_EARTH_STELE_COUNT = 2;
// The Jade Shield cuts every Elemental RES and the Physical RES of the enemies it reaches by 20%, for 60 frames from each
// Cut, as gcsim v2.47.2 (MIT) zhongli/shield.go gives it
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/zhongli/shield.go
const JADE_SHIELD_RESISTANCE_REDUCTION = 0.2;
const JADE_SHIELD_STATUS: EnemyStatus = {
  damageTakenBonus: 0,
  id: "zhongli-jade-shield",
  physicalResistanceReduction: JADE_SHIELD_RESISTANCE_REDUCTION,
  resistanceReduction: Object.fromEntries(Elements.map((element) => [element, JADE_SHIELD_RESISTANCE_REDUCTION])),
  secondsRemaining: 1,
};
// Planet Befall's meteor lands 5 metres ahead of Zhongli, as gcsim v2.47.2 (MIT) zhongli/burst.go places it
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/zhongli/burst.go
const METEOR_OFFSET = 5;
// Dominance of Earth, from Ascension 4, adds 1.39% of Zhongli's Max HP to the damage of his normal, charged and plunging
// Attacks, 1.9% to a Stone Stele's, its resonance's and the hold's, and 33% to Planet Befall's, as Additive Base DMG
// Bonus, as the wiki's passive page and gcsim v2.47.2 (MIT) zhongli/asc.go give it
// https://genshin-impact.fandom.com/wiki/Dominance_of_Earth
const DOMINANCE_OF_EARTH_ASCENSION = 4;
const DOMINANCE_OF_EARTH_ATTACK_SHARE = 0.0139;
const DOMINANCE_OF_EARTH_SKILL_SHARE = 0.019;
const DOMINANCE_OF_EARTH_BURST_SHARE = 0.33;
// Stone, the Cradle of Jade, from two constellations, casts a Jade Shield as Planet Befall starts, where gcsim v2.47.2
// (MIT) zhongli/burst.go casts it, and the wiki's constellation page has it as the meteor descends
// https://genshin-impact.fandom.com/wiki/Stone,_the_Cradle_of_Jade
const STONE_THE_CRADLE_OF_JADE_CONSTELLATION = 2;
// Topaz, Unbreakable and Fearless, from four constellations, widens Planet Befall's AoE by 20%, as the wiki's
// Constellation page and gcsim v2.47.2 (MIT) zhongli/burst.go give it
// https://genshin-impact.fandom.com/wiki/Topaz,_Unbreakable_and_Fearless
const TOPAZ_UNBREAKABLE_AND_FEARLESS_CONSTELLATION = 4;

// Dominance of Earth's bonus to a hit: from Ascension 4, the given share of its striker's Max HP
const createDominanceOfEarthBehaviour = (maxHealthShare: number): KitHitBehaviour => ({
  additiveBaseDamageBonus: (combatant) =>
    combatant.ascension < DOMINANCE_OF_EARTH_ASCENSION ? 0 : maxHealthShare * combatant.attributes.maxHealth,
});

// The most Stone Steles that may stand at once
const getMaxSteleCount = ({ constellationCount }: Combatant): number =>
  constellationCount >= ROCK_THE_BACKBONE_OF_EARTH_CONSTELLATION ? ROCK_THE_BACKBONE_OF_EARTH_STELE_COUNT : STELE_COUNT;

export const ZHONGLI_CHARACTER_ID = 10_000_030;

// Zhongli's behaviour: Dominance of Earth's share of his Max HP on his attacks, steles, hold and meteor from Ascension 4.
// Dominus Lapidis' press casts a Stone Stele ahead of him, replacing the newest once the most stand, and its hold casts
// One unless the most stand and its Jade Shield at its hitmark. Planet Befall casts its meteor ahead of him, wider from
// Four constellations, and from two a Jade Shield
// Constellation 6 needs the Jade Shield's damage converted to HP for the current character, not built
export const createZhongliKitBehaviour = ({
  kit,
  readHit,
  readHits,
  readParameter,
  readSeconds,
}: KitRecordReader): KitBehaviour => {
  const attackHitBehaviour = createDominanceOfEarthBehaviour(DOMINANCE_OF_EARTH_ATTACK_SHARE);
  const skillHitBehaviour = createDominanceOfEarthBehaviour(DOMINANCE_OF_EARTH_SKILL_SHARE);
  const burstHitBehaviour = createDominanceOfEarthBehaviour(DOMINANCE_OF_EARTH_BURST_SHARE);
  const shieldFlatHealth = readParameter("shieldFlatHealth");
  const shieldMaxHealthShare = readParameter("shieldMaxHealthShare");
  const shieldSeconds = readParameter("shieldSeconds");
  const pressSteleLandingSeconds = readSeconds("pressSteleLanding");
  const pressSteleSeconds = readSeconds("pressSteleEnd");
  const holdSteleSeconds = readSeconds("holdSteleEnd");
  const holdHitmarkSeconds = takeOne(takeOne(kit.elementalSkillHolds ?? []).action.hits).hitmarkSeconds;
  const pressSteleHits = readHits("pressStele", skillHitBehaviour);
  const holdSteleHits = readHits("holdStele", skillHitBehaviour);
  // The Jade Shield's RES cut, each a hit of no damage and no poise, giving each enemy it reaches the cut
  const jadeShieldHits = readHits("jadeShield", { enemyStatus: () => JADE_SHIELD_STATUS });
  const meteor = readHit("meteor", burstHitBehaviour);
  const topazMeteor = readHit("topazMeteor", burstHitBehaviour);
  // Whether an effect is one of a character's Stone Steles: the summon a press's or a hold's stele lands from
  const checkIsStele = (effect: KitEffect, characterId: number): effect is KitSummon =>
    effect.kind === "summon" &&
    effect.combatant.characterId === characterId &&
    (effect.hits === pressSteleHits || effect.hits === holdSteleHits);
  // The Jade Shield: a Geo shield on the team of the table's flat health and share of Zhongli's Max HP, for its seconds,
  // And its RES cut, landing from a summon that follows the body on the field. A field ticking every step ends the summon
  // Once the shield is spent or recast over
  const castJadeShield = (kitEffectState: KitEffectState, body: KitBody, combatant: Combatant): void => {
    const { characterId } = combatant;
    const shield = castKitShield(kitEffectState, characterId, {
      element: Element.Geo,
      health: shieldFlatHealth + shieldMaxHealthShare * combatant.attributes.maxHealth,
      secondsRemaining: shieldSeconds,
    });
    const resistanceCut = castKitSummon(kitEffectState, body, combatant, jadeShieldHits, {
      isFollowing: true,
      secondsRemaining: shieldSeconds,
    });
    const end = castKitField(kitEffectState, characterId, body.position, {
      nextTickSeconds: 0,
      onTick: ({ kitEffectState: tickKitEffectState }) => {
        if (shield.secondsRemaining > 0 && tickKitEffectState.effects.includes(shield)) return;
        removeKitEffects(tickKitEffectState, (effect) => effect === resistanceCut || effect === end);
      },
      secondsRemaining: shieldSeconds,
      tickIntervalSeconds: FIXED_STEP_SECONDS,
    });
  };
  return {
    // Planet Befall's meteor lands from a summon cast ahead of Zhongli
    burst: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        const { constellationCount } = combatant;
        const hit = constellationCount >= TOPAZ_UNBREAKABLE_AND_FEARLESS_CONSTELLATION ? topazMeteor : meteor;
        castKitSummon(kitEffectState, createAheadBody(body, METEOR_OFFSET), combatant, [hit]);
        if (constellationCount >= STONE_THE_CRADLE_OF_JADE_CONSTELLATION)
          castJadeShield(kitEffectState, body, combatant);
      },
    },
    chargedAttack: { hits: [attackHitBehaviour] },
    normalAttacks: kit.normalAttacks.map(({ hits }) => ({ hits: hits.map(() => attackHitBehaviour) })),
    plungeCollision: attackHitBehaviour,
    plunges: { [KitPlunge.High]: { hits: [attackHitBehaviour] }, [KitPlunge.Low]: { hits: [attackHitBehaviour] } },
    // A Stone Stele is a summon cast ahead of Zhongli, which lands its hits from there. A press with the most standing
    // Ends the newest of them as its own lands, as gcsim's construct handler replaces the last of a kind
    skill: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        const steles = kitEffectState.effects.filter((effect) => checkIsStele(effect, combatant.characterId));
        const newestStele = steles.at(-1);
        if (newestStele && steles.length >= getMaxSteleCount(combatant))
          newestStele.secondsRemaining = Math.min(newestStele.secondsRemaining, pressSteleLandingSeconds);
        castKitSummon(kitEffectState, createAheadBody(body, STELE_OFFSET), combatant, pressSteleHits, {
          secondsRemaining: pressSteleSeconds,
        });
      },
    },
    // A hold casts a Stone Stele unless the most stand, and its Jade Shield at its hitmark, through a task run then
    skillHolds: [
      {
        hits: [skillHitBehaviour],
        onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
          const { facing, height, position } = body;
          const steles = kitEffectState.effects.filter((effect) => checkIsStele(effect, combatant.characterId));
          if (steles.length < getMaxSteleCount(combatant))
            castKitSummon(kitEffectState, createAheadBody(body, STELE_OFFSET), combatant, holdSteleHits, {
              secondsRemaining: holdSteleSeconds,
            });
          scheduleKitTask(
            kitEffectState,
            combatant.characterId,
            holdHitmarkSeconds,
            ({ kitEffectState: tickKitEffectState }) =>
              castJadeShield(tickKitEffectState, { facing, height, position }, combatant),
          );
        },
      },
    ],
  };
};
