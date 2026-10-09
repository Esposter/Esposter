import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitField } from "#src/models/kit/KitField";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitShield } from "#src/models/kit/KitShield";
import type { KitStepContext } from "#src/models/kit/KitStepContext";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { Element, Elements } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { FIXED_STEP_SECONDS } from "#src/services/constants";
import { UNBOUNDED_FIELD_RADIUS } from "#src/services/kit/constants";
import { createTargetedHitArea } from "#src/services/kit/createTargetedHitArea";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { createKitSummon } from "#src/services/kit/effects/createKitSummon";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Zhongli's proud skill groups, read at his talent level. The attack group holds the six strikes at 0 to 5, each of the
// Fifth's four hits at 4, the charged attack at 6 and its stamina at 7, and the plunges' collision, low and high at 8, 9
// And 10. The skill group holds a Stone Stele's damage at 0 and its resonance's at 1, the press's cooldown at 2, the
// Hold's damage at 3, the Jade Shield's flat health at 4, its share of Max HP at 5 and its seconds at 6, and the hold's
// Cooldown at 7. The burst group holds Planet Befall's damage at 0, its Petrification's seconds at 1, which nothing
// Reads, and the burst's cooldown and energy cost at 2 and 3
const ZHONGLI_ATTACK_GROUP_ID = 3031;
const ZHONGLI_SKILL_GROUP_ID = 3032;
const ZHONGLI_BURST_GROUP_ID = 3039;

// Provisional: the reach the targeting reads for the strikes, the skill and the burst, as the Traveler's are
const STRIKE_TARGETING_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 6, radius: 5 });
const SKILL_TARGETING_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 10, radius: 15 });
// Measured: gcsim v2.47.2 (MIT) zhongli/attack.go. A circle centred ahead of the body is priced as its offset plus its
// Radius at gcsim's fan angle, and a box spawned on its near edge ahead of the body as the circle to its far corner
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/zhongli/attack.go
const createFanReach = (degrees: number, radius: number): AttackArea =>
  Object.freeze({ angle: (degrees * Math.PI) / 180, height: 2, radius });
const createBoxReach = (offset: number, width: number, length: number): AttackArea =>
  Object.freeze({ angle: 2 * Math.PI, height: 2, radius: Math.hypot(offset + length, width / 2) });
// Measured: gcsim v2.47.2 (MIT) zhongli/charge.go, the thrust a circle of radius 0.8 on the primary target
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/zhongli/charge.go
const CHARGED_ATTACK_HIT_AREA = createTargetedHitArea(STRIKE_TARGETING_AREA, 0.8);
// Provisional: gcsim has no plunge file for Zhongli, so the plunges' reach is Jean's, Beidou's and Xingqiu's until one
// Measures it
const PLUNGE_COLLISION_HIT_AREA = createFanReach(360, 1);
const LOW_PLUNGE_HIT_AREA = createFanReach(360, 3);
const HIGH_PLUNGE_HIT_AREA = createFanReach(360, 5);

