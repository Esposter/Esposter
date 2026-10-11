import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitField } from "#src/models/kit/KitField";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitTaunt } from "#src/models/kit/KitTaunt";

import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { createFanReach } from "#src/services/kit/createFanReach";
import { createTargetedHitArea } from "#src/services/kit/createTargetedHitArea";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { createKitSummon } from "#src/services/kit/effects/createKitSummon";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Ganyu's proud skill groups, read at her talent level. The attack group holds the six strikes at 0 to 5, the aimed shot at
// 6, the charged shot at 7, the Frostflake Arrow at 8 and its Bloom at 9, and the plunges' collision, low and high at 10,
// 11 and 12. The skill group holds Ice Lotus's flower hit at 0, its explosion at 1, the taunt's seconds at 2 and its
// Cooldown at 3. The burst group holds Celestial Shower's hit at 0, its seconds at 1, its cooldown at 2 and its energy cost
// At 3
const GANYU_ATTACK_GROUP_ID = 3731;
const GANYU_SKILL_GROUP_ID = 3732;
const GANYU_BURST_GROUP_ID = 3739;

// Provisional: the reach the targeting reads for the strikes, the skill and the burst, as the other kits' are
const STRIKE_TARGETING_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 6, radius: 5 });
const SKILL_TARGETING_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 10, radius: 15 });

// Measured: gcsim v2.47.2 (MIT) ganyu/attack.go, each strike's hitmark and the frame its action cancels at, its arrow
// Travelling 10 frames to its target, which lands it at the hitmark plus the travel. Each arrow lands on the primary target
// Through a box, priced as a circle of a metre round the body, as Fischl's are
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/ganyu/attack.go
const ARROW_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1 });
const ARROW_TRAVEL_FRAMES = 10;
const NORMAL_ATTACK_FRAMES = [
  { cancelFrames: 19, hitmarkFrames: 13 },
  { cancelFrames: 27, hitmarkFrames: 14 },
  { cancelFrames: 38, hitmarkFrames: 20 },
  { cancelFrames: 37, hitmarkFrames: 26 },
  { cancelFrames: 28, hitmarkFrames: 21 },
  { cancelFrames: 59, hitmarkFrames: 22 },
];

// Measured: gcsim v2.47.2 (MIT) ganyu/aimed.go, the fully charged shot's animation at 113 frames, its Frostflake Arrow at
// 103 and its Bloom 18 frames after the arrow, each travelling 10 frames
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/ganyu/aimed.go
const FULL_CHARGE_FRAMES = 113;
const FROSTFLAKE_ARROW_HITMARK_FRAMES = 103 + ARROW_TRAVEL_FRAMES;
const FROSTFLAKE_ARROW_BLOOM_HITMARK_FRAMES = 103 + 18 + ARROW_TRAVEL_FRAMES;
// Measured: gcsim v2.47.2 (MIT) ganyu/aimed.go, the Bloom a circle of radius 5 round the arrow's primary target
const FROSTFLAKE_ARROW_BLOOM_HIT_AREA = createTargetedHitArea(STRIKE_TARGETING_AREA, 5);

// Measured: gcsim v2.47.2 (MIT) ganyu/skill.go, Ice Lotus's flower at 13 frames and its explosion at 373, both circles of
// Radius 4 round the body, with the animation's 28 frames and the cooldown the table gives. The lotus taunts for the table's
// Seconds from its flower, so it explodes 6 seconds after it lands
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/ganyu/skill.go
const ICE_LOTUS_FRAMES = 28;
const ICE_LOTUS_FLOWER_HITMARK_FRAMES = 13;
const ICE_LOTUS_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 4 });
// Provisional: no source gives the lotus health, so it stands until its seconds run out, unless a taunt's health is taken
const ICE_LOTUS_HEALTH = Number.POSITIVE_INFINITY;

