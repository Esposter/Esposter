import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";

import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import {
  PLUNGE_HIT_AREAS,
  SKILL_TARGETING_AREA,
  STRIKE_TARGETING_AREA,
  SUMMON_LINGER_SECONDS,
  UNBOUNDED_FIELD_RADIUS,
} from "#src/services/kit/constants";
import { createCircleReach } from "#src/services/kit/createCircleReach";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Dahlia's proud skill groups, read at her talent level. The attack group holds her four strikes at 0 to 4, the charged
// Attack's two hits at 5 and 6, its stamina at 7 and the plunges' collision, low and high at 8, 9 and 10. The skill group
// Holds Immersive Ordinance's DMG at 0 and its cooldown at 1. The burst group holds Radiant Psalter's DMG at 0, the
// Shield's flat HP at 1 and its share of Max HP at 2, Favonian Favor's seconds at 3, and its energy cost at 4 and cooldown at 5
const DAHLIA_ATTACK_GROUP_ID = 11531;
const DAHLIA_SKILL_GROUP_ID = 11532;
const DAHLIA_BURST_GROUP_ID = 11539;

export const DAHLIA_CHARACTER_ID = 10_000_115;

// Measured: gcsim (MIT, main) dahlia/attack.go, each strike's hitmarks, the frame its action cancels at by default, and its
// Circles, each centred on the offset gcsim gives it. Her third strike is two circles, and gcsim gives no poise to a strike
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/dahlia/attack.go
const NORMAL_ATTACKS: {
  cancelFrames: number;
  hits: { hitArea: AttackArea; hitmarkFrames: number; index: number }[];
}[] = [
  { cancelFrames: 32, hits: [{ hitArea: createCircleReach(0.5, 1.5), hitmarkFrames: 15, index: 0 }] },
  { cancelFrames: 34, hits: [{ hitArea: createCircleReach(0.5, 1.7), hitmarkFrames: 13, index: 1 }] },
  {
    cancelFrames: 47,
    hits: [
      { hitArea: createCircleReach(0.3, 1.7), hitmarkFrames: 14, index: 2 },
      { hitArea: createCircleReach(0.4, 1.5), hitmarkFrames: 15, index: 3 },
    ],
  },
  { cancelFrames: 71, hits: [{ hitArea: createCircleReach(0.6, 2.2), hitmarkFrames: 21, index: 4 }] },
];

// Measured: gcsim (MIT, main) dahlia/charge.go, the charged attack's two hits at 10 frames, both on a circle of 2.2 metres
// Round the body, in an animation of 67 frames. gcsim gives no poise to it
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/dahlia/charge.go
const CHARGED_ATTACK_FRAMES = 67;
const CHARGED_ATTACK_HITMARK_FRAMES = 10;
const CHARGED_ATTACK_HIT_AREA = createCircleReach(0, 2.2);
const CHARGED_ATTACK_INDEXES = [5, 6];

// Measured: gcsim (MIT, main) dahlia/skill.go, Immersive Ordinance's tap hit at 27 frames in an animation of 53, and its hold
// At 28 in one of 55, each a circle of 3 metres round the body. Its Hydro particles, which gcsim gives on an internal
// Cooldown, wait on the particle hook. The hold's threshold is not in gcsim, so the 0.5 seconds the other holds use is
// Provisional, detailed on the kit page's Decisions
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/dahlia/skill.go
const SKILL_TAP_FRAMES = 53;
const SKILL_TAP_HITMARK_FRAMES = 27;
const SKILL_HOLD_FRAMES = 55;
const SKILL_HOLD_HITMARK_FRAMES = 28;
const SKILL_HIT_AREA = createCircleReach(0, 3);
const HOLD_MINIMUM_HELD_SECONDS = 0.5;

// Measured: gcsim (MIT, main) dahlia/burst.go, Radiant Psalter's hit at 30 frames on a circle of 5.5 metres 0.8 metres
// Ahead of the body, in an animation of 55 frames. Its shield comes 31 frames in, and the Benison stacks that regenerate
// It wait on the Benison hook. gcsim gives the burst no poise
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/dahlia/burst.go
const BURST_FRAMES = 55;
const BURST_HITMARK_FRAMES = 30;
const BURST_HIT_AREA = createCircleReach(0.8, 5.5);
const SHIELD_FRAMES = 31;

// Provisional: gcsim has no plunge file for Dahlia, so her plunges' reach is the kit constants' borrowed one, each hits as
// Its action starts, and its seconds are the standard the other plunges borrow, as Mizuki's are
const PLUNGE_SECONDS = 0.4;

