import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitHit } from "#src/models/kit/KitHit";

import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { PLUNGE_HIT_AREAS, SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA } from "#src/services/kit/constants";
import { createCircleReach } from "#src/services/kit/createCircleReach";
import { createTargetedHitArea } from "#src/services/kit/createTargetedHitArea";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Ifa's proud skill groups, read at her talent level. The attack group holds the three normal attacks at 0 to 2, the charged
// Attack at 3, its stamina at 4, and the plunges' collision, low and high at 5, 6 and 7. The skill group holds Tonic Shot at 0
// And its cooldown at 4, and the burst group holds Compound Sedation Field's hit at 0, the marks' at 1, its cooldown at 2 and
// Its energy cost at 3
const IFA_ATTACK_GROUP_ID = 11331;
const IFA_SKILL_GROUP_ID = 11332;
const IFA_BURST_GROUP_ID = 11339;
const CHARGED_ATTACK_MULTIPLIER_INDEX = 3;
const CHARGED_ATTACK_STAMINA_INDEX = 4;
const PLUNGE_COLLISION_MULTIPLIER_INDEX = 5;
const LOW_PLUNGE_MULTIPLIER_INDEX = 6;
const HIGH_PLUNGE_MULTIPLIER_INDEX = 7;
const SKILL_COOLDOWN_INDEX = 4;
const BURST_MULTIPLIER_INDEX = 0;
const BURST_COOLDOWN_INDEX = 2;
const BURST_ENERGY_COST_INDEX = 3;

// Measured: gcsim (MIT, main) ifa/attack.go, the three normal attacks' hitmarks, cancels and reaches. Each is a circle of
// Radius 0.7 on the primary target, which the target is priced as. gcsim gives no poise to a normal attack, so each reads 0
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/ifa/attack.go
const NORMAL_ATTACK_FRAMES: readonly { cancelFrames: number; hitmarkFrames: number }[] = [
  { cancelFrames: 27, hitmarkFrames: 10 },
  { cancelFrames: 31, hitmarkFrames: 13 },
  { cancelFrames: 88, hitmarkFrames: 42 },
];
const NORMAL_ATTACK_HIT_AREA: AttackArea = createTargetedHitArea(STRIKE_TARGETING_AREA, 0.7);

// Measured: gcsim (MIT, main) ifa/charge.go, the Charge Attack's animation at 86 frames and its hit at 45 as a circle of
// Radius 1.5 on the primary target, which the target is priced as. gcsim gives it no poise
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/ifa/charge.go
const CHARGED_ATTACK_FRAMES = 86;
const CHARGED_ATTACK_HITMARK_FRAMES = 45;
const CHARGED_ATTACK_HIT_AREA: AttackArea = createTargetedHitArea(STRIKE_TARGETING_AREA, 1.5);

// Measured: gcsim (MIT, main) ifa/plunge.go, the low plunge's animation at 71 frames and its hit at 38 as a circle of radius
// 3 round the body, and the collision at 32 frames as a circle of radius 1.5. gcsim plays the low plunge only after the
// Nightsoul Blessing ends, which the framework does not hold, so until that hook the plunge is not gated. gcsim gives the
// Plunges no poise. gcsim has no high plunge, so the high plunge takes the shared reach and the low plunge's animation
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/ifa/plunge.go
const LOW_PLUNGE_FRAMES = 71;
const LOW_PLUNGE_HITMARK_FRAMES = 38;
const LOW_PLUNGE_HIT_AREA: AttackArea = createCircleReach(0, 3);
const PLUNGE_COLLISION_HITMARK_FRAMES = 32;
const PLUNGE_COLLISION_HIT_AREA: AttackArea = createCircleReach(0, 1.5);

// Measured: gcsim (MIT, main) ifa/skill.go, the press enters the Nightsoul Blessing, which is not built. The press's action
// Is a placeholder that spends the 7.5-second cooldown the table gives, until the Nightsoul hook lands, as Mavuika's does
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/ifa/skill.go
const SKILL_PRESS_SECONDS = 5 / 60;