// Measured: gcsim v2.47.2 (MIT) zhongli/attack.go, each strike's hitmarks and the animation that ends it at 60 fps, its
// Reach, and the attack group's index of its hits. The first, third, fifth and sixth strikes are boxes from 0, 0.5, -1
// And 0.2 metres ahead, and the second and fourth circles of radius 2 and 1.7 centred 0.8 and 1.8 metres ahead, the
// Second a fan of 180 degrees. Each hit's poise is the wiki's Rain of Stone advanced properties
const ZHONGLI_STRIKES = [
  { frames: 30, groupIndex: 0, hitArea: createBoxReach(0, 1.5, 3.8), hitmarkFrames: [11], poiseDamage: 33.76 },
  { frames: 30, groupIndex: 1, hitArea: createFanReach(180, 0.8 + 2), hitmarkFrames: [9], poiseDamage: 34.32 },
  { frames: 28, groupIndex: 2, hitArea: createBoxReach(0.5, 1, 1.5), hitmarkFrames: [8], poiseDamage: 42 },
  { frames: 34, groupIndex: 3, hitArea: createFanReach(360, 1.8 + 1.7), hitmarkFrames: [16], poiseDamage: 45.92 },
  { frames: 31, groupIndex: 4, hitArea: createBoxReach(-1, 1, 4), hitmarkFrames: [11, 18, 23, 29], poiseDamage: 11.52 },
  { frames: 54, groupIndex: 5, hitArea: createBoxReach(0.2, 1, 4), hitmarkFrames: [29], poiseDamage: 61.52 },
];
// Measured: gcsim v2.47.2 (MIT) zhongli/charge.go, the thrust at 4 frames and the animation's 47
const CHARGED_ATTACK_HITMARK_FRAMES = 4;
const CHARGED_ATTACK_FRAMES = 47;
// Measured: gcsim v2.47.2 (MIT) zhongli/skill.go, the press's stele landing 24 frames in, its animation 38, and the
// Hold's hit, its stele and its Jade Shield 48 frames past its release, its animation 96, the hit a circle of radius 10
// Round Zhongli
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/zhongli/skill.go
const PRESS_STELE_FRAMES = 24;
const PRESS_FRAMES = 38;
const HOLD_HITMARK_FRAMES = 48;
const HOLD_FRAMES = 96;
const HOLD_HIT_AREA = createFanReach(360, 10);
// Provisional: no table or wiki page gives the seconds a press must be held to become the hold, so it is Bennett's first
// Charge Level's, as Razor's and Venti's are, until a recording measures it
const HOLD_MINIMUM_HELD_SECONDS = 0.5;
// Measured: gcsim v2.47.2 (MIT) zhongli/stele.go, a Stone Stele standing 3 metres ahead of Zhongli for 1860 frames, a
// Second past the wiki's 30, landing as a circle of radius 2 round it and resonating every 120 frames from 120 after,
// An 8 metre box centred on it, priced as the circle to its corner
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/zhongli/stele.go
const STELE_OFFSET = 3;
const STELE_FRAMES = 1860;
const RESONANCE_INTERVAL_FRAMES = 120;
const STELE_HIT_AREA = createFanReach(360, 2);
const RESONANCE_HIT_AREA = createFanReach(360, Math.hypot(4, 4));
// One Stone Stele stands at a time, as the wiki's Dominus Lapidis and gcsim v2.47.2 (MIT) zhongli/zhongli.go give it, and
// Rock, the Backbone of Earth, from one constellation, lets 2 stand
// https://genshin-impact.fandom.com/wiki/Rock,_the_Backbone_of_Earth
const STELE_COUNT = 1;
const ROCK_THE_BACKBONE_OF_EARTH_CONSTELLATION = 1;
const ROCK_THE_BACKBONE_OF_EARTH_STELE_COUNT = 2;
// Measured: gcsim v2.47.2 (MIT) zhongli/shield.go, the Jade Shield's cut of 20% to every Elemental RES and the Physical RES
// Of the enemies within 7.5 metres of the character on the field, given every 18 frames for 60 while the shield stands.
// The wiki's Dominus Lapidis gives the area a height of 10 metres
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/zhongli/shield.go
const JADE_SHIELD_INTERVAL_FRAMES = 18;
const JADE_SHIELD_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 10, radius: 7.5 });
const JADE_SHIELD_RESISTANCE_REDUCTION = 0.2;
const JADE_SHIELD_STATUS: EnemyStatus = {
  damageTakenBonus: 0,
  id: "zhongli-jade-shield",
  physicalResistanceReduction: JADE_SHIELD_RESISTANCE_REDUCTION,
  resistanceReduction: Object.fromEntries(Elements.map((element) => [element, JADE_SHIELD_RESISTANCE_REDUCTION])),
  secondsRemaining: 1,
};
// Measured: gcsim v2.47.2 (MIT) zhongli/burst.go, Planet Befall's meteor at 101 frames as a circle of radius 7.5 centred 5
// Metres ahead of Zhongli, and the animation's 139
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/zhongli/burst.go
const BURST_HITMARK_FRAMES = 101;
const BURST_FRAMES = 139;
const METEOR_OFFSET = 5;
const METEOR_HIT_AREA = createFanReach(360, 7.5);
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
// Topaz, Unbreakable and Fearless, from four constellations, widens Planet Befall's AoE by 20%, a radius of 9 for its 7.5,
// As the wiki's constellation page and gcsim v2.47.2 (MIT) zhongli/burst.go give it
// https://genshin-impact.fandom.com/wiki/Topaz,_Unbreakable_and_Fearless
const TOPAZ_UNBREAKABLE_AND_FEARLESS_CONSTELLATION = 4;
const TOPAZ_METEOR_HIT_AREA = createFanReach(360, 9);

