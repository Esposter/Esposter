import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitHit } from "#src/models/kit/KitHit";

import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { PLUNGE_HIT_AREAS, SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA } from "#src/services/kit/constants";
import { createBoxReach } from "#src/services/kit/createBoxReach";
import { createCircleReach } from "#src/services/kit/createCircleReach";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Nahida's proud skill groups, read at her talent level. The attack group holds the four strikes at 0 to 3, the charged
// Attack at 4 and its stamina at 5, and the plunges' collision, low and high at 6, 7 and 8. The skill group holds All
// Schemes to Know's press at 0, its hold at 1, the Tri-Karma Purification's damage and Elemental Mastery at 2 and 3, its
// Cooldown at 6 and its hold's cooldown at 7. The burst group holds Illusory Heart's duration at 6, its cooldown at 7 and
// Its energy cost at 8
const NAHIDA_ATTACK_GROUP_ID = 7331;
const NAHIDA_SKILL_GROUP_ID = 7332;
const NAHIDA_BURST_GROUP_ID = 7339;

// Measured: gcsim (MIT) nahida/attack.go, each strike's hitmark, the frame its action cancels at by default, and its box of
// Width and length round the body, offset by its Y. The fourth strike's box sits a metre and a half behind the body
// Https://github.com/genshinsim/gcsim/tree/main/internal/characters/nahida
const NORMAL_ATTACKS = [
  { cancelFrames: 35, hitArea: createBoxReach(0, 2, 8), hitmarkFrames: 23 },
  { cancelFrames: 31, hitArea: createBoxReach(0, 2.5, 8), hitmarkFrames: 15 },
  { cancelFrames: 45, hitArea: createBoxReach(0, 2.5, 8), hitmarkFrames: 26 },
  { cancelFrames: 71, hitArea: createBoxReach(-1.5, 3, 10), hitmarkFrames: 40 },
];

// Measured: gcsim (MIT) nahida/charge.go, the charged attack's box of 6 by 6 metres, its near edge 3 metres behind the body,
// Its hitmark at 65 frames and its animation at 69
// Https://github.com/genshinsim/gcsim/tree/main/internal/characters/nahida
const CHARGED_ATTACK_FRAMES = 69;
const CHARGED_ATTACK_HITMARK_FRAMES = 65;
const CHARGED_ATTACK_HIT_AREA = createBoxReach(-3, 6, 6);

// Provisional: Nahida's gcsim folder has no plunge file, so her plunges take the timings and poise of Bennett's, as the shared
// Plunge hit areas do (gcsim v2.47.2 bennett/plunge.go). Her multipliers are her own table's
// Https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/bennett/plunge.go
const PLUNGE_COLLISION_HITMARK_FRAMES = 30;
const LOW_PLUNGE_HITMARK_FRAMES = 36;
const LOW_PLUNGE_FRAMES = 67;
const LOW_PLUNGE_POISE_DAMAGE = 100;
const HIGH_PLUNGE_HITMARK_FRAMES = 38;
const HIGH_PLUNGE_FRAMES = 68;
const HIGH_PLUNGE_POISE_DAMAGE = 150;

// Measured: gcsim (MIT) nahida/skill.go, All Schemes to Know's press with its circle of radius 4.6 one-fifth of a metre
// Ahead of the body, its hitmark at 13 frames and its animation at 32 frames. Its hold strikes a circle of radius 25 round
// The target at the hold's frames, and its hold is gcsim's full hold of 300 frames, which lands 332 frames on and lasts 362
// Https://github.com/genshinsim/gcsim/tree/main/internal/characters/nahida
const SKILL_PRESS_HITMARK_FRAMES = 13;
const SKILL_PRESS_FRAMES = 32;
const SKILL_PRESS_HIT_AREA = createCircleReach(0.2, 4.6);
const SKILL_HOLD_MAXIMUM_FRAMES = 300;
const SKILL_HOLD_HITMARK_FRAMES = SKILL_HOLD_MAXIMUM_FRAMES - 1 + 33;
const SKILL_HOLD_FRAMES = SKILL_HOLD_MAXIMUM_FRAMES - 1 + 63;
const SKILL_HOLD_HIT_AREA = createCircleReach(0, 25);
const FULL_HOLD_SECONDS = SKILL_HOLD_MAXIMUM_FRAMES / 60;

// Measured: gcsim (MIT) nahida/burst.go, Illusory Heart's animation at 112 frames, its cast at a circle of radius 20 round the
// Body. It deals no damage of its own, so its field's buffs and Tri-Karma's cooldown are not built yet
// Https://github.com/genshinsim/gcsim/tree/main/internal/characters/nahida
const BURST_FRAMES = 112;