// Measured: gcsim v2.47.2 (MIT) ganyu/burst.go, Celestial Shower's animation at 125 frames, its field of radius 10 from the
// Cast starting at 122 frames and running for the table's seconds, ticking every 18 frames. Each tick's hit lands 8 frames
// After it, a circle of radius 2.5 on a random enemy in the field, or a random point in it when none is, so it is priced as
// A circle of the field's radius plus its own round the field's centre
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/ganyu/burst.go
const CELESTIAL_SHOWER_FRAMES = 125;
const CELESTIAL_SHOWER_START_FRAMES = 122;
const CELESTIAL_SHOWER_RADIUS = 10;
const CELESTIAL_SHOWER_TICK_INTERVAL_FRAMES = 18;
const CELESTIAL_SHOWER_HITMARK_AFTER_TICK_FRAMES = 8;
const CELESTIAL_SHOWER_HIT_AREA = createTargetedHitArea(
  Object.freeze({ angle: 2 * Math.PI, height: 10, radius: CELESTIAL_SHOWER_RADIUS }),
  2.5,
);
// Measured: gcsim v2.47.2 (MIT) ganyu/passive.go and burst.go, Harmony between Heaven and Earth's 20% Cryo DMG Bonus for the
// Active character inside the field for 60 frames, from Ascension 4
const HARMONY_ASCENSION = 4;
const HARMONY_CRYO_DAMAGE_BONUS = 0.2;
const HARMONY_SECONDS = 1;

// Measured: gcsim v2.47.2 (MIT) ganyu/passive.go, Undivided Heart's 20% CRIT Rate for 300 frames on each later Frostflake
// Arrow, from Ascension 1, which the first arrow of a charge does not get, as the buff comes after its strike
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/ganyu/aimed.go
const UNDIVIDED_HEART_ASCENSION = 1;
const UNDIVIDED_HEART_CRITICAL_RATE = 0.2;
const UNDIVIDED_HEART_SECONDS = 5;
const UNDIVIDED_HEART_SOURCE = "ganyu-undivided-heart";
const HARMONY_SOURCE = "ganyu-harmony";

// Measured: gcsim v2.47.2 (MIT) ganyu/cons.go, Frostflake Arrows and their Bloom reduce the enemy's Cryo RES by 15% for 300
// Frames from Constellation 1, which the wiki's text gives as 6 seconds
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/ganyu/cons.go
const FROSTFLAKE_CONSTELLATION = 1;
const FROSTFLAKE_CRYO_RESISTANCE_REDUCTION = 0.15;
const FROSTFLAKE_STATUS: EnemyStatus = {
  damageTakenBonus: 0,
  id: "ganyu-frostflake",
  resistanceReduction: { [Element.Cryo]: FROSTFLAKE_CRYO_RESISTANCE_REDUCTION },
  secondsRemaining: 5,
};
const getFrostflakeStatus = ({ constellationCount }: Combatant): EnemyStatus | undefined =>
  constellationCount >= FROSTFLAKE_CONSTELLATION ? FROSTFLAKE_STATUS : undefined;

// Provisional: gcsim gives the arrows, the lotus, the shower and the plunges no poise, so these stand in until a source
// Gives them
const ARROW_POISE_DAMAGE = 12.9;
const FULL_CHARGE_POISE_DAMAGE = 20;
const LOTUS_POISE_DAMAGE = 0;
const SHOWER_POISE_DAMAGE = 0;
const PLUNGE_COLLISION_POISE_DAMAGE = 10;
const LOW_PLUNGE_POISE_DAMAGE = 50;
const HIGH_PLUNGE_POISE_DAMAGE = 100;

