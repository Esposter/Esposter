import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitHit } from "#src/models/kit/KitHit";

import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { PLUNGE_HIT_AREAS, SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA } from "#src/services/kit/constants";
import { createBoxReach } from "#src/services/kit/createBoxReach";
import { createFanReach } from "#src/services/kit/createFanReach";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Clorinde's proud skill groups, read at her talent level. The attack group holds the strikes' hits at 0 to 6 and 9, the
// Charged attack at 10 and its stamina at 11, and the plunges' collision, low and high at 12, 13 and 14. Her skill group
// Holds Swift Hunt, Impale the Night and Surging Blade, which the Night Vigil stance that is not built plays, so it is
// Not read. The burst group holds Last Lightfall at 0, its Bond of Life at 1, and its cooldown and energy cost at 2 and 3
const CLORINDE_ATTACK_GROUP_ID = 9831;
const CLORINDE_BURST_GROUP_ID = 9839;

export const CLORINDE_CHARACTER_ID = 10_000_098;

const hitmark = (frames: number): number => frames / 60;

// Measured: gcsim v2.47.2 (MIT) clorinde/attack.go, each strike's hitmarks and the animation that ends it at 60 fps, and
// Its reach: circles of radius 1.7, 1.9, 2.1 and 2.5 centred 1.1 to 1.4 metres ahead, priced as the offset plus the radius
// As Zhongli's are, and the fourth strike's three boxes of 2 metres wide and 3 to 3.5 metres long 1.3 metres ahead. gcsim
// Gives no poise for a normal attack
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/clorinde/attack.go
const circleReach = (offset: number, radius: number): AttackArea => createFanReach(360, offset + radius);
const STRIKES: { frames: number; hits: { groupIndex: number; hitArea: AttackArea; hitmarkFrames: number }[] }[] = [
  { frames: 24, hits: [{ groupIndex: 0, hitArea: circleReach(1.1, 1.7), hitmarkFrames: 18 }] },
  { frames: 27, hits: [{ groupIndex: 1, hitArea: circleReach(1.3, 1.9), hitmarkFrames: 12 }] },
  {
    frames: 42,
    hits: [
      { groupIndex: 2, hitArea: circleReach(1.2, 2.1), hitmarkFrames: 23 },
      { groupIndex: 3, hitArea: circleReach(1.2, 2.1), hitmarkFrames: 32 },
    ],
  },
  {
    frames: 35,
    hits: [
      { groupIndex: 4, hitArea: createBoxReach(1.3, 2, 3.5), hitmarkFrames: 12 },
      { groupIndex: 5, hitArea: createBoxReach(1.3, 2, 3), hitmarkFrames: 18 },
      { groupIndex: 6, hitArea: createBoxReach(1.3, 2, 3), hitmarkFrames: 23 },
    ],
  },
  { frames: 60, hits: [{ groupIndex: 9, hitArea: circleReach(1.4, 2.5), hitmarkFrames: 21 }] },
];

// Measured: gcsim v2.47.2 (MIT) clorinde/charge.go, the charge's circle of radius 4.1 round Clorinde at 38 frames of a
// 68-frame animation, Physical
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/clorinde/charge.go
const CHARGED_ATTACK_HITMARK_FRAMES = 38;
const CHARGED_ATTACK_FRAMES = 68;
const CHARGED_ATTACK_HIT_AREA = createFanReach(360, 4.1);

// Measured: gcsim v2.47.2 (MIT) clorinde/burst.go, Last Lightfall's five Electro boxes of 11.2 by 9 metres at 97, 103, 109,
// 115 and 121 frames of a 128-frame animation, each one gauge of 1U, under the Elemental Burst internal cooldown
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/clorinde/burst.go
const BURST_HITMARK_FRAMES = [97, 103, 109, 115, 121];
const BURST_FRAMES = 128;
const BURST_HIT_AREA = createBoxReach(-1, 11.2, 9);

// Measured: gcsim v2.47.2 (MIT) clorinde/skill.go, Hunter's Vigil's press starts Night Vigil and its cooldown of 16 seconds,
// With no hit of its own. Its animation is 33 frames
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/clorinde/skill.go
const SKILL_FRAMES = 33;
const SKILL_COOLDOWN_SECONDS = 16;

export const createClorindeKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackMultiplier = (groupIndex: number): number =>
    getTalentMultiplier(talentMultiplierMap, CLORINDE_ATTACK_GROUP_ID, TALENT_START_LEVEL, groupIndex);
  const burstMultiplier = (groupIndex: number): number =>
    getTalentMultiplier(talentMultiplierMap, CLORINDE_BURST_GROUP_ID, TALENT_START_LEVEL, groupIndex);

  const normalAttacks = STRIKES.map(({ frames, hits }): KitAction => ({
    hits: hits.map(({ groupIndex, hitArea, hitmarkFrames }): KitHit => ({
      hitArea,
      hitmarkSeconds: hitmark(hitmarkFrames),
      internalCooldownTag: InternalCooldownTag.NormalAttack,
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
          hitArea: CHARGED_ATTACK_HIT_AREA,
          hitmarkSeconds: hitmark(CHARGED_ATTACK_HITMARK_FRAMES),
          poiseDamage: 0,
          talentMultiplier: attackMultiplier(10),
        },
      ],
      seconds: hitmark(CHARGED_ATTACK_FRAMES),
      targetingArea: STRIKE_TARGETING_AREA,
    },
    chargedAttackStamina: attackMultiplier(11),
    elementalBurst: {
      hits: BURST_HITMARK_FRAMES.map((frames): KitHit => ({
        element: Element.Electro,
        gauge: 1,
        hitArea: BURST_HIT_AREA,
        hitmarkSeconds: hitmark(frames),
        internalCooldownTag: InternalCooldownTag.ElementalBurst,
        poiseDamage: 0,
        talentMultiplier: burstMultiplier(0),
      })),
      seconds: hitmark(BURST_FRAMES),
      targetingArea: SKILL_TARGETING_AREA,
    },
    // The press starts Night Vigil, which is not built, so it plays its animation and starts its cooldown
    elementalSkill: { hits: [], seconds: hitmark(SKILL_FRAMES), targetingArea: SKILL_TARGETING_AREA },
    highPlunge: {
      hits: [
        { hitArea: PLUNGE_HIT_AREAS.high, hitmarkSeconds: 0, poiseDamage: 0, talentMultiplier: attackMultiplier(14) },
      ],
      seconds: 0.4,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    lowPlunge: {
      hits: [
        { hitArea: PLUNGE_HIT_AREAS.low, hitmarkSeconds: 0, poiseDamage: 0, talentMultiplier: attackMultiplier(13) },
      ],
      seconds: 0.4,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    normalAttacks,
    plungeCollision: {
      hitArea: PLUNGE_HIT_AREAS.collision,
      hitmarkSeconds: 0,
      poiseDamage: 0,
      talentMultiplier: attackMultiplier(12),
    },
    skillCooldownSeconds: SKILL_COOLDOWN_SECONDS,
  };
};
