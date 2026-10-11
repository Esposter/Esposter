import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitHit } from "#src/models/kit/KitHit";

import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { createBoxReach } from "#src/services/kit/createBoxReach";
import { createCircleReach } from "#src/services/kit/createCircleReach";
import { SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA } from "#src/services/kit/constants";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Mavuika's proud skill groups, read at her talent level. The attack group holds the four strikes at 0 to 3, the charged
// Attack at 4, its stamina at 5, and the plunges' collision, low and high at 6, 7 and 8. The skill group holds the skill's
// Cooldown at 13, and the burst group holds Sunfell Slice at 0, its radius at 1 and its cooldown at 7
const MAVUIKA_ATTACK_GROUP_ID = 10631;
const MAVUIKA_SKILL_GROUP_ID = 10632;
const MAVUIKA_BURST_GROUP_ID = 10639;
const CHARGED_ATTACK_STAMINA_INDEX = 5;
const SKILL_COOLDOWN_INDEX = 13;
const BURST_COOLDOWN_INDEX = 7;

// Measured: gcsim (MIT, main) mavuika/attack.go, the ring-state strikes' hitmarks, cancels, poise and reaches. These are the
// Strikes she makes outside the Flamestrider, before the Nightsoul Blessing's bike replaces them. The second and third
// Strikes are boxes, priced as the circle to their far corner
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/mavuika/attack.go
const NORMAL_ATTACK_FRAMES: readonly {
  cancelFrames: number;
  hitmarkFrames: number[];
  hitArea: AttackArea;
  poiseDamage: number;
}[] = [
  { cancelFrames: 40, hitArea: createCircleReach(0.5, 2.2), hitmarkFrames: [21], poiseDamage: 107 },
  { cancelFrames: 50, hitArea: createBoxReach(-1.3, 3.3, 4.3), hitmarkFrames: [14, 26], poiseDamage: 48.8 },
  { cancelFrames: 59, hitArea: createBoxReach(0.5, 2.8, 5), hitmarkFrames: [28, 33, 39], poiseDamage: 44.43 },
  { cancelFrames: 61, hitArea: createCircleReach(-0.8, 3.2), hitmarkFrames: [30], poiseDamage: 155.4 },
];

// Measured: gcsim (MIT, main) mavuika/charge.go, the Charged Attack's animation at 99 frames and its hit at 79 as a circle
// Of radius 3.3 ahead of the body, with the 120 poise gcsim gives it, costing the 50 stamina ActionStam gives a charge
const CHARGED_ATTACK_FRAMES = 99;
const CHARGED_ATTACK_HITMARK_FRAMES = 79;
const CHARGED_ATTACK_HIT_AREA = createCircleReach(0.3, 3.3);
const CHARGED_ATTACK_POISE_DAMAGE = 120;

// Measured: gcsim (MIT, main) mavuika/plunge.go, the low plunge's animation at 80 frames and its hit at 37 as a circle of
// Radius 3 ahead, with 150 poise, and the high plunge's at 83 frames and 41 as a circle of radius 5, with 200 poise. The
// Collision is its own hit at 31 frames, a circle of radius 1 ahead. gcsim queues it only when a plunge's collision option is
// Set, where the framework's collision strikes on every plunge, as the Emilie page's manual question records
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/mavuika/plunge.go
const LOW_PLUNGE_FRAMES = 80;
const LOW_PLUNGE_HITMARK_FRAMES = 37;
const LOW_PLUNGE_HIT_AREA = createCircleReach(1, 3);
const LOW_PLUNGE_POISE_DAMAGE = 150;
const HIGH_PLUNGE_FRAMES = 83;
const HIGH_PLUNGE_HITMARK_FRAMES = 41;
const HIGH_PLUNGE_HIT_AREA = createCircleReach(1, 5);
const HIGH_PLUNGE_POISE_DAMAGE = 200;
const PLUNGE_COLLISION_HITMARK_FRAMES = 31;
const PLUNGE_COLLISION_HIT_AREA = createCircleReach(1, 1);

// Measured: gcsim (MIT, main) mavuika/skill.go, the skill's press animation at 28 frames. The press starts the Nightsoul
// Blessing and its Ring of Searing Radiance, which are not built, so the press has no hit yet and spends its cooldown
const SKILL_FRAMES = 28;

