import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";

import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { PLUNGE_HIT_AREAS, SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA } from "#src/services/kit/constants";
import { createCircleReach } from "#src/services/kit/createCircleReach";
import { createTargetedHitArea } from "#src/services/kit/createTargetedHitArea";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Mizuki's proud skill groups, read at her talent level. The attack group holds her three strikes at 0 to 2, the charged
// Attack at 3, its stamina at 4 and the plunges' collision, low and high at 5, 6 and 7. The skill group holds Aisa
// Utamakura Pilgrimage's Skill DMG at 3 and its cooldown at 2. The burst group holds Anraku Secret Spring Therapy's DMG at
// 0 and its cooldown at 3 and energy cost at 4
const MIZUKI_ATTACK_GROUP_ID = 10931;
const MIZUKI_SKILL_GROUP_ID = 10932;
const MIZUKI_BURST_GROUP_ID = 10939;

export const MIZUKI_CHARACTER_ID = 10_000_109;

// Measured: gcsim (MIT) mizuki/attack.go, each strike's hitmark and its animation, and its circle of 0.7 metres centred on
// The primary target. gcsim queues each strike's damage a travel of 10 frames past its hitmark, its default, so each lands
// At its hitmark plus that travel
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/mizuki/attack.go
const NORMAL_ATTACK_TRAVEL_FRAMES = 10;
const NORMAL_ATTACKS: { frames: number; hitmarkFrames: number; talentIndex: number }[] = [
  { frames: 34, hitmarkFrames: 7, talentIndex: 0 },
  { frames: 38, hitmarkFrames: 19, talentIndex: 1 },
  { frames: 98, hitmarkFrames: 37, talentIndex: 2 },
];
const NORMAL_ATTACK_HIT_AREA = createTargetedHitArea(STRIKE_TARGETING_AREA, 0.7);
// Measured: gcsim (MIT) mizuki/charge.go, a circle of 3.5 metres centred on the primary target at 39 frames, in an
// Animation of 81 frames. Cast out of the air, gcsim delays it 14 frames, a windup the kit does not hold
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/mizuki/charge.go
const CHARGED_ATTACK_HITMARK_FRAMES = 39;
const CHARGED_ATTACK_HIT_AREA = createTargetedHitArea(STRIKE_TARGETING_AREA, 3.5);
const CHARGED_ATTACK_FRAMES = 81;
// Provisional: gcsim has no plunge file for Mizuki, so her plunges' reach is the kit constants' borrowed one, each hits as
// Its action starts, and its seconds are the standard the other plunges borrow, as Kinich's are
const PLUNGE_SECONDS = 0.4;
// Measured: gcsim (MIT) mizuki/skill.go, Aisa Utamakura Pilgrimage's activation hit at 2 frames on a circle of 5.5 metres
// Round the body, in an animation of 50 frames
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/mizuki/skill.go
const SKILL_HITMARK_FRAMES = 2;
const SKILL_FRAMES = 50;
const SKILL_HIT_AREA = createCircleReach(0, 5.5);
const SKILL_POISE_DAMAGE = 30;
// Measured: gcsim (MIT) mizuki/burst.go, Anraku Secret Spring Therapy's hit at 93 frames on a circle of 8 metres centred on
// The primary target, in an animation of 94 frames, of 100 poise
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/mizuki/burst.go
const BURST_HITMARK_FRAMES = 93;
const BURST_FRAMES = 94;
const BURST_HIT_AREA = createTargetedHitArea(SKILL_TARGETING_AREA, 8);
const BURST_POISE_DAMAGE = 100;

// Mizuki's first kit, at talent level 1: her three strikes, a charged attack, a collision and two plunges, the skill's
// Activation hit and the burst's hit. Her multipliers are read from her proud skill groups
export const createMizukiKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, MIZUKI_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
  const burstMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, MIZUKI_BURST_GROUP_ID, TALENT_START_LEVEL, index);
  const skillMultiplier = getTalentMultiplier(talentMultiplierMap, MIZUKI_SKILL_GROUP_ID, TALENT_START_LEVEL, 3);
  const normalAttacks = NORMAL_ATTACKS.map(({ frames, hitmarkFrames, talentIndex }): KitAction => ({
    hits: [
      {
        gauge: 1,
        hitArea: NORMAL_ATTACK_HIT_AREA,
        hitmarkSeconds: (hitmarkFrames + NORMAL_ATTACK_TRAVEL_FRAMES) / 60,
        internalCooldownTag: InternalCooldownTag.NormalAttack,
        poiseDamage: 0,
        talentMultiplier: attackMultiplier(talentIndex),
      },
    ],
    seconds: frames / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  }));
  // Provisional: each plunge hits as its action starts, its seconds and poise the standard, not measured for Mizuki
  const createPlunge = (hitArea: AttackArea, poiseDamage: number, groupIndex: number): KitAction => ({
    hits: [{ hitArea, hitmarkSeconds: 0, poiseDamage, talentMultiplier: attackMultiplier(groupIndex) }],
    seconds: PLUNGE_SECONDS,
    targetingArea: STRIKE_TARGETING_AREA,
  });
  return {
    burstCooldownSeconds: burstMultiplier(3),
    burstEnergyCost: burstMultiplier(4),
    chargedAttack: {
      hits: [
        {
          gauge: 1,
          hitArea: CHARGED_ATTACK_HIT_AREA,
          hitmarkSeconds: CHARGED_ATTACK_HITMARK_FRAMES / 60,
          poiseDamage: 0,
          talentMultiplier: attackMultiplier(3),
        },
      ],
      seconds: CHARGED_ATTACK_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    chargedAttackStamina: attackMultiplier(4),
    elementalBurst: {
      hits: [
        {
          gauge: 2,
          hitArea: BURST_HIT_AREA,
          hitmarkSeconds: BURST_HITMARK_FRAMES / 60,
          poiseDamage: BURST_POISE_DAMAGE,
          talentMultiplier: burstMultiplier(0),
        },
      ],
      seconds: BURST_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    // Not built: the Dreamdrifter state the press enters, with its clouds of Anemo that drift on the field and its
    // Pick-up of the snacks the burst leaves, which the skill's and burst's Ascensions and Constellations read too. The
    // Press deals its activation hit only, so the clouds wait on the Dreamdrifter state's hook
    elementalSkill: {
      hits: [
        {
          gauge: 1,
          hitArea: SKILL_HIT_AREA,
          hitmarkSeconds: SKILL_HITMARK_FRAMES / 60,
          poiseDamage: SKILL_POISE_DAMAGE,
          talentMultiplier: skillMultiplier,
        },
      ],
      seconds: SKILL_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    highPlunge: createPlunge(PLUNGE_HIT_AREAS.high, 150, 7),
    lowPlunge: createPlunge(PLUNGE_HIT_AREAS.low, 100, 6),
    normalAttacks,
    plungeCollision: {
      hitArea: PLUNGE_HIT_AREAS.collision,
      hitmarkSeconds: 0,
      poiseDamage: 25,
      talentMultiplier: attackMultiplier(5),
    },
    skillCooldownSeconds: getTalentMultiplier(talentMultiplierMap, MIZUKI_SKILL_GROUP_ID, TALENT_START_LEVEL, 2),
  };
};
