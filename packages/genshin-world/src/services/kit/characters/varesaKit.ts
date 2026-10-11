import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitHit } from "#src/models/kit/KitHit";

import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { createBoxReach } from "#src/services/kit/createBoxReach";
import { createCircleReach } from "#src/services/kit/createCircleReach";
import { SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA } from "#src/services/kit/constants";
import { createTargetedHitArea } from "#src/services/kit/createTargetedHitArea";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Varesa's proud skill groups, read at her talent level. The attack group holds the three strikes at 0 to 2, the charged
// Attack at 3, its stamina at 4, and the plunges' collision, low and high at 5, 6 and 7. The skill group holds Rush at 0
// And its cooldown at 4, and the burst group holds Flying Kick at 0, its cooldown at 2 and its energy cost at 3
const VARESA_ATTACK_GROUP_ID = 11131;
const VARESA_SKILL_GROUP_ID = 11132;
const VARESA_BURST_GROUP_ID = 11139;
const CHARGED_ATTACK_MULTIPLIER_INDEX = 3;
const CHARGED_ATTACK_STAMINA_INDEX = 4;
const PLUNGE_COLLISION_MULTIPLIER_INDEX = 5;
const LOW_PLUNGE_MULTIPLIER_INDEX = 6;
const HIGH_PLUNGE_MULTIPLIER_INDEX = 7;
const SKILL_MULTIPLIER_INDEX = 0;
const SKILL_COOLDOWN_INDEX = 4;
const BURST_MULTIPLIER_INDEX = 0;
const BURST_COOLDOWN_INDEX = 2;
const BURST_ENERGY_COST_INDEX = 3;

// Measured: gcsim (MIT, main) varesa/attack.go, the three strikes' hitmarks, cancels and reaches. The first and second are
// Boxes, the third a circle, each centred on the offset gcsim gives it. gcsim gives no poise to a strike, so each reads 0
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/varesa/attack.go
const NORMAL_ATTACK_FRAMES: readonly { cancelFrames: number; hitArea: AttackArea; hitmarkFrames: number }[] = [
  { cancelFrames: 49, hitArea: createBoxReach(-0.2, 2.5, 2.5), hitmarkFrames: 23 },
  { cancelFrames: 28, hitArea: createBoxReach(-0.2, 2.8, 3.5), hitmarkFrames: 7 },
  { cancelFrames: 59, hitArea: createCircleReach(0, 2.5), hitmarkFrames: 33 },
];

// Measured: gcsim (MIT, main) varesa/charge.go, the Charged Attack's animation at 143 frames and its hit at 69 as a circle of
// Radius 3.5 ahead of the body, with the 80 poise gcsim gives it, costing the 50 stamina the table gives it. Its
// Follow-Up Strike after Rush, which lands at 11 frames and costs none, waits on the Rush follow-up hook
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/varesa/charge.go
const CHARGED_ATTACK_FRAMES = 143;
const CHARGED_ATTACK_HITMARK_FRAMES = 69;
const CHARGED_ATTACK_HIT_AREA = createCircleReach(0.7, 3.5);
const CHARGED_ATTACK_POISE_DAMAGE = 80;

// Measured: gcsim (MIT, main) varesa/plunge.go, the high plunge's hit at 38 frames as a circle of radius 5 ahead, its
// Animation at 77 frames, the low plunge's at 37 frames as a circle of radius 3 ahead, its animation at 75, and the
// Collision at 31 frames as a circle of radius 1 round the body. These are the airborne plunges, which gcsim plays with
// Its Nightsoul points and Apex Drive left out, as the Nightsoul hook records. gcsim gives no poise to a plunge
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/varesa/plunge.go
const HIGH_PLUNGE_FRAMES = 77;
const HIGH_PLUNGE_HITMARK_FRAMES = 38;
const HIGH_PLUNGE_HIT_AREA = createCircleReach(1, 5);
const LOW_PLUNGE_FRAMES = 75;
const LOW_PLUNGE_HITMARK_FRAMES = 37;
const LOW_PLUNGE_HIT_AREA = createCircleReach(1, 3);
const PLUNGE_COLLISION_HITMARK_FRAMES = 31;
const PLUNGE_COLLISION_HIT_AREA = createCircleReach(0, 1);

// Measured: gcsim (MIT, main) varesa/skill.go, Rush's animation at 43 frames and its hit at 5 as a box of 0.1 by 2 metres
// Centred on the primary target, which the target is priced as, with no poise. gcsim marks the box TODO approximated.
// Its Nightsoul points and the Follow-Up status its charged attack reads wait on the Nightsoul and Rush follow-up hooks
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/varesa/skill.go
const SKILL_FRAMES = 43;
const SKILL_HITMARK_FRAMES = 5;
const SKILL_HIT_AREA = createTargetedHitArea(SKILL_TARGETING_AREA, createBoxReach(0, 0.1, 2).radius);

