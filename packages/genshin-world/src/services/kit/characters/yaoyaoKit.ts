import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitHit } from "#src/models/kit/KitHit";

import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { PLUNGE_HIT_AREAS, SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA } from "#src/services/kit/constants";
import { createBoxReach } from "#src/services/kit/createBoxReach";
import { createFanReach } from "#src/services/kit/createFanReach";
import { createTargetedHitArea } from "#src/services/kit/createTargetedHitArea";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Yaoyao's proud skill groups, read at her talent level. The attack group holds the four strikes' hits at 0 to 4, with the
// Third strike's two at 2 and 3, the charged attack at 5 and its stamina at 6, and the plunges' collision, low and high at 7,
// 8 and 9. The skill group holds White Jade Radish's DMG at 0, its healing at 1 and 2, its duration at 3, and its cooldown at
// 5. The burst group holds Moonjade Descent's DMG at 0, the Radish's DMG at 3, its cooldown at 6 and its energy cost at 7
const YAOYAO_ATTACK_GROUP_ID = 7731;
const YAOYAO_SKILL_GROUP_ID = 7732;
const YAOYAO_BURST_GROUP_ID = 7739;

// Measured: gcsim (MIT) yaoyao/attack.go, the first strike's box of 1.2 by 3 metres from the body, the second and third's fans
// Of 270 degrees, each a circle of radius 2 at an offset of 0.5, and the fourth's circle of radius 2.2 at the offset of 0.5
// That gcsim's code reads for it, where its config says 1.5. A circle ahead of the body is priced as its offset plus its
// Radius, and a box as the circle to its far corner
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/yaoyao
const FIRST_STRIKE_HIT_AREA = createBoxReach(0, 1.2, 3);
const SECOND_AND_THIRD_STRIKE_HIT_AREA = createFanReach(270, 0.5 + 2);
const FOURTH_STRIKE_HIT_AREA = createFanReach(360, 0.5 + 2.2);

// Measured: gcsim (MIT) yaoyao/attack.go, each strike's hitmarks and the frame its action cancels at, the default cancel of
// The frames gcsim initialises each strike with
const NORMAL_ATTACK_STRIKES: {
  cancelFrames: number;
  hits: { hitArea: AttackArea; hitmarkFrames: number; index: number }[];
}[] = [
  { cancelFrames: 28, hits: [{ hitArea: FIRST_STRIKE_HIT_AREA, hitmarkFrames: 13, index: 0 }] },
  { cancelFrames: 31, hits: [{ hitArea: SECOND_AND_THIRD_STRIKE_HIT_AREA, hitmarkFrames: 16, index: 1 }] },
  {
    cancelFrames: 51,
    hits: [
      { hitArea: SECOND_AND_THIRD_STRIKE_HIT_AREA, hitmarkFrames: 12, index: 2 },
      { hitArea: SECOND_AND_THIRD_STRIKE_HIT_AREA, hitmarkFrames: 31, index: 3 },
    ],
  },
  { cancelFrames: 59, hits: [{ hitArea: FOURTH_STRIKE_HIT_AREA, hitmarkFrames: 21, index: 4 }] },
];

// Measured: gcsim (MIT) yaoyao/charge.go, the charged attack's circle of 0.8 metres on the primary target at 24 frames, its
// Animation at 55 frames
const CHARGED_ATTACK_HITMARK_FRAMES = 24;
const CHARGED_ATTACK_FRAMES = 55;
const CHARGED_ATTACK_RADIUS = 0.8;

// Measured: gcsim (MIT) yaoyao/skill.go, the cast's animation at 52 frames. The Yuegui it throws is not built: see the page
const SKILL_ANIMATION_FRAMES = 52;

// Measured: gcsim (MIT) yaoyao/burst.go, Moonjade Descent's circle of 3 metres round the body at 16 frames, and its animation at
// 63 frames. gcsim gives it no poise, so it deals none. Its Yuegui jumping, which the burst throws, is not built
const BURST_HITMARK_FRAMES = 16;
const BURST_ANIMATION_FRAMES = 63;
const BURST_RADIUS = 3;

// Provisional: the plunges last 0.4 seconds as Ganyu's do, since gcsim gives Yaoyao's no frames for them here
const PLUNGE_SECONDS = 0.4;

export const YAOYAO_CHARACTER_ID = 10_000_077;

// Yaoyao's first kit, at talent level 1: four strikes with a third of two hits, a charged attack, a collision and two plunges, and
// Moonjade Descent's initial hit. Her skill is cast and cooled down, but the Yuegui it throws, its radishes and their healing, and
// The Yuegui her burst throws are not built, nor her passives or constellations
export const createYaoyaoKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, YAOYAO_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
  const skillTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, YAOYAO_SKILL_GROUP_ID, TALENT_START_LEVEL, index);
  const burstTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, YAOYAO_BURST_GROUP_ID, TALENT_START_LEVEL, index);

  const skillCooldownSeconds = skillTalentMultiplier(5);

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
    burstCooldownSeconds: burstTalentMultiplier(6),
    burstEnergyCost: burstTalentMultiplier(7),
    chargedAttack: {
      hits: [
        {
          hitArea: createTargetedHitArea(STRIKE_TARGETING_AREA, CHARGED_ATTACK_RADIUS),
          hitmarkSeconds: CHARGED_ATTACK_HITMARK_FRAMES / 60,
          poiseDamage: 0,
          talentMultiplier: attackTalentMultiplier(5),
        },
      ],
      seconds: CHARGED_ATTACK_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    chargedAttackStamina: attackTalentMultiplier(6),
    elementalBurst: {
      hits: [
        {
          element: Element.Dendro,
          gauge: 1,
          hitArea: createFanReach(360, BURST_RADIUS),
          hitmarkSeconds: BURST_HITMARK_FRAMES / 60,
          poiseDamage: 0,
          talentMultiplier: burstTalentMultiplier(0),
        },
      ],
      seconds: BURST_ANIMATION_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    elementalSkill: { hits: [], seconds: SKILL_ANIMATION_FRAMES / 60, targetingArea: SKILL_TARGETING_AREA },
    highPlunge: {
      hits: [
        {
          hitArea: PLUNGE_HIT_AREAS.high,
          hitmarkSeconds: 0,
          poiseDamage: 0,
          talentMultiplier: attackTalentMultiplier(9),
        },
      ],
      seconds: PLUNGE_SECONDS,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    lowPlunge: {
      hits: [
        {
          hitArea: PLUNGE_HIT_AREAS.low,
          hitmarkSeconds: 0,
          poiseDamage: 0,
          talentMultiplier: attackTalentMultiplier(8),
        },
      ],
      seconds: PLUNGE_SECONDS,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    normalAttacks,
    plungeCollision: {
      hitArea: PLUNGE_HIT_AREAS.collision,
      hitmarkSeconds: 0,
      poiseDamage: 0,
      talentMultiplier: attackTalentMultiplier(7),
    },
    skillCooldownSeconds,
  };
};
