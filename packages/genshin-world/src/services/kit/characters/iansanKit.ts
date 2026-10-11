import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";

import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { PLUNGE_HIT_AREAS, SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA } from "#src/services/kit/constants";
import { createBoxReach } from "#src/services/kit/createBoxReach";
import { createCircleReach } from "#src/services/kit/createCircleReach";
import { createFanReach } from "#src/services/kit/createFanReach";
import { createTargetedHitArea } from "#src/services/kit/createTargetedHitArea";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Iansan's proud skill groups, read at her talent level. The attack group holds her three strikes at 0 to 2, the charged
// Attack at 3, its Swift Stormflight at 4, its stamina at 5 and the plunges' collision, low and high at 6, 7 and 8. The
// Skill group holds Thunderbolt Rush's Skill DMG at 0 and its cooldown at 2. The burst group holds The Three Principles of
// Power's Skill DMG at 0, its cooldown at 6 and energy cost at 7
const IANSAN_ATTACK_GROUP_ID = 11031;
const IANSAN_SKILL_GROUP_ID = 11032;
const IANSAN_BURST_GROUP_ID = 11039;

export const IANSAN_CHARACTER_ID = 10_000_110;

// Measured: gcsim (MIT) iansan/attack.go, each strike's hitmark and its animation. gcsim queues each strike's damage at its
// Hitmark with no travel, so each lands there. The first is a fan of 260 degrees, 1.75 metres, centred 0.4 metres ahead of
// The body, the second a circle of 2 metres centred 0.5 metres ahead, and the third a box of 2.2 metres by 3 on its near
// Edge 0.5 metres behind the body, of 59.896 blunt poise
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/iansan/attack.go
const NORMAL_ATTACKS: {
  frames: number;
  hitArea: AttackArea;
  hitmarkFrames: number;
  isBlunt?: true;
  poiseDamage: number;
  talentIndex: number;
}[] = [
  { frames: 27, hitArea: createFanReach(260, 0.4 + 1.75), hitmarkFrames: 14, poiseDamage: 0, talentIndex: 0 },
  { frames: 31, hitArea: createCircleReach(0.5, 2), hitmarkFrames: 7, poiseDamage: 0, talentIndex: 1 },
  {
    frames: 55,
    hitArea: createBoxReach(-0.5, 2.2, 3),
    hitmarkFrames: 22,
    isBlunt: true,
    poiseDamage: 59.896,
    talentIndex: 2,
  },
];
// Measured: gcsim (MIT) iansan/charge.go, a circle of 0.8 metres centred on the primary target at 21 frames, in an
// Animation of 55 frames, Physical, so it carries no gauge
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/iansan/charge.go
const CHARGED_ATTACK_HITMARK_FRAMES = 21;
const CHARGED_ATTACK_HIT_AREA = createTargetedHitArea(STRIKE_TARGETING_AREA, 0.8);
const CHARGED_ATTACK_FRAMES = 55;
// Provisional: gcsim has no plunge file for Iansan, so her plunges' reach is the kit constants' borrowed one, each hits as
// Its action starts, and its seconds are the standard the other plunges borrow, as Mizuki's are
const PLUNGE_SECONDS = 0.4;
// Measured: gcsim (MIT) iansan/skill.go, Thunderbolt Rush's activation hit at 9 frames on a circle of 0.8 metres centred on
// The primary target, Electro at one unit of gauge, in an animation of 137 frames
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/iansan/skill.go
const SKILL_HITMARK_FRAMES = 9;
const SKILL_FRAMES = 137;
const SKILL_HIT_AREA = createTargetedHitArea(SKILL_TARGETING_AREA, 0.8);
// Measured: gcsim (MIT) iansan/burst.go, The Three Principles of Power's hit at 38 frames on a circle of 5 metres round the
// Body, Electro at one unit of gauge, of 180 blunt poise, in an animation of 45 frames
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/iansan/burst.go
const BURST_HITMARK_FRAMES = 38;
const BURST_FRAMES = 45;
const BURST_HIT_AREA = createCircleReach(0, 5);
const BURST_POISE_DAMAGE = 180;