// Measured: gcsim (MIT, main) varesa/burst.go, Flying Kick's animation at 122 frames and its hit at 88 as a circle of radius
// 7.5 one metre ahead, with the 100 poise gcsim gives it. Its Nightsoul points and the Volcanic Kablam its apex state
// Opens wait on the Nightsoul hook, so the burst is castable and hits, but generates no Nightsoul
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/varesa/burst.go
const BURST_FRAMES = 122;
const BURST_HITMARK_FRAMES = 88;
const BURST_HIT_AREA = createCircleReach(1, 7.5);
const BURST_POISE_DAMAGE = 100;

export const VARESA_CHARACTER_ID = 10_000_111;

// Varesa's kit outside her Nightsoul Blessing: her three strikes, charged attack, low, high and collision plunges, her Rush
// And her Flying Kick. The Fiery Passion forms, the Nightsoul points, the apex state and the Follow-Up Strike wait on the
// Nightsoul hook and the Rush follow-up hook
export const createVaresaKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const createNormalAttack = (
    { cancelFrames, hitArea, hitmarkFrames }: (typeof NORMAL_ATTACK_FRAMES)[number],
    index: number,
  ): KitAction => ({
    hits: [
      {
        hitArea,
        hitmarkSeconds: hitmarkFrames / 60,
        poiseDamage: 0,
        talentMultiplier: getTalentMultiplier(talentMultiplierMap, VARESA_ATTACK_GROUP_ID, TALENT_START_LEVEL, index),
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
        talentMultiplier: getTalentMultiplier(
          talentMultiplierMap,
          VARESA_ATTACK_GROUP_ID,
          TALENT_START_LEVEL,
          multiplierIndex,
        ),
      },
    ],
    seconds: frames / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  });
  const chargedAttackHit: KitHit = {
    hitArea: CHARGED_ATTACK_HIT_AREA,
    hitmarkSeconds: CHARGED_ATTACK_HITMARK_FRAMES / 60,
    poiseDamage: CHARGED_ATTACK_POISE_DAMAGE,
    talentMultiplier: getTalentMultiplier(
      talentMultiplierMap,
      VARESA_ATTACK_GROUP_ID,
      TALENT_START_LEVEL,
      CHARGED_ATTACK_MULTIPLIER_INDEX,
    ),
  };
  return {
    burstCooldownSeconds: getTalentMultiplier(
      talentMultiplierMap,
      VARESA_BURST_GROUP_ID,
      TALENT_START_LEVEL,
      BURST_COOLDOWN_INDEX,
    ),
    burstEnergyCost: getTalentMultiplier(
      talentMultiplierMap,
      VARESA_BURST_GROUP_ID,
      TALENT_START_LEVEL,
      BURST_ENERGY_COST_INDEX,
    ),
    chargedAttack: {
      hits: [chargedAttackHit],
      seconds: CHARGED_ATTACK_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    chargedAttackStamina: getTalentMultiplier(
      talentMultiplierMap,
      VARESA_ATTACK_GROUP_ID,
      TALENT_START_LEVEL,
      CHARGED_ATTACK_STAMINA_INDEX,
    ),
    elementalBurst: {
      hits: [
        {
          hitArea: BURST_HIT_AREA,
          hitmarkSeconds: BURST_HITMARK_FRAMES / 60,
          poiseDamage: BURST_POISE_DAMAGE,
          talentMultiplier: getTalentMultiplier(
            talentMultiplierMap,
            VARESA_BURST_GROUP_ID,
            TALENT_START_LEVEL,
            BURST_MULTIPLIER_INDEX,
          ),
        },
      ],
      seconds: BURST_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    elementalSkill: {
      hits: [
        {
          hitArea: SKILL_HIT_AREA,
          hitmarkSeconds: SKILL_HITMARK_FRAMES / 60,
          poiseDamage: 0,
          talentMultiplier: getTalentMultiplier(
            talentMultiplierMap,
            VARESA_SKILL_GROUP_ID,
            TALENT_START_LEVEL,
            SKILL_MULTIPLIER_INDEX,
          ),
        },
      ],
      seconds: SKILL_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    elementalSkillCharges: 2,
    highPlunge: createPlunge(
      HIGH_PLUNGE_FRAMES,
      HIGH_PLUNGE_HITMARK_FRAMES,
      HIGH_PLUNGE_HIT_AREA,
      HIGH_PLUNGE_MULTIPLIER_INDEX,
    ),
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
      talentMultiplier: getTalentMultiplier(
        talentMultiplierMap,
        VARESA_ATTACK_GROUP_ID,
        TALENT_START_LEVEL,
        PLUNGE_COLLISION_MULTIPLIER_INDEX,
      ),
    },
    skillCooldownSeconds: getTalentMultiplier(
      talentMultiplierMap,
      VARESA_SKILL_GROUP_ID,
      TALENT_START_LEVEL,
      SKILL_COOLDOWN_INDEX,
    ),
  };
};
