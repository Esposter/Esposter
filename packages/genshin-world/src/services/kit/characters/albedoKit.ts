import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitHit } from "#src/models/kit/KitHit";

import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA } from "#src/services/kit/constants";
import { createAheadBody } from "#src/services/kit/createAheadBody";
import { createBoxReach } from "#src/services/kit/createBoxReach";
import { createFanReach } from "#src/services/kit/createFanReach";
import { createPeriodicKitHits } from "#src/services/kit/createPeriodicKitHits";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { findStandingKitSummon } from "#src/services/kit/effects/findStandingKitSummon";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Albedo's proud skill groups, read at his talent level. The attack group holds the five strikes at 0 to 4, the charged
// Attack's two hits at 5 and 6 and its stamina at 7, and the plunges' collision, low and high at 8, 9 and 10. The skill
// Group holds Solar Isotoma's hit at 0, the Transient Blossom's tick at 1, the field's seconds at 2 and its cooldown at 3.
// The burst group holds Tectonic Tide at 0, each Fatal Blossom at 1, its cooldown at 2 and its energy cost at 3
const ALBEDO_ATTACK_GROUP_ID = 3831;
const ALBEDO_SKILL_GROUP_ID = 3832;
const ALBEDO_BURST_GROUP_ID = 3839;

// Provisional: gcsim gives Albedo's strikes, charged attack and plunges no poise, so these stand in until a source gives them
const STRIKE_POISE_DAMAGE = 0;
const CHARGED_ATTACK_POISE_DAMAGE = 0;
const PLUNGE_COLLISION_POISE_DAMAGE = 10;
const LOW_PLUNGE_POISE_DAMAGE = 50;
const HIGH_PLUNGE_POISE_DAMAGE = 100;

// Measured: gcsim v2.47.2 (MIT) albedo/attack.go, each strike's hitmark and cancel frame, and its reach. A strike's box or
// Circle is centred ahead of the body, so each is priced as its far reach from the body, as Zhongli's and Kaeya's are
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/albedo/attack.go
const NORMAL_ATTACK_STRIKES: { cancelFrames: number; hitArea: AttackArea; hitmarkFrames: number }[] = [
  { cancelFrames: 23, hitArea: createFanReach(360, 0.8 + 1.6), hitmarkFrames: 12 },
  { cancelFrames: 22, hitArea: createFanReach(180, 0.1 + 2), hitmarkFrames: 11 },
  { cancelFrames: 41, hitArea: createBoxReach(-0.2, 3, 2.6), hitmarkFrames: 17 },
  { cancelFrames: 36, hitArea: createBoxReach(0.1, 1.5, 3.7), hitmarkFrames: 17 },
  { cancelFrames: 62, hitArea: createFanReach(360, 0.8 + 2), hitmarkFrames: 27 },
];

// Measured: gcsim v2.47.2 (MIT) albedo/charge.go, two hits at 20 frames of a fan of 270 degrees and radius 2.2, centred 0.3
// Ahead of the body, in an animation of 56 frames
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/albedo/charge.go
const CHARGED_ATTACK_HITMARK_FRAMES = 20;
const CHARGED_ATTACK_FRAMES = 56;
const CHARGED_ATTACK_HIT_AREA = createFanReach(270, 0.3 + 2.2);

// Measured: gcsim v2.47.2 (MIT) albedo/skill.go, Abiogenesis: Solar Isotoma's animation of 33 frames, and the field it sets 3
// Metres ahead of the body. Its hit lands at 25 frames on a circle of radius 5 round the field, which stands for the table's
// Seconds with a radius of 10. Each Transient Blossom is a summon at the enemy a hit landed on inside the field, a circle of
// Radius 3.4 round the enemy, one frame after it, and each holds to the enemy's hit once every 2 seconds. Its tick is priced
// As the table's DEF multiple of the DEF of the Albedo who cast the field, so it takes no ATK
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/albedo/skill.go
const SOLAR_ISOTOMA_FRAMES = 33;
const SOLAR_ISOTOMA_HITMARK_FRAMES = 25;
const SOLAR_ISOTOMA_AHEAD_METRES = 3;
const SOLAR_ISOTOMA_HIT_AREA = createFanReach(360, 5);
const SOLAR_ISOTOMA_RADIUS = 10;
const SOLAR_ISOTOMA_ID = "albedo-solar-isotoma";
const TRANSIENT_BLOSSOM_HIT_AREA = createFanReach(360, 3.4);
const TRANSIENT_BLOSSOM_HITMARK_FRAMES = 1;
const TRANSIENT_BLOSSOM_COOLDOWN_SECONDS = 2;
const TRANSIENT_BLOSSOM_COOLDOWN_STATUS_ID = "albedo-transient-blossom-cooldown";
// Provisional: gcsim gives the Transient Blossom's tick no poise, so none is priced until a source gives it
const TRANSIENT_BLOSSOM_POISE_DAMAGE = 0;

