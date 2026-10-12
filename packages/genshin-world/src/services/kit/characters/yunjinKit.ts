import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitHit } from "#src/models/kit/KitHit";

import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA } from "#src/services/kit/constants";
import { createBoxReach } from "#src/services/kit/createBoxReach";
import { createFanReach } from "#src/services/kit/createFanReach";
import { createTargetedHitArea } from "#src/services/kit/createTargetedHitArea";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Yun Jin's proud skill groups, read at her talent level. The attack group holds the first strike's hit at 0, the second's at
// 1, the third's two at 2 and 3, the fourth's two at 4 and 5 and the fifth's at 6, the charged attack at 7 and its stamina at
// 8, and the plunges' collision, low and high at 9, 10 and 11. The skill group holds Opening Flourish's shield share at 0 and
// Flat HP at 1, its tap's DMG at 2, its level 1 and 2 charges' DMG at 3 and 4, and its cooldown at 5. The burst group holds
// Cliffbreaker's Banner's damage at 0, its DMG Increase at 1, its seconds at 2, its cooldown at 3, its energy cost at 4, and its
// Trigger Quota at 5
const YUNJIN_ATTACK_GROUP_ID = 6431;
const YUNJIN_SKILL_GROUP_ID = 6432;
const YUNJIN_BURST_GROUP_ID = 6439;

// Measured: gcsim (MIT) yunjin/attack.go, each strike's circle of 2 metres at its offset of 0.8 across a fan of 220 degrees,
// Its fifth a circle of 2.4 metres at an offset of 1.1, and its fourth a box of 2 by 3.2 spawned 1.2 metres behind the body.
// A circle ahead of the body is priced as its offset plus its radius, and a box as the circle to its far corner
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/yunjin
const FIRST_THREE_STRIKE_HIT_AREA = createFanReach(220, 0.8 + 2);
const FOURTH_STRIKE_HIT_AREA = createBoxReach(-1.2, 2, 3.2);
const FIFTH_STRIKE_HIT_AREA = createFanReach(360, 1.1 + 2.4);

// Measured: gcsim (MIT) yunjin/attack.go, each strike's hitmarks and the frame its action cancels at
const NORMAL_ATTACK_STRIKES: {
  cancelFrames: number;
  hits: { hitArea: AttackArea; hitmarkFrames: number; index: number }[];
}[] = [
  { cancelFrames: 25, hits: [{ hitArea: FIRST_THREE_STRIKE_HIT_AREA, hitmarkFrames: 15, index: 0 }] },
  { cancelFrames: 29, hits: [{ hitArea: FIRST_THREE_STRIKE_HIT_AREA, hitmarkFrames: 13, index: 1 }] },
  {
    cancelFrames: 32,
    hits: [
      { hitArea: FIRST_THREE_STRIKE_HIT_AREA, hitmarkFrames: 8, index: 2 },
      { hitArea: FIRST_THREE_STRIKE_HIT_AREA, hitmarkFrames: 23, index: 3 },
    ],
  },
  {
    cancelFrames: 46,
    hits: [
      { hitArea: FOURTH_STRIKE_HIT_AREA, hitmarkFrames: 11, index: 4 },
      { hitArea: FOURTH_STRIKE_HIT_AREA, hitmarkFrames: 23, index: 5 },
    ],
  },
  { cancelFrames: 67, hits: [{ hitArea: FIFTH_STRIKE_HIT_AREA, hitmarkFrames: 15, index: 6 }] },
];

// Measured: gcsim (MIT) yunjin/charge.go, the charged attack's circle of 0.8 metres on the primary target at 25 frames, its
// Animation at 59 frames
const CHARGED_ATTACK_HITMARK_FRAMES = 25;
const CHARGED_ATTACK_FRAMES = 59;
const CHARGED_ATTACK_RADIUS = 0.8;