// Not built yet: Tri-Karma Purification, a strike set off by a reaction on a marked enemy, and Illusory Heart's field, and
// Nahida's passives and constellations.
export const NAHIDA_CHARACTER_ID = 10_000_073;

// Nahida's first kit, at talent level 1: four strikes, a charged attack, a collision and two plunges, and All Schemes to Know
// With its press and its full hold, which strike the enemies they reach. Her Illusory Heart's field is not built, as its
// Buffs and Tri-Karma's cooldown are not; nor are her passives
const createPlunge = (hit: KitHit, animationFrames: number): KitAction => ({
  hits: [hit],
  seconds: animationFrames / 60,
  targetingArea: STRIKE_TARGETING_AREA,
});

export const createNahidaKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, NAHIDA_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
  const skillMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, NAHIDA_SKILL_GROUP_ID, TALENT_START_LEVEL, index);
  const burstMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, NAHIDA_BURST_GROUP_ID, TALENT_START_LEVEL, index);

  const normalAttacks: KitAction[] = NORMAL_ATTACKS.map(
    ({ cancelFrames, hitArea, hitmarkFrames }, index): KitAction => ({
      hits: [
        {
          hitArea,
          hitmarkSeconds: hitmarkFrames / 60,
          internalCooldownTag: InternalCooldownTag.NormalAttack,
          poiseDamage: 0,
          talentMultiplier: attackMultiplier(index),
        },
      ],
      seconds: cancelFrames / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    }),
  );

  const chargedAttack: KitAction = {
    hits: [
      {
        hitArea: CHARGED_ATTACK_HIT_AREA,
        hitmarkSeconds: CHARGED_ATTACK_HITMARK_FRAMES / 60,
        poiseDamage: 0,
        talentMultiplier: attackMultiplier(4),
      },
    ],
    seconds: CHARGED_ATTACK_FRAMES / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  };

  const elementalSkillHit = (hitArea: KitHit["hitArea"], hitmarkFrames: number, index: number): KitHit => ({
    element: Element.Dendro,
    gauge: 1,
    hitArea,
    hitmarkSeconds: hitmarkFrames / 60,
    poiseDamage: 0,
    talentMultiplier: skillMultiplier(index),
  });

  const elementalSkill: KitAction = {
    hits: [elementalSkillHit(SKILL_PRESS_HIT_AREA, SKILL_PRESS_HITMARK_FRAMES, 0)],
    seconds: SKILL_PRESS_FRAMES / 60,
    targetingArea: SKILL_TARGETING_AREA,
  };

  return {
    burstCooldownSeconds: burstMultiplier(7),
    burstEnergyCost: burstMultiplier(8),
    chargedAttack,
    chargedAttackStamina: attackMultiplier(5),
    elementalBurst: { hits: [], seconds: BURST_FRAMES / 60, targetingArea: SKILL_TARGETING_AREA },
    elementalSkill,
    // The full hold is the only hold level built, at gcsim's maximum of 300 frames, and it is what its release plays
    elementalSkillHolds: [
      {
        action: {
          hits: [elementalSkillHit(SKILL_HOLD_HIT_AREA, SKILL_HOLD_HITMARK_FRAMES, 1)],
          seconds: SKILL_HOLD_FRAMES / 60,
          targetingArea: SKILL_TARGETING_AREA,
        },
        cooldownSeconds: skillMultiplier(7),
        minimumHeldSeconds: FULL_HOLD_SECONDS,
      },
    ],
    highPlunge: createPlunge(
      {
        hitArea: PLUNGE_HIT_AREAS.high,
        hitmarkSeconds: HIGH_PLUNGE_HITMARK_FRAMES / 60,
        isBlunt: true,
        poiseDamage: HIGH_PLUNGE_POISE_DAMAGE,
        talentMultiplier: attackMultiplier(8),
      },
      HIGH_PLUNGE_FRAMES,
    ),
    lowPlunge: createPlunge(
      {
        hitArea: PLUNGE_HIT_AREAS.low,
        hitmarkSeconds: LOW_PLUNGE_HITMARK_FRAMES / 60,
        isBlunt: true,
        poiseDamage: LOW_PLUNGE_POISE_DAMAGE,
        talentMultiplier: attackMultiplier(7),
      },
      LOW_PLUNGE_FRAMES,
    ),
    normalAttacks,
    plungeCollision: {
      gauge: 0,
      hitArea: PLUNGE_HIT_AREAS.collision,
      hitmarkSeconds: PLUNGE_COLLISION_HITMARK_FRAMES / 60,
      poiseDamage: 0,
      talentMultiplier: attackMultiplier(6),
    },
    skillCooldownSeconds: skillMultiplier(6),
  };
};