// Measured: gcsim (MIT, main) ifa/burst.go, Compound Sedation Field's animation at 95 frames and its hit at 41 as a circle of
// Radius 6 on the primary target, with no poise. Its sedation marks, which strike each enemy in the field with the enemy's
// Aura, are not built: they wait on the sedation-mark hook
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/ifa/burst.go
const BURST_FRAMES = 95;
const BURST_HITMARK_FRAMES = 41;
const BURST_HIT_AREA: AttackArea = createTargetedHitArea(SKILL_TARGETING_AREA, 6);

export const IFA_CHARACTER_ID = 10_000_113;

// Ifa's kit outside her Nightsoul Blessing: her three normal attacks, charged attack, Compound Sedation Field's hit, and her
// Low and collision plunges. Her Tonic Shot, healing, sedation marks and passives and constellations wait on the Nightsoul hook
// And the sedation-mark hook, and her high plunge is borrowed as the page records
export const createIfaKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, IFA_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
  const burstMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, IFA_BURST_GROUP_ID, TALENT_START_LEVEL, index);
  const createNormalAttack = (
    { cancelFrames, hitmarkFrames }: (typeof NORMAL_ATTACK_FRAMES)[number],
    index: number,
  ): KitAction => ({
    hits: [
      {
        hitArea: NORMAL_ATTACK_HIT_AREA,
        hitmarkSeconds: hitmarkFrames / 60,
        poiseDamage: 0,
        talentMultiplier: attackMultiplier(index),
      },
    ],
    seconds: cancelFrames / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  });
  const createPlunge = (
    frames: number,
    hitmarkFrames: number,
    hitArea: AttackArea,
    multiplierIndex: number,
  ): KitAction => ({
    hits: [
      {
        hitArea,
        hitmarkSeconds: hitmarkFrames / 60,
        poiseDamage: 0,
        talentMultiplier: attackMultiplier(multiplierIndex),
      },
    ],
    seconds: frames / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  });
  const chargedAttackHit: KitHit = {
    hitArea: CHARGED_ATTACK_HIT_AREA,
    hitmarkSeconds: CHARGED_ATTACK_HITMARK_FRAMES / 60,
    poiseDamage: 0,
    talentMultiplier: attackMultiplier(CHARGED_ATTACK_MULTIPLIER_INDEX),
  };
  return {
    burstCooldownSeconds: burstMultiplier(BURST_COOLDOWN_INDEX),
    burstEnergyCost: burstMultiplier(BURST_ENERGY_COST_INDEX),
    chargedAttack: {
      hits: [chargedAttackHit],
      seconds: CHARGED_ATTACK_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    chargedAttackStamina: attackMultiplier(CHARGED_ATTACK_STAMINA_INDEX),
    elementalBurst: {
      hits: [
        {
          hitArea: BURST_HIT_AREA,
          hitmarkSeconds: BURST_HITMARK_FRAMES / 60,
          poiseDamage: 0,
          talentMultiplier: burstMultiplier(BURST_MULTIPLIER_INDEX),
        },
      ],
      seconds: BURST_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    elementalSkill: { hits: [], seconds: SKILL_PRESS_SECONDS, targetingArea: SKILL_TARGETING_AREA },
    highPlunge: createPlunge(LOW_PLUNGE_FRAMES, 0, PLUNGE_HIT_AREAS.high, HIGH_PLUNGE_MULTIPLIER_INDEX),
    lowPlunge: createPlunge(
      LOW_PLUNGE_FRAMES,
      LOW_PLUNGE_HITMARK_FRAMES,
      LOW_PLUNGE_HIT_AREA,
      LOW_PLUNGE_MULTIPLIER_INDEX,
    ),
    normalAttacks: NORMAL_ATTACK_FRAMES.map((frames, index) => createNormalAttack(frames, index)),
    plungeCollision: {
      hitArea: PLUNGE_COLLISION_HIT_AREA,
      hitmarkSeconds: PLUNGE_COLLISION_HITMARK_FRAMES / 60,
      poiseDamage: 0,
      talentMultiplier: attackMultiplier(PLUNGE_COLLISION_MULTIPLIER_INDEX),
    },
    skillCooldownSeconds: getTalentMultiplier(
      talentMultiplierMap,
      IFA_SKILL_GROUP_ID,
      TALENT_START_LEVEL,
      SKILL_COOLDOWN_INDEX,
    ),
  };
};