// Measured: gcsim (MIT, main) mavuika/burst.go, Sunfell Slice's animation at 141 frames. Its hit is not built: the burst is
// Paid in Fighting Spirit, which the party's Nightsoul points feed and the framework does not hold, so until that hook lands
// The burst's energy cost is unreachable, and the burst cannot be cast
const BURST_FRAMES = 141;
const UNREACHABLE_BURST_ENERGY_COST = Number.POSITIVE_INFINITY;

export const MAVUIKA_CHARACTER_ID = 10_000_106;

// Mavuika's kit outside her Nightsoul Blessing: her four strikes, her charged attack, and her low, high and collision
// Plunges. Her skill and burst are not built, so they have no hit: the skill's press waits on the Nightsoul Blessing and
// The burst on Fighting Spirit, both on the Nightsoul hook
export const createMavuikaKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const createNormalAttack = (
    { cancelFrames, hitArea, hitmarkFrames, poiseDamage }: (typeof NORMAL_ATTACK_FRAMES)[number],
    index: number,
  ): KitAction => ({
    hits: hitmarkFrames.map((hitmark): KitHit => ({
      hitArea,
      hitmarkSeconds: hitmark / 60,
      poiseDamage,
      talentMultiplier: getTalentMultiplier(talentMultiplierMap, MAVUIKA_ATTACK_GROUP_ID, TALENT_START_LEVEL, index),
    })),
    seconds: cancelFrames / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  });
  const chargedAttackHit: KitHit = {
    hitArea: CHARGED_ATTACK_HIT_AREA,
    hitmarkSeconds: CHARGED_ATTACK_HITMARK_FRAMES / 60,
    poiseDamage: CHARGED_ATTACK_POISE_DAMAGE,
    talentMultiplier: getTalentMultiplier(talentMultiplierMap, MAVUIKA_ATTACK_GROUP_ID, TALENT_START_LEVEL, 4),
  };
  return {
    burstCooldownSeconds: getTalentMultiplier(
      talentMultiplierMap,
      MAVUIKA_BURST_GROUP_ID,
      TALENT_START_LEVEL,
      BURST_COOLDOWN_INDEX,
    ),
    burstEnergyCost: UNREACHABLE_BURST_ENERGY_COST,
    chargedAttack: {
      hits: [chargedAttackHit],
      seconds: CHARGED_ATTACK_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    chargedAttackStamina: getTalentMultiplier(
      talentMultiplierMap,
      MAVUIKA_ATTACK_GROUP_ID,
      TALENT_START_LEVEL,
      CHARGED_ATTACK_STAMINA_INDEX,
    ),
    elementalBurst: { hits: [], seconds: BURST_FRAMES / 60, targetingArea: SKILL_TARGETING_AREA },
    elementalSkill: { hits: [], seconds: SKILL_FRAMES / 60, targetingArea: SKILL_TARGETING_AREA },
    highPlunge: {
      hits: [
        {
          hitArea: HIGH_PLUNGE_HIT_AREA,
          hitmarkSeconds: HIGH_PLUNGE_HITMARK_FRAMES / 60,
          poiseDamage: HIGH_PLUNGE_POISE_DAMAGE,
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, MAVUIKA_ATTACK_GROUP_ID, TALENT_START_LEVEL, 8),
        },
      ],
      seconds: HIGH_PLUNGE_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    lowPlunge: {
      hits: [
        {
          hitArea: LOW_PLUNGE_HIT_AREA,
          hitmarkSeconds: LOW_PLUNGE_HITMARK_FRAMES / 60,
          poiseDamage: LOW_PLUNGE_POISE_DAMAGE,
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, MAVUIKA_ATTACK_GROUP_ID, TALENT_START_LEVEL, 7),
        },
      ],
      seconds: LOW_PLUNGE_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    normalAttacks: NORMAL_ATTACK_FRAMES.map((frames, index) => createNormalAttack(frames, index)),
    plungeCollision: {
      hitArea: PLUNGE_COLLISION_HIT_AREA,
      hitmarkSeconds: PLUNGE_COLLISION_HITMARK_FRAMES / 60,
      poiseDamage: 0,
      talentMultiplier: getTalentMultiplier(talentMultiplierMap, MAVUIKA_ATTACK_GROUP_ID, TALENT_START_LEVEL, 6),
    },
    skillCooldownSeconds: getTalentMultiplier(
      talentMultiplierMap,
      MAVUIKA_SKILL_GROUP_ID,
      TALENT_START_LEVEL,
      SKILL_COOLDOWN_INDEX,
    ),
  };
};
