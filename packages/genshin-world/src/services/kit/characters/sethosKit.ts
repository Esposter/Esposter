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
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Sethos's proud skill groups, read at his talent level. The attack group holds the first strike at 0, the second's two
// Hits at 1 and 2 and the third at 3, the plain Aimed Shot at 4, the fully-charged one at 5, the Shadowpiercing Shot at 6
// And its Elemental Mastery at 7, and the plunges' collision, low and high at 8, 9 and 10. The skill group holds the
// Thundering Roar's damage at 0 and its energy regeneration at 1, which the kit does not read yet, and its cooldown at 2.
// The burst group holds Dusk Bolt's Elemental Mastery at 0, its buff's seconds at 1, its cooldown at 2 and its cost at 3
const SETHOS_ATTACK_GROUP_ID = 9731;
const SETHOS_SKILL_GROUP_ID = 9732;
const SETHOS_BURST_GROUP_ID = 9739;

export const SETHOS_CHARACTER_ID = 10_000_097;

const hitmark = (frames: number): number => frames / 60;

// Measured: gcsim v2.47.2 (MIT) sethos/attack.go, each strike's hitmarks and the animation that ends it at 60 fps, and its
// Box of 0.1 by 1 metre half a metre ahead on the primary target. Its second strike's two hits share its box. gcsim gives
// No poise for a normal attack
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/sethos/attack.go
const STRIKE_HIT_AREA: AttackArea = createBoxReach(-0.5, 0.1, 1);
const STRIKES: { frames: number; hits: { groupIndex: number; hitmarkFrames: number }[] }[] = [
  { frames: 19, hits: [{ groupIndex: 0, hitmarkFrames: 10 }] },
  {
    frames: 35,
    hits: [
      { groupIndex: 1, hitmarkFrames: 12 },
      { groupIndex: 2, hitmarkFrames: 15 },
    ],
  },
  { frames: 69, hits: [{ groupIndex: 3, hitmarkFrames: 39 }] },
];

// Measured: gcsim v2.47.2 (MIT) sethos/aimed.go, the fully-charged Aimed Shot at 74 frames of an 83-frame animation, its
// Electro gauge of 1U and its box as the strikes'. Its hit is not Physical, so it is the charged attack of the kit
const CHARGED_ATTACK_HITMARK_FRAMES = 74;
const CHARGED_ATTACK_FRAMES = 83;

// Measured: gcsim v2.47.2 (MIT) sethos/skill.go, Ancient Rite's circle of radius 4.5 round Sethos at 13 frames of a
// 38-frame animation, its Electro gauge of 1U, and its cooldown of 8 seconds
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/sethos/skill.go
const SKILL_HITMARK_FRAMES = 13;
const SKILL_FRAMES = 38;
const SKILL_HIT_AREA = createFanReach(360, 4.5);

// Measured: gcsim v2.47.2 (MIT) sethos/burst.go, the animation of 50 frames and the cost and cooldown the table gives.
// The buff it grants, Dusk Bolts for the normal attacks, is not built, since a stance has no charged attack for the
// Buff to replace, and gcsim's Aimed Shot cannot be aimed under it
const BURST_FRAMES = 50;

export const createSethosKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackMultiplier = (groupIndex: number): number =>
    getTalentMultiplier(talentMultiplierMap, SETHOS_ATTACK_GROUP_ID, TALENT_START_LEVEL, groupIndex);
  const skillMultiplier = (groupIndex: number): number =>
    getTalentMultiplier(talentMultiplierMap, SETHOS_SKILL_GROUP_ID, TALENT_START_LEVEL, groupIndex);
  const burstMultiplier = (groupIndex: number): number =>
    getTalentMultiplier(talentMultiplierMap, SETHOS_BURST_GROUP_ID, TALENT_START_LEVEL, groupIndex);

  const normalAttacks = STRIKES.map(({ frames, hits }): KitAction => ({
    hits: hits.map(({ groupIndex, hitmarkFrames }): KitHit => ({
      hitArea: STRIKE_HIT_AREA,
      hitmarkSeconds: hitmark(hitmarkFrames),
      poiseDamage: 0,
      talentMultiplier: attackMultiplier(groupIndex),
    })),
    seconds: hitmark(frames),
    targetingArea: STRIKE_TARGETING_AREA,
  }));

  return {
    burstCooldownSeconds: burstMultiplier(2),
    burstEnergyCost: burstMultiplier(3),
    chargedAttack: {
      hits: [
        {
          element: Element.Electro,
          gauge: 1,
          hitArea: STRIKE_HIT_AREA,
          hitmarkSeconds: hitmark(CHARGED_ATTACK_HITMARK_FRAMES),
          poiseDamage: 0,
          talentMultiplier: attackMultiplier(5),
        },
      ],
      isAimed: true,
      seconds: hitmark(CHARGED_ATTACK_FRAMES),
      targetingArea: STRIKE_TARGETING_AREA,
    },
    // Sethos's charged attack spends no stamina, as the table and gcsim both give
    chargedAttackStamina: 0,
    elementalBurst: { hits: [], seconds: hitmark(BURST_FRAMES), targetingArea: SKILL_TARGETING_AREA },
    elementalSkill: {
      hits: [
        {
          element: Element.Electro,
          gauge: 1,
          hitArea: SKILL_HIT_AREA,
          hitmarkSeconds: hitmark(SKILL_HITMARK_FRAMES),
          poiseDamage: 0,
          talentMultiplier: skillMultiplier(0),
        },
      ],
      seconds: hitmark(SKILL_FRAMES),
      targetingArea: SKILL_TARGETING_AREA,
    },
    highPlunge: {
      hits: [
        { hitArea: PLUNGE_HIT_AREAS.high, hitmarkSeconds: 0, poiseDamage: 0, talentMultiplier: attackMultiplier(10) },
      ],
      seconds: 0.4,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    lowPlunge: {
      hits: [
        { hitArea: PLUNGE_HIT_AREAS.low, hitmarkSeconds: 0, poiseDamage: 0, talentMultiplier: attackMultiplier(9) },
      ],
      seconds: 0.4,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    normalAttacks,
    plungeCollision: {
      hitArea: PLUNGE_HIT_AREAS.collision,
      hitmarkSeconds: 0,
      poiseDamage: 0,
      talentMultiplier: attackMultiplier(8),
    },
    skillCooldownSeconds: skillMultiplier(2),
  };
};