// Measured: gcsim v2.47.2 (MIT) albedo/burst.go, Rite of Progeniture: Tectonic Tide's animation of 96 frames, and its fan of
// 120 degrees and radius 8 round the body at 75 frames, of poise 100. Its seven Fatal Blossoms land 145 frames and on every
// 5 frames after, of poise 30, only while the Solar Isotoma stands, each a circle of radius 3 on an enemy in the field or a
// Point in it, so each is priced as the field's radius plus its own round the field's centre
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/albedo/burst.go
const TECTONIC_TIDE_FRAMES = 96;
const TECTONIC_TIDE_HITMARK_FRAMES = 75;
const TECTONIC_TIDE_HIT_AREA = createFanReach(120, 8);
const TECTONIC_TIDE_POISE_DAMAGE = 100;
const FATAL_BLOSSOM_COUNT = 7;
const FATAL_BLOSSOM_FIRST_FRAMES = 145;
const FATAL_BLOSSOM_INTERVAL_FRAMES = 5;
const FATAL_BLOSSOM_HIT_AREA = createFanReach(360, SOLAR_ISOTOMA_RADIUS + 3);
const FATAL_BLOSSOM_POISE_DAMAGE = 30;

// A hit whose base damage is a share of its striker's DEF rather than of its ATK, as gcsim's UseDef hits are: the share is
// Given as the hit's flat base damage and the hit's talent multiplier is zero
const createDefenseScaledBonus =
  (talentMultiplier: number) =>
  (combatant: Combatant): number =>
    talentMultiplier * combatant.attributes.defense;

export const ALBEDO_CHARACTER_ID = 10_000_038;