// Measured: gcsim (MIT) yunjin/skill.go, Opening Flourish's tap at 13 frames with an animation of 62, its level 1 hold at 50
// With 97, and its level 2 hold at 93 with 141, each a circle round the body of 4, 6 and 8 metres, and each shield lasting to
// Its hitmark as gcsim gives it. The tap and the holds' DMG scale with Yun Jin's DEF, which gcsim's UseDef hits take
const SKILL_TAP_HITMARK_FRAMES = 13;
const SKILL_TAP_ANIMATION_FRAMES = 62;
const SKILL_TAP_RADIUS = 4;
const SKILL_LEVEL_1_HITMARK_FRAMES = 50;
const SKILL_LEVEL_1_ANIMATION_FRAMES = 97;
const SKILL_LEVEL_1_RADIUS = 6;
const SKILL_LEVEL_2_HITMARK_FRAMES = 93;
const SKILL_LEVEL_2_ANIMATION_FRAMES = 141;
const SKILL_LEVEL_2_RADIUS = 8;
// Provisional: gcsim takes the hold levels from the input alone, with no thresholds, so the seconds a skill must be held to reach
// Each level are an estimate until a recording of the hold input measures them, as Bennett's Charge Levels are
const SKILL_LEVEL_1_MINIMUM_HELD_SECONDS = 0.5;
const SKILL_LEVEL_2_MINIMUM_HELD_SECONDS = 1;

// Measured: gcsim (MIT) yunjin/burst.go, Cliffbreaker's Banner's circle of 6 metres round the body at 35 frames, its poise of
// 200, and its animation at 57 frames
const BURST_HITMARK_FRAMES = 35;
const BURST_ANIMATION_FRAMES = 57;
const BURST_RADIUS = 6;
const BURST_POISE_DAMAGE = 200;

// Provisional: the plunges last 0.4 seconds as Ganyu's do, since gcsim gives Yun Jin's no frames for them here
const PLUNGE_SECONDS = 0.4;

// A hit whose base damage is a share of its striker's DEF rather than of its ATK, as gcsim's UseDef hits are: the share is
// Given as the hit's flat base damage and the hit's talent multiplier is zero
const createDefenseScaledBonus =
  (talentMultiplier: number) =>
  (combatant: Combatant): number =>
    talentMultiplier * combatant.attributes.defense;

export const YUNJIN_CHARACTER_ID = 10_000_064;