// Dominance of Earth's bonus to a hit: from Ascension 4, the given share of its striker's Max HP
const createDominanceOfEarthBonus =
  (maxHealthShare: number) =>
  (combatant: Combatant): number =>
    combatant.ascension < DOMINANCE_OF_EARTH_ASCENSION ? 0 : maxHealthShare * combatant.attributes.maxHealth;

// The most Stone Steles that may stand at once
const getMaxSteleCount = ({ constellationCount }: Combatant): number =>
  constellationCount >= ROCK_THE_BACKBONE_OF_EARTH_CONSTELLATION ? ROCK_THE_BACKBONE_OF_EARTH_STELE_COUNT : STELE_COUNT;

// A body the given metres ahead of another at its facing: ahead lies at the bearing -sin and -cos of the facing, as the
// Facing angle of the kit's targeting reads it
const createAheadBody = ({ facing, height, position }: KitBody, metres: number): KitBody => ({
  facing,
  height,
  position: { x: position.x - Math.sin(facing) * metres, z: position.z - Math.cos(facing) * metres },
});

// Zhongli's first kit, at talent level 1: six strikes, the fifth of four hits, a charged attack, a collision and two
// Plunges, Dominus Lapidis' press and its hold with their Stone Steles and the hold's Jade Shield, and Planet Befall's
// Meteor. Its multipliers are read from his proud skill groups
export const createZhongliKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackBaseDamageBonus = createDominanceOfEarthBonus(DOMINANCE_OF_EARTH_ATTACK_SHARE);
  const skillBaseDamageBonus = createDominanceOfEarthBonus(DOMINANCE_OF_EARTH_SKILL_SHARE);
  const shieldFlatHealth = getTalentMultiplier(talentMultiplierMap, ZHONGLI_SKILL_GROUP_ID, TALENT_START_LEVEL, 4);
  const shieldMaxHealthShare = getTalentMultiplier(talentMultiplierMap, ZHONGLI_SKILL_GROUP_ID, TALENT_START_LEVEL, 5);
  const shieldSeconds = getTalentMultiplier(talentMultiplierMap, ZHONGLI_SKILL_GROUP_ID, TALENT_START_LEVEL, 6);
  // A spear's strikes are physical under the Normal Attack internal cooldown, each of the fifth's four hits at its index
  const normalAttacks = ZHONGLI_STRIKES.map(
    ({ frames, groupIndex, hitArea, hitmarkFrames, poiseDamage }): KitAction => {
      const talentMultiplier = getTalentMultiplier(
        talentMultiplierMap,
        ZHONGLI_ATTACK_GROUP_ID,
        TALENT_START_LEVEL,
        groupIndex,
      );
      return {
        hits: hitmarkFrames.map((hitmarkFrame): KitHit => ({
          additiveBaseDamageBonus: attackBaseDamageBonus,
          hitArea,
          hitmarkSeconds: hitmarkFrame / 60,
          internalCooldownTag: InternalCooldownTag.NormalAttack,
          poiseDamage,
          talentMultiplier,
        })),
        seconds: frames / 60,
        targetingArea: STRIKE_TARGETING_AREA,
      };
    },
  );
  // A Stone Stele's hits, from the summon cast the given frames before it lands. The wiki's Dominus Lapidis gives its
  // Landing 2U of Geo with 200 poise and each resonance 1U with none, all under the Elemental Skill internal cooldown and
  // Blunt
  const createSteleHits = (landingFrames: number): KitHit[] => {
    const resonance: KitHit = {
      additiveBaseDamageBonus: skillBaseDamageBonus,
      element: Element.Geo,
      gauge: 1,
      hitArea: RESONANCE_HIT_AREA,
      hitmarkSeconds: 0,
      internalCooldownTag: InternalCooldownTag.ElementalSkill,
      isBlunt: true,
      poiseDamage: 0,
      talentMultiplier: getTalentMultiplier(talentMultiplierMap, ZHONGLI_SKILL_GROUP_ID, TALENT_START_LEVEL, 1),
    };
    return [
      {
        ...resonance,
        gauge: 2,
        hitArea: STELE_HIT_AREA,
        hitmarkSeconds: landingFrames / 60,
        poiseDamage: 200,
        talentMultiplier: getTalentMultiplier(talentMultiplierMap, ZHONGLI_SKILL_GROUP_ID, TALENT_START_LEVEL, 0),
      },
      ...Array.from({ length: Math.floor(STELE_FRAMES / RESONANCE_INTERVAL_FRAMES) }, (_value, index): KitHit => ({
        ...resonance,
        hitmarkSeconds: (landingFrames + RESONANCE_INTERVAL_FRAMES * (index + 1)) / 60,
      })),
    ];
  };
  const pressSteleHits = createSteleHits(PRESS_STELE_FRAMES);
  const holdSteleHits = createSteleHits(HOLD_HITMARK_FRAMES);
  // Whether an effect is one of a character's Stone Steles: the summon a press's or a hold's stele lands from
  const checkIsStele = (effect: KitEffect, characterId: number): effect is KitSummon =>
    effect.kind === "summon" &&
    effect.combatant.characterId === characterId &&
    (effect.hits === pressSteleHits || effect.hits === holdSteleHits);
  // A Stone Stele is a summon cast 3 metres ahead of Zhongli, which lands its hits from there. A press with the most
  // Standing ends the newest of them as its own lands, as gcsim's construct handler replaces the last of a kind
  const castPressStele = ({ body, combatant, kitEffectState }: KitStepContext): void => {
    const steles = kitEffectState.effects.filter((effect) => checkIsStele(effect, combatant.characterId));
    const newestStele = steles.at(-1);
    if (newestStele && steles.length >= getMaxSteleCount(combatant))
      newestStele.secondsRemaining = Math.min(newestStele.secondsRemaining, PRESS_STELE_FRAMES / 60);
    addKitEffect(
      kitEffectState,
      createKitSummon(
        createAheadBody(body, STELE_OFFSET),
        combatant,
        pressSteleHits,
        (PRESS_STELE_FRAMES + STELE_FRAMES) / 60,
      ),
    );
  };
  // The Jade Shield's RES cut, every 18 frames from a frame past the shield's cast, so the step after the cast lands the
  // First: each a hit of no damage and no poise, giving each enemy it reaches the cut for a second
  const jadeShieldHits = Array.from(
    { length: Math.floor((shieldSeconds * 60) / JADE_SHIELD_INTERVAL_FRAMES) + 1 },
    (_value, index): KitHit => ({
      enemyStatus: () => JADE_SHIELD_STATUS,
      hitArea: JADE_SHIELD_HIT_AREA,
      hitmarkSeconds: (1 + JADE_SHIELD_INTERVAL_FRAMES * index) / 60,
      poiseDamage: 0,
      talentMultiplier: 0,
    }),
  );
  // The Jade Shield: a Geo shield on the team of the group's flat health and share of Zhongli's Max HP, for its seconds,
  // And its RES cut, landing from a summon that follows the body on the field. A field ticking every step ends the summon
  // Once the shield is spent or recast over
  const castJadeShield = ({ body, combatant, kitEffectState }: KitStepContext): void => {
    const { characterId } = combatant;
    const shield: KitShield = {
      characterId,
      element: Element.Geo,
      health: shieldFlatHealth + shieldMaxHealthShare * combatant.attributes.maxHealth,
      kind: "shield",
      secondsRemaining: shieldSeconds,
    };
    const resistanceCut: KitSummon = {
      ...createKitSummon(body, combatant, jadeShieldHits, shieldSeconds),
      isFollowing: true,
    };
    const end: KitField = {
      centre: { x: body.position.x, z: body.position.z },
      characterId,
      kind: "field",
      nextTickSeconds: 0,
      onTick: ({ kitEffectState: tickKitEffectState }) => {
        if (shield.secondsRemaining > 0 && tickKitEffectState.effects.includes(shield)) return;
        tickKitEffectState.effects = tickKitEffectState.effects.filter(
          (effect) => effect !== resistanceCut && effect !== end,
        );
      },
      radius: UNBOUNDED_FIELD_RADIUS,
      secondsRemaining: shieldSeconds,
      tickIndex: 0,
      tickIntervalSeconds: FIXED_STEP_SECONDS,
    };
    addKitEffect(kitEffectState, shield);
    addKitEffect(kitEffectState, resistanceCut);
    addKitEffect(kitEffectState, end);
  };
  // A hold casts a Stone Stele unless the most stand, and its Jade Shield at its hitmark, through a field with no edge
  // That ticks once then
  const castHold = (context: KitStepContext): void => {
    const { body, combatant, kitEffectState } = context;
    const steles = kitEffectState.effects.filter((effect) => checkIsStele(effect, combatant.characterId));
    if (steles.length < getMaxSteleCount(combatant))
      addKitEffect(
        kitEffectState,
        createKitSummon(
          createAheadBody(body, STELE_OFFSET),
          combatant,
          holdSteleHits,
          (HOLD_HITMARK_FRAMES + STELE_FRAMES) / 60,
        ),
      );
    addKitEffect(kitEffectState, {
      centre: { x: body.position.x, z: body.position.z },
      characterId: combatant.characterId,
      kind: "field",
      nextTickSeconds: HOLD_HITMARK_FRAMES / 60,
      onTick: ({ kitEffectState: tickKitEffectState }) =>
        castJadeShield({ ...context, kitEffectState: tickKitEffectState }),
      radius: UNBOUNDED_FIELD_RADIUS,
      // The field lives a tenth of a second past its tick, so the step that runs it still has it
      secondsRemaining: HOLD_HITMARK_FRAMES / 60 + 0.1,
      tickIndex: 0,
      tickIntervalSeconds: Number.POSITIVE_INFINITY,
    });
  };
  // The wiki's Planet Befall gives the meteor 4U of Geo with no internal cooldown, 500 poise and blunt. It lands from a
  // Summon cast 5 metres ahead of Zhongli, wider from four constellations, and from two the burst casts a Jade Shield
  const meteor: KitHit = {
    additiveBaseDamageBonus: createDominanceOfEarthBonus(DOMINANCE_OF_EARTH_BURST_SHARE),
    element: Element.Geo,
    gauge: 4,
    hitArea: METEOR_HIT_AREA,
    hitmarkSeconds: BURST_HITMARK_FRAMES / 60,
    isBlunt: true,
    poiseDamage: 500,
    talentMultiplier: getTalentMultiplier(talentMultiplierMap, ZHONGLI_BURST_GROUP_ID, TALENT_START_LEVEL, 0),
  };
  const topazMeteor: KitHit = { ...meteor, hitArea: TOPAZ_METEOR_HIT_AREA };
  const castPlanetBefall = (context: KitStepContext): void => {
    const { body, combatant, kitEffectState } = context;
    const { constellationCount } = combatant;
    const hit = constellationCount >= TOPAZ_UNBREAKABLE_AND_FEARLESS_CONSTELLATION ? topazMeteor : meteor;
    addKitEffect(kitEffectState, createKitSummon(createAheadBody(body, METEOR_OFFSET), combatant, [hit]));
    if (constellationCount >= STONE_THE_CRADLE_OF_JADE_CONSTELLATION) castJadeShield(context);
  };
  return {
    burstCooldownSeconds: getTalentMultiplier(talentMultiplierMap, ZHONGLI_BURST_GROUP_ID, TALENT_START_LEVEL, 2),
    burstEnergyCost: getTalentMultiplier(talentMultiplierMap, ZHONGLI_BURST_GROUP_ID, TALENT_START_LEVEL, 3),
    // The wiki's Rain of Stone gives the thrust 103.28 poise under the Charged Attack internal cooldown, whose 0.5 seconds
    // Never hold a thrust back, which plays 47 frames, so it carries none
    chargedAttack: {
      hits: [
        {
          additiveBaseDamageBonus: attackBaseDamageBonus,
          hitArea: CHARGED_ATTACK_HIT_AREA,
          hitmarkSeconds: CHARGED_ATTACK_HITMARK_FRAMES / 60,
          poiseDamage: 103.28,
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, ZHONGLI_ATTACK_GROUP_ID, TALENT_START_LEVEL, 6),
        },
      ],
      seconds: CHARGED_ATTACK_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    // The table's, the wiki's and gcsim's 25 stamina, spent as the charged attack starts
    chargedAttackStamina: getTalentMultiplier(talentMultiplierMap, ZHONGLI_ATTACK_GROUP_ID, TALENT_START_LEVEL, 7),
    elementalBurst: {
      hits: [],
      onStart: castPlanetBefall,
      seconds: BURST_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    elementalSkill: {
      hits: [],
      onStart: castPressStele,
      seconds: PRESS_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    // The wiki's Dominus Lapidis gives the hold's hit 1U of Geo under the Elemental Skill internal cooldown, 142.9 poise and
    // Blunt, and the group its 12 second cooldown
    elementalSkillHolds: [
      {
        action: {
          hits: [
            {
              additiveBaseDamageBonus: skillBaseDamageBonus,
              element: Element.Geo,
              gauge: 1,
              hitArea: HOLD_HIT_AREA,
              hitmarkSeconds: HOLD_HITMARK_FRAMES / 60,
              internalCooldownTag: InternalCooldownTag.ElementalSkill,
              isBlunt: true,
              poiseDamage: 142.9,
              talentMultiplier: getTalentMultiplier(talentMultiplierMap, ZHONGLI_SKILL_GROUP_ID, TALENT_START_LEVEL, 3),
            },
          ],
          onStart: castHold,
          seconds: HOLD_FRAMES / 60,
          targetingArea: SKILL_TARGETING_AREA,
        },
        cooldownSeconds: getTalentMultiplier(talentMultiplierMap, ZHONGLI_SKILL_GROUP_ID, TALENT_START_LEVEL, 7),
        minimumHeldSeconds: HOLD_MINIMUM_HELD_SECONDS,
      },
    ],
    // Provisional: gcsim has no plunge file for Zhongli and no source gives his plunges' landing frames, so each hits as
    // Its action starts, as Jean's, Beidou's and Xingqiu's do. The wiki's Rain of Stone gives them 100 and 150 poise, both
    // Blunt
    highPlunge: {
      hits: [
        {
          additiveBaseDamageBonus: attackBaseDamageBonus,
          hitArea: HIGH_PLUNGE_HIT_AREA,
          hitmarkSeconds: 0,
          isBlunt: true,
          poiseDamage: 150,
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, ZHONGLI_ATTACK_GROUP_ID, TALENT_START_LEVEL, 10),
        },
      ],
      seconds: 0.4,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    lowPlunge: {
      hits: [
        {
          additiveBaseDamageBonus: attackBaseDamageBonus,
          hitArea: LOW_PLUNGE_HIT_AREA,
          hitmarkSeconds: 0,
          isBlunt: true,
          poiseDamage: 100,
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, ZHONGLI_ATTACK_GROUP_ID, TALENT_START_LEVEL, 9),
        },
      ],
      seconds: 0.4,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    normalAttacks,
    // The collision's poise is the wiki's 25, and it applies no gauge of its own, 0U, as the wiki's table gives
    plungeCollision: {
      additiveBaseDamageBonus: attackBaseDamageBonus,
      gauge: 0,
      hitArea: PLUNGE_COLLISION_HIT_AREA,
      hitmarkSeconds: 0,
      poiseDamage: 25,
      talentMultiplier: getTalentMultiplier(talentMultiplierMap, ZHONGLI_ATTACK_GROUP_ID, TALENT_START_LEVEL, 8),
    },
    // The group's, the wiki's and gcsim's 4 second press cooldown
    skillCooldownSeconds: getTalentMultiplier(talentMultiplierMap, ZHONGLI_SKILL_GROUP_ID, TALENT_START_LEVEL, 2),
  };
};