// Dahlia's first kit, at talent level 1: her four strikes, a charged attack, a collision and two plunges, the skill's tap
// And hold, and the burst with its shield. Her multipliers are read from her proud skill groups
export const createDahliaKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, DAHLIA_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
  const burstMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, DAHLIA_BURST_GROUP_ID, TALENT_START_LEVEL, index);
  const skillMultiplier = getTalentMultiplier(talentMultiplierMap, DAHLIA_SKILL_GROUP_ID, TALENT_START_LEVEL, 0);
  const skillCooldownSeconds = getTalentMultiplier(talentMultiplierMap, DAHLIA_SKILL_GROUP_ID, TALENT_START_LEVEL, 1);
  const burstShieldFlat = burstMultiplier(1);
  const burstShieldShare = burstMultiplier(2);
  const favonianFavorSeconds = burstMultiplier(3);

  const normalAttacks = NORMAL_ATTACKS.map(({ cancelFrames, hits }): KitAction => ({
    hits: hits.map(({ hitArea, hitmarkFrames, index }) => ({
      hitArea,
      hitmarkSeconds: hitmarkFrames / 60,
      poiseDamage: 0,
      talentMultiplier: attackMultiplier(index),
    })),
    seconds: cancelFrames / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  }));
  // Provisional: each plunge hits as its action starts, its seconds and poise the standard, not measured for Dahlia
  const createPlunge = (hitArea: AttackArea, poiseDamage: number, index: number): KitAction => ({
    hits: [{ hitArea, hitmarkSeconds: 0, poiseDamage, talentMultiplier: attackMultiplier(index) }],
    seconds: PLUNGE_SECONDS,
    targetingArea: STRIKE_TARGETING_AREA,
  });
  const createSkill = (frames: number, hitmarkFrames: number): KitAction => ({
    hits: [
      {
        gauge: 1,
        hitArea: SKILL_HIT_AREA,
        hitmarkSeconds: hitmarkFrames / 60,
        poiseDamage: 0,
        talentMultiplier: skillMultiplier,
      },
    ],
    seconds: frames / 60,
    targetingArea: SKILL_TARGETING_AREA,
  });

  return {
    burstCooldownSeconds: burstMultiplier(5),
    burstEnergyCost: burstMultiplier(4),
    chargedAttack: {
      hits: CHARGED_ATTACK_INDEXES.map((index) => ({
        hitArea: CHARGED_ATTACK_HIT_AREA,
        hitmarkSeconds: CHARGED_ATTACK_HITMARK_FRAMES / 60,
        poiseDamage: 0,
        talentMultiplier: attackMultiplier(index),
      })),
      seconds: CHARGED_ATTACK_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    chargedAttackStamina: attackMultiplier(7),
    elementalBurst: {
      hits: [
        {
          gauge: 2,
          hitArea: BURST_HIT_AREA,
          hitmarkSeconds: BURST_HITMARK_FRAMES / 60,
          poiseDamage: 0,
          talentMultiplier: burstMultiplier(0),
        },
      ],
      // Radiant Psalter's shield comes SHIELD_FRAMES in and holds the Favonian Favor's seconds. It is a field that ticks once,
      // Since a shield is placed when its tick falls, and the shield then reads the caster's Max HP as it stands then
      onStart: ({ activeCombatant: combatant, body: { position }, kitEffectState }) =>
        addKitEffect(kitEffectState, {
          centre: { x: position.x, z: position.z },
          characterId: combatant.characterId,
          kind: "field",
          nextTickSeconds: SHIELD_FRAMES / 60,
          onTick: ({ kitEffectState: tickState }) =>
            addKitEffect(tickState, {
              characterId: combatant.characterId,
              element: Element.Hydro,
              health: burstShieldShare * combatant.attributes.maxHealth + burstShieldFlat,
              kind: "shield",
              secondsRemaining: favonianFavorSeconds,
            }),
          radius: UNBOUNDED_FIELD_RADIUS,
          secondsRemaining: SHIELD_FRAMES / 60 + SUMMON_LINGER_SECONDS,
          tickIndex: 0,
          tickIntervalSeconds: 1,
        }),
      seconds: BURST_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    elementalSkill: createSkill(SKILL_TAP_FRAMES, SKILL_TAP_HITMARK_FRAMES),
    elementalSkillHolds: [
      {
        action: createSkill(SKILL_HOLD_FRAMES, SKILL_HOLD_HITMARK_FRAMES),
        cooldownSeconds: skillCooldownSeconds,
        minimumHeldSeconds: HOLD_MINIMUM_HELD_SECONDS,
      },
    ],
    highPlunge: createPlunge(PLUNGE_HIT_AREAS.high, 150, 10),
    lowPlunge: createPlunge(PLUNGE_HIT_AREAS.low, 100, 9),
    normalAttacks,
    plungeCollision: {
      hitArea: PLUNGE_HIT_AREAS.collision,
      hitmarkSeconds: 0,
      poiseDamage: 25,
      talentMultiplier: attackMultiplier(8),
    },
    skillCooldownSeconds,
  };
};