// Iansan's first kit, at talent level 1: her three strikes, a charged attack, a collision and two plunges, the skill's
// Activation hit and the burst's hit. Her multipliers are read from her proud skill groups
export const createIansanKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, IANSAN_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
  const burstMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, IANSAN_BURST_GROUP_ID, TALENT_START_LEVEL, index);
  const skillMultiplier = getTalentMultiplier(talentMultiplierMap, IANSAN_SKILL_GROUP_ID, TALENT_START_LEVEL, 0);
  const normalAttacks = NORMAL_ATTACKS.map(
    ({ frames, hitArea, hitmarkFrames, isBlunt, poiseDamage, talentIndex }): KitAction => ({
      hits: [
        {
          hitArea,
          hitmarkSeconds: hitmarkFrames / 60,
          internalCooldownTag: InternalCooldownTag.NormalAttack,
          ...(isBlunt && { isBlunt }),
          poiseDamage,
          talentMultiplier: attackMultiplier(talentIndex),
        },
      ],
      seconds: frames / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    }),
  );
  // Provisional: each plunge hits as its action starts, its seconds and poise the standard, not measured for Iansan
  const createPlunge = (hitArea: AttackArea, poiseDamage: number, groupIndex: number): KitAction => ({
    hits: [{ hitArea, hitmarkSeconds: 0, poiseDamage, talentMultiplier: attackMultiplier(groupIndex) }],
    seconds: PLUNGE_SECONDS,
    targetingArea: STRIKE_TARGETING_AREA,
  });
  return {
    burstCooldownSeconds: burstMultiplier(6),
    burstEnergyCost: burstMultiplier(7),
    chargedAttack: {
      hits: [
        {
          hitArea: CHARGED_ATTACK_HIT_AREA,
          hitmarkSeconds: CHARGED_ATTACK_HITMARK_FRAMES / 60,
          internalCooldownTag: InternalCooldownTag.ChargedAttack,
          poiseDamage: 0,
          talentMultiplier: attackMultiplier(3),
        },
      ],
      seconds: CHARGED_ATTACK_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    chargedAttackStamina: attackMultiplier(5),
    // Not built: the Nightsoul state the skill's press enters, which swaps her charged attack for the Electro Swift
    // Stormflight, drains her Nightsoul points and gives the burst's party ATK bonus, its conversion of those points into
    // ATK on the active character. Each waits on the Nightsoul state hook, so the press here is its activation hit only
    elementalBurst: {
      hits: [
        {
          gauge: 1,
          hitArea: BURST_HIT_AREA,
          hitmarkSeconds: BURST_HITMARK_FRAMES / 60,
          poiseDamage: BURST_POISE_DAMAGE,
          talentMultiplier: burstMultiplier(0),
        },
      ],
      seconds: BURST_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    elementalSkill: {
      hits: [
        {
          gauge: 1,
          hitArea: SKILL_HIT_AREA,
          hitmarkSeconds: SKILL_HITMARK_FRAMES / 60,
          poiseDamage: 0,
          talentMultiplier: skillMultiplier,
        },
      ],
      seconds: SKILL_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    highPlunge: createPlunge(PLUNGE_HIT_AREAS.high, 150, 8),
    lowPlunge: createPlunge(PLUNGE_HIT_AREAS.low, 100, 7),
    normalAttacks,
    plungeCollision: {
      hitArea: PLUNGE_HIT_AREAS.collision,
      hitmarkSeconds: 0,
      poiseDamage: 25,
      talentMultiplier: attackMultiplier(6),
    },
    skillCooldownSeconds: getTalentMultiplier(talentMultiplierMap, IANSAN_SKILL_GROUP_ID, TALENT_START_LEVEL, 2),
  };
};