// Ganyu's first kit, at talent level 1: six strikes, a fully charged shot with its Frostflake Arrow and Bloom, a collision and
// Two plunges, Ice Lotus with its taunt and explosion, and Celestial Shower with its field. Undivided Heart, Harmony between
// Heaven and Earth, and Constellations 1 are built. Her multipliers are read from her proud skill groups
export const createGanyuKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const createNormalAttack = (
    { cancelFrames, hitmarkFrames }: (typeof NORMAL_ATTACK_FRAMES)[number],
    index: number,
  ): KitAction => ({
    hits: [
      {
        hitArea: ARROW_HIT_AREA,
        hitmarkSeconds: (hitmarkFrames + ARROW_TRAVEL_FRAMES) / 60,
        poiseDamage: ARROW_POISE_DAMAGE,
        talentMultiplier: getTalentMultiplier(talentMultiplierMap, GANYU_ATTACK_GROUP_ID, TALENT_START_LEVEL, index),
      },
    ],
    seconds: cancelFrames / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  });
  const frostflakeArrowHit: KitHit = {
    element: Element.Cryo,
    enemyStatus: getFrostflakeStatus,
    gauge: 1,
    hitArea: ARROW_HIT_AREA,
    hitmarkSeconds: FROSTFLAKE_ARROW_HITMARK_FRAMES / 60,
    onStrike: ({ combatant, kitEffectState }) => {
      if (combatant.ascension < UNDIVIDED_HEART_ASCENSION) return;
      addKitEffect(kitEffectState, {
        amount: UNDIVIDED_HEART_CRITICAL_RATE,
        attribute: Attribute.CriticalRate,
        characterId: combatant.characterId,
        kind: "buff",
        secondsRemaining: UNDIVIDED_HEART_SECONDS,
        source: UNDIVIDED_HEART_SOURCE,
      });
    },
    poiseDamage: FULL_CHARGE_POISE_DAMAGE,
    talentMultiplier: getTalentMultiplier(talentMultiplierMap, GANYU_ATTACK_GROUP_ID, TALENT_START_LEVEL, 8),
  };
  const frostflakeArrowBloomHit: KitHit = {
    element: Element.Cryo,
    enemyStatus: getFrostflakeStatus,
    gauge: 1,
    hitArea: FROSTFLAKE_ARROW_BLOOM_HIT_AREA,
    hitmarkSeconds: FROSTFLAKE_ARROW_BLOOM_HITMARK_FRAMES / 60,
    poiseDamage: FULL_CHARGE_POISE_DAMAGE,
    talentMultiplier: getTalentMultiplier(talentMultiplierMap, GANYU_ATTACK_GROUP_ID, TALENT_START_LEVEL, 9),
  };
  const celestialShowerHit: KitHit = {
    element: Element.Cryo,
    gauge: 1,
    hitArea: CELESTIAL_SHOWER_HIT_AREA,
    hitmarkSeconds: CELESTIAL_SHOWER_HITMARK_AFTER_TICK_FRAMES / 60,
    poiseDamage: SHOWER_POISE_DAMAGE,
    talentMultiplier: getTalentMultiplier(talentMultiplierMap, GANYU_BURST_GROUP_ID, TALENT_START_LEVEL, 0),
  };
  const iceLotusFlowerHit: KitHit = {
    element: Element.Cryo,
    gauge: 1,
    hitArea: ICE_LOTUS_HIT_AREA,
    hitmarkSeconds: ICE_LOTUS_FLOWER_HITMARK_FRAMES / 60,
    poiseDamage: LOTUS_POISE_DAMAGE,
    talentMultiplier: getTalentMultiplier(talentMultiplierMap, GANYU_SKILL_GROUP_ID, TALENT_START_LEVEL, 0),
  };
  const iceLotusExplosion: KitHit = {
    ...iceLotusFlowerHit,
    hitmarkSeconds: 0,
    talentMultiplier: getTalentMultiplier(talentMultiplierMap, GANYU_SKILL_GROUP_ID, TALENT_START_LEVEL, 1),
  };
  return {
    burstCooldownSeconds: getTalentMultiplier(talentMultiplierMap, GANYU_BURST_GROUP_ID, TALENT_START_LEVEL, 2),
    burstEnergyCost: getTalentMultiplier(talentMultiplierMap, GANYU_BURST_GROUP_ID, TALENT_START_LEVEL, 3),
    // The fully charged shot's Frostflake Arrow lands with its animation's end. Its Bloom lands 18 frames after the
    // Arrow's travel, past the animation, so it is cast with the shot as a summon at the body and lands on its own clock
    chargedAttack: {
      hits: [frostflakeArrowHit],
      isAimed: true,
      onStart: ({ body, combatant, kitEffectState }) => {
        addKitEffect(kitEffectState, createKitSummon(body, combatant, [frostflakeArrowBloomHit]));
      },
      seconds: FULL_CHARGE_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    chargedAttackStamina: 0,
    elementalBurst: {
      hits: [],
      onStart: ({ body, combatant, kitEffectState }) => {
        const field: KitField = {
          centre: { x: body.position.x, z: body.position.z },
          characterId: combatant.characterId,
          kind: "field",
          nextTickSeconds: CELESTIAL_SHOWER_START_FRAMES / 60,
          onTick: ({ activeCombatant, kitEffectState: tickEffectState }) => {
            if (combatant.ascension >= HARMONY_ASCENSION)
              addKitEffect(tickEffectState, {
                amount: HARMONY_CRYO_DAMAGE_BONUS,
                attribute: Attribute.CryoDamageBonus,
                characterId: activeCombatant.characterId,
                kind: "buff",
                secondsRemaining: HARMONY_SECONDS,
                source: HARMONY_SOURCE,
              });
            addKitEffect(tickEffectState, createKitSummon(body, combatant, [celestialShowerHit]));
          },
          radius: CELESTIAL_SHOWER_RADIUS,
          secondsRemaining:
            getTalentMultiplier(talentMultiplierMap, GANYU_BURST_GROUP_ID, TALENT_START_LEVEL, 1) +
            CELESTIAL_SHOWER_START_FRAMES / 60 +
            0.1,
          tickIndex: 0,
          tickIntervalSeconds: CELESTIAL_SHOWER_TICK_INTERVAL_FRAMES / 60,
        };
        addKitEffect(kitEffectState, field);
      },
      seconds: CELESTIAL_SHOWER_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    elementalSkill: {
      hits: [iceLotusFlowerHit],
      onStart: ({ body, combatant, kitEffectState }) => {
        const taunt: KitTaunt = {
          body: { facing: body.facing, height: body.height, position: { x: body.position.x, z: body.position.z } },
          combatant,
          explosion: iceLotusExplosion,
          health: ICE_LOTUS_HEALTH,
          kind: "taunt",
          secondsRemaining:
            ICE_LOTUS_FLOWER_HITMARK_FRAMES / 60 +
            getTalentMultiplier(talentMultiplierMap, GANYU_SKILL_GROUP_ID, TALENT_START_LEVEL, 2),
        };
        addKitEffect(kitEffectState, taunt);
      },
      seconds: ICE_LOTUS_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    highPlunge: {
      hits: [
        {
          hitArea: createFanReach(360, 5),
          hitmarkSeconds: 0,
          poiseDamage: HIGH_PLUNGE_POISE_DAMAGE,
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, GANYU_ATTACK_GROUP_ID, TALENT_START_LEVEL, 12),
        },
      ],
      seconds: 0.4,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    lowPlunge: {
      hits: [
        {
          hitArea: createFanReach(360, 3),
          hitmarkSeconds: 0,
          poiseDamage: LOW_PLUNGE_POISE_DAMAGE,
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, GANYU_ATTACK_GROUP_ID, TALENT_START_LEVEL, 11),
        },
      ],
      seconds: 0.4,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    normalAttacks: NORMAL_ATTACK_FRAMES.map((frames, index) => createNormalAttack(frames, index)),
    plungeCollision: {
      hitArea: createFanReach(360, 1),
      hitmarkSeconds: 0,
      poiseDamage: PLUNGE_COLLISION_POISE_DAMAGE,
      talentMultiplier: getTalentMultiplier(talentMultiplierMap, GANYU_ATTACK_GROUP_ID, TALENT_START_LEVEL, 10),
    },
    skillCooldownSeconds: getTalentMultiplier(talentMultiplierMap, GANYU_SKILL_GROUP_ID, TALENT_START_LEVEL, 3),
  };
};