// Yun Jin's first kit, at talent level 1: five strikes, a charged attack, a collision and two plunges, and Opening Flourish with
// Its tap and its two charge levels, each with a shield of her Max HP and a flat share to its hit. Cliffbreaker's Banner's
// Initial hit is built, but not its DEF-scaled DMG Increase on each of the party's normal attacks, which the kit prices from
// The striker's stats alone, nor her passives or constellations
export const createYunjinKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, YUNJIN_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
  const skillTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, YUNJIN_SKILL_GROUP_ID, TALENT_START_LEVEL, index);
  const burstTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, YUNJIN_BURST_GROUP_ID, TALENT_START_LEVEL, index);

  const shieldShare = skillTalentMultiplier(0);
  const shieldFlat = skillTalentMultiplier(1);
  const skillCooldownSeconds = skillTalentMultiplier(5);

  // Opening Flourish's shield is set as the skill starts, from Yun Jin's Max HP and the table's share and flat HP, until its
  // Hit lands, as gcsim expires it at that frame. Its hit is the skill's tap or charge, DEF-scaled
  const createSkillAction = (hit: KitHit, hitmarkFrames: number, animationFrames: number): KitAction => ({
    hits: [hit],
    onStart: ({ combatant, kitEffectState }) =>
      addKitEffect(kitEffectState, {
        characterId: combatant.characterId,
        element: Element.Geo,
        health: shieldShare * combatant.attributes.maxHealth + shieldFlat,
        kind: "shield",
        secondsRemaining: hitmarkFrames / 60,
      }),
    seconds: animationFrames / 60,
    targetingArea: SKILL_TARGETING_AREA,
  });
  const createSkillHit = (index: number, hitmarkFrames: number, radius: number): KitHit => ({
    additiveBaseDamageBonus: createDefenseScaledBonus(skillTalentMultiplier(index)),
    element: Element.Geo,
    gauge: 1,
    hitArea: createFanReach(360, radius),
    hitmarkSeconds: hitmarkFrames / 60,
    poiseDamage: 0,
    talentMultiplier: 0,
  });

  const normalAttacks: KitAction[] = NORMAL_ATTACK_STRIKES.map(({ cancelFrames, hits }) => ({
    hits: hits.map(({ hitArea, hitmarkFrames, index }): KitHit => ({
      hitArea,
      hitmarkSeconds: hitmarkFrames / 60,
      poiseDamage: 0,
      talentMultiplier: attackTalentMultiplier(index),
    })),
    seconds: cancelFrames / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  }));

  return {
    burstCooldownSeconds: burstTalentMultiplier(3),
    burstEnergyCost: burstTalentMultiplier(4),
    chargedAttack: {
      hits: [
        {
          hitArea: createTargetedHitArea(STRIKE_TARGETING_AREA, CHARGED_ATTACK_RADIUS),
          hitmarkSeconds: CHARGED_ATTACK_HITMARK_FRAMES / 60,
          poiseDamage: 0,
          talentMultiplier: attackTalentMultiplier(7),
        },
      ],
      seconds: CHARGED_ATTACK_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    chargedAttackStamina: attackTalentMultiplier(8),
    elementalBurst: {
      hits: [
        {
          element: Element.Geo,
          gauge: 1,
          hitArea: createFanReach(360, BURST_RADIUS),
          hitmarkSeconds: BURST_HITMARK_FRAMES / 60,
          poiseDamage: BURST_POISE_DAMAGE,
          talentMultiplier: burstTalentMultiplier(0),
        },
      ],
      seconds: BURST_ANIMATION_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    elementalSkill: createSkillAction(
      createSkillHit(2, SKILL_TAP_HITMARK_FRAMES, SKILL_TAP_RADIUS),
      SKILL_TAP_HITMARK_FRAMES,
      SKILL_TAP_ANIMATION_FRAMES,
    ),
    elementalSkillHolds: [
      {
        action: createSkillAction(
          createSkillHit(3, SKILL_LEVEL_1_HITMARK_FRAMES, SKILL_LEVEL_1_RADIUS),
          SKILL_LEVEL_1_HITMARK_FRAMES,
          SKILL_LEVEL_1_ANIMATION_FRAMES,
        ),
        cooldownSeconds: skillCooldownSeconds,
        minimumHeldSeconds: SKILL_LEVEL_1_MINIMUM_HELD_SECONDS,
      },
      {
        action: createSkillAction(
          createSkillHit(4, SKILL_LEVEL_2_HITMARK_FRAMES, SKILL_LEVEL_2_RADIUS),
          SKILL_LEVEL_2_HITMARK_FRAMES,
          SKILL_LEVEL_2_ANIMATION_FRAMES,
        ),
        cooldownSeconds: skillCooldownSeconds,
        minimumHeldSeconds: SKILL_LEVEL_2_MINIMUM_HELD_SECONDS,
      },
    ],
    highPlunge: {
      hits: [
        {
          hitArea: createFanReach(360, 5),
          hitmarkSeconds: 0,
          poiseDamage: 0,
          talentMultiplier: attackTalentMultiplier(11),
        },
      ],
      seconds: PLUNGE_SECONDS,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    lowPlunge: {
      hits: [
        {
          hitArea: createFanReach(360, 3),
          hitmarkSeconds: 0,
          poiseDamage: 0,
          talentMultiplier: attackTalentMultiplier(10),
        },
      ],
      seconds: PLUNGE_SECONDS,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    normalAttacks,
    plungeCollision: {
      hitArea: createFanReach(360, 1),
      hitmarkSeconds: 0,
      poiseDamage: 0,
      talentMultiplier: attackTalentMultiplier(9),
    },
    skillCooldownSeconds,
  };
};