// Albedo's first kit, at talent level 1: five strikes, a charged attack of two hits, a collision and two plunges, Abiogenesis:
// Solar Isotoma with its hit and the Transient Blossoms it sets off, and Rite of Progeniture: Tectonic Tide with its Fatal
// Blossoms. Its multipliers are read from his proud skill groups. His passives and constellations are not built, as their
// Conditions and party buffs are not on the kit's effects
export const createAlbedoKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const createNormalAttack = (
    { cancelFrames, hitArea, hitmarkFrames }: (typeof NORMAL_ATTACK_STRIKES)[number],
    index: number,
  ): KitAction => ({
    hits: [
      {
        hitArea,
        hitmarkSeconds: hitmarkFrames / 60,
        poiseDamage: STRIKE_POISE_DAMAGE,
        talentMultiplier: getTalentMultiplier(talentMultiplierMap, ALBEDO_ATTACK_GROUP_ID, TALENT_START_LEVEL, index),
      },
    ],
    seconds: cancelFrames / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  });
  const solarIsotomaHit: KitHit = {
    element: Element.Geo,
    gauge: 1,
    hitArea: SOLAR_ISOTOMA_HIT_AREA,
    hitmarkSeconds: SOLAR_ISOTOMA_HITMARK_FRAMES / 60,
    poiseDamage: 50,
    talentMultiplier: getTalentMultiplier(talentMultiplierMap, ALBEDO_SKILL_GROUP_ID, TALENT_START_LEVEL, 0),
  };
  const transientBlossomDefenseBonus = createDefenseScaledBonus(
    getTalentMultiplier(talentMultiplierMap, ALBEDO_SKILL_GROUP_ID, TALENT_START_LEVEL, 1),
  );
  const createTransientBlossomHit = (): KitHit => ({
    additiveBaseDamageBonus: transientBlossomDefenseBonus,
    element: Element.Geo,
    gauge: 1,
    hitArea: TRANSIENT_BLOSSOM_HIT_AREA,
    hitmarkSeconds: TRANSIENT_BLOSSOM_HITMARK_FRAMES / 60,
    poiseDamage: TRANSIENT_BLOSSOM_POISE_DAMAGE,
    talentMultiplier: 0,
  });
  const tectonicTideHit: KitHit = {
    element: Element.Geo,
    gauge: 1,
    hitArea: TECTONIC_TIDE_HIT_AREA,
    hitmarkSeconds: TECTONIC_TIDE_HITMARK_FRAMES / 60,
    internalCooldownTag: InternalCooldownTag.ElementalBurst,
    isBlunt: true,
    poiseDamage: TECTONIC_TIDE_POISE_DAMAGE,
    talentMultiplier: getTalentMultiplier(talentMultiplierMap, ALBEDO_BURST_GROUP_ID, TALENT_START_LEVEL, 0),
  };
  const fatalBlossomHits: KitHit[] = createPeriodicKitHits(
    {
      element: Element.Geo,
      gauge: 1,
      hitArea: FATAL_BLOSSOM_HIT_AREA,
      internalCooldownTag: InternalCooldownTag.ElementalBurst,
      isBlunt: true,
      poiseDamage: FATAL_BLOSSOM_POISE_DAMAGE,
      talentMultiplier: getTalentMultiplier(talentMultiplierMap, ALBEDO_BURST_GROUP_ID, TALENT_START_LEVEL, 1),
    },
    FATAL_BLOSSOM_COUNT,
    FATAL_BLOSSOM_FIRST_FRAMES,
    FATAL_BLOSSOM_INTERVAL_FRAMES,
  );
  const plungeAction = (hitArea: AttackArea, poiseDamage: number, index: number): KitAction => ({
    hits: [
      {
        hitArea,
        hitmarkSeconds: 0,
        poiseDamage,
        talentMultiplier: getTalentMultiplier(talentMultiplierMap, ALBEDO_ATTACK_GROUP_ID, TALENT_START_LEVEL, index),
      },
    ],
    seconds: 0.4,
    targetingArea: STRIKE_TARGETING_AREA,
  });

  return {
    burstCooldownSeconds: getTalentMultiplier(talentMultiplierMap, ALBEDO_BURST_GROUP_ID, TALENT_START_LEVEL, 2),
    burstEnergyCost: getTalentMultiplier(talentMultiplierMap, ALBEDO_BURST_GROUP_ID, TALENT_START_LEVEL, 3),
    chargedAttack: {
      hits: [5, 6].map((index) => ({
        hitArea: CHARGED_ATTACK_HIT_AREA,
        hitmarkSeconds: CHARGED_ATTACK_HITMARK_FRAMES / 60,
        poiseDamage: CHARGED_ATTACK_POISE_DAMAGE,
        talentMultiplier: getTalentMultiplier(talentMultiplierMap, ALBEDO_ATTACK_GROUP_ID, TALENT_START_LEVEL, index),
      })),
      seconds: CHARGED_ATTACK_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    chargedAttackStamina: getTalentMultiplier(talentMultiplierMap, ALBEDO_ATTACK_GROUP_ID, TALENT_START_LEVEL, 7),
    // Tectonic Tide lands on the body at 75 frames and the Fatal Blossoms from 145, the Solar Isotoma's when it stands. Each
    // Blossom is cast with the Solar Isotoma as a summon, as its own clock runs past the animation
    elementalBurst: {
      hits: [tectonicTideHit],
      onStart: ({ activeCombatant: combatant, kitEffectState }) => {
        const solarIsotoma = findStandingKitSummon(kitEffectState.effects, SOLAR_ISOTOMA_ID, combatant.characterId);
        if (solarIsotoma) castKitSummon(kitEffectState, solarIsotoma.body, solarIsotoma.combatant, fatalBlossomHits);
      },
      seconds: TECTONIC_TIDE_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    // The Solar Isotoma is set 3 metres ahead as the press starts, its hit landing at 25 frames, and a new one ends the one
    // Standing, as Fischl's Oz does
    elementalSkill: {
      hits: [],
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        for (const effect of kitEffectState.effects)
          if (effect.kind === "summon" && effect.id === SOLAR_ISOTOMA_ID) effect.secondsRemaining = 0;
        castKitSummon(kitEffectState, createAheadBody(body, SOLAR_ISOTOMA_AHEAD_METRES), combatant, [solarIsotomaHit], {
          id: SOLAR_ISOTOMA_ID,
          secondsRemaining: getTalentMultiplier(talentMultiplierMap, ALBEDO_SKILL_GROUP_ID, TALENT_START_LEVEL, 2),
          spawnSeconds: SOLAR_ISOTOMA_HITMARK_FRAMES / 60,
        });
      },
      seconds: SOLAR_ISOTOMA_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    highPlunge: plungeAction(createFanReach(360, 5), HIGH_PLUNGE_POISE_DAMAGE, 10),
    lowPlunge: plungeAction(createFanReach(360, 3), LOW_PLUNGE_POISE_DAMAGE, 9),
    normalAttacks: NORMAL_ATTACK_STRIKES.map((strike, index) => createNormalAttack(strike, index)),
    // A hit that lands on an enemy inside the standing Solar Isotoma's field sets off a Transient Blossom at that enemy, once
    // Every 2 seconds, while the cooldown Albedo carries is not up
    onKitEvent: (event, { kitEffectState }, combatant) => {
      if (event.kind !== KitEventKind.DamageTaken) return;
      const { characterId } = combatant;
      const { effects } = kitEffectState;
      const solarIsotoma = findStandingKitSummon(effects, SOLAR_ISOTOMA_ID, characterId);
      if (!solarIsotoma) return;
      const { position } = event.enemy;
      if (
        Math.hypot(position.x - solarIsotoma.body.position.x, position.z - solarIsotoma.body.position.z) >
          SOLAR_ISOTOMA_RADIUS ||
        !startKitCooldown(
          kitEffectState,
          characterId,
          TRANSIENT_BLOSSOM_COOLDOWN_STATUS_ID,
          TRANSIENT_BLOSSOM_COOLDOWN_SECONDS,
        )
      )
        return;
      castKitSummon(kitEffectState, { facing: 0, height: 0, position }, solarIsotoma.combatant, [
        createTransientBlossomHit(),
      ]);
    },
    plungeCollision: {
      hitArea: createFanReach(360, 1),
      hitmarkSeconds: 0,
      poiseDamage: PLUNGE_COLLISION_POISE_DAMAGE,
      talentMultiplier: getTalentMultiplier(talentMultiplierMap, ALBEDO_ATTACK_GROUP_ID, TALENT_START_LEVEL, 8),
    },
    skillCooldownSeconds: getTalentMultiplier(talentMultiplierMap, ALBEDO_SKILL_GROUP_ID, TALENT_START_LEVEL, 3),
  };
};
