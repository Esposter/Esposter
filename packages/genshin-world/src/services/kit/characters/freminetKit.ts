import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitHit } from "#src/models/kit/KitHit";

import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { PLUNGE_HIT_AREAS, SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA } from "#src/services/kit/constants";
import { createCircleReach } from "#src/services/kit/createCircleReach";
import { createTargetedHitArea } from "#src/services/kit/createTargetedHitArea";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Freminet's proud skill groups, read at his talent level. The attack group holds the strikes at 0 to 3, the charged attack's
// Multiplier at 4 and its stamina at 6, and the plunges' collision, low and high at 8, 9 and 10. The skill group holds
// Upward Thrust's damage at 0, Spiritbreath Thorn's at 1, the Frost's at 2, and its cooldown at 11. The burst group holds
// Shadowhunter's Ambush's damage at 0, its duration at 1, its cooldown at 2 and its energy cost at 3
const FREMINET_ATTACK_GROUP_ID = 8531;
const FREMINET_SKILL_GROUP_ID = 8532;
const FREMINET_BURST_GROUP_ID = 8539;

export const FREMINET_CHARACTER_ID = 10_000_085;

// Measured: gcsim (MIT) freminet/attack.go, each strike's hitmark, the frame its action cancels at by default, its poise and
// Its circle round the target. gcsim's third strike is a box two metres wide and three long, priced as the circle of its length
// Https://github.com/genshinsim/gcsim/tree/main/internal/characters/freminet
const NORMAL_ATTACKS = [
  {
    cancelFrames: 47,
    hitArea: createTargetedHitArea(STRIKE_TARGETING_AREA, 2.2),
    hitmarkFrames: 26,
    poiseDamage: 112.6437,
  },
  {
    cancelFrames: 49,
    hitArea: createTargetedHitArea(STRIKE_TARGETING_AREA, 2.2),
    hitmarkFrames: 23,
    poiseDamage: 107.8804,
  },
  {
    cancelFrames: 65,
    hitArea: createTargetedHitArea(STRIKE_TARGETING_AREA, 3),
    hitmarkFrames: 31,
    poiseDamage: 136.267,
  },
  {
    cancelFrames: 86,
    hitArea: createTargetedHitArea(STRIKE_TARGETING_AREA, 2.4),
    hitmarkFrames: 42,
    poiseDamage: 165.5529,
  },
];

// Provisional: gcsim gives Freminet no charged attack ("action charge not implemented"), so it takes the fourth strike's hitmark,
// Animation and reach, with the table's charged multiplier and stamina until a recording of the attack measures them
const CHARGED_ATTACK_HITMARK_FRAMES = 42;
const CHARGED_ATTACK_FRAMES = 86;
const CHARGED_ATTACK_HIT_AREA = createTargetedHitArea(STRIKE_TARGETING_AREA, 2.4);

// Measured: gcsim (MIT) freminet/plunge.go, the low plunge at 43 frames with its animation at 85 and poise 150, the high at 45
// Frames with its animation at 87 and poise 200, and the collision at 37 frames, which deals no poise
// Https://github.com/genshinsim/gcsim/tree/main/internal/characters/freminet
const LOW_PLUNGE_HITMARK_FRAMES = 43;
const LOW_PLUNGE_FRAMES = 85;
const LOW_PLUNGE_POISE_DAMAGE = 150;
const HIGH_PLUNGE_HITMARK_FRAMES = 45;
const HIGH_PLUNGE_FRAMES = 87;
const HIGH_PLUNGE_POISE_DAMAGE = 200;
const PLUNGE_COLLISION_HITMARK_FRAMES = 37;

// Measured: gcsim (MIT) freminet/skill.go, Upward Thrust's circle of radius 2.5 two metres ahead of the body at 29 frames with
// Its animation at 46 frames and 75 poise. Its cooldown is the table's ten seconds
// Https://github.com/genshinsim/gcsim/tree/main/internal/characters/freminet
const SKILL_FRAMES = 46;
const SKILL_HITMARK_FRAMES = 29;
const SKILL_HIT_AREA = createCircleReach(2, 2.5);
const SKILL_POISE_DAMAGE = 75;

// Measured: gcsim (MIT) freminet/burst.go, Shadowhunter's Ambush's circle of radius 5 round the target at 44 frames, with its
// Animation at 65 frames
// Https://github.com/genshinsim/gcsim/tree/main/internal/characters/freminet
const BURST_FRAMES = 65;
const BURST_HITMARK_FRAMES = 44;
const BURST_HIT_AREA = createTargetedHitArea(SKILL_TARGETING_AREA, 5);

// Not built yet: Pressurized Floe's Pers Time stance, which holds the frost of each strike, the stacks it gains, and the
// Detonation that takes its place on the skill's next press, waits on a stance that counts its stacks. Spiritbreath Thorn
// Hits at 62 frames, past the skill's animation, so it waits on a timed hit. Shadowhunter's Ambush's stalking state, its
// Skill cooldown lowered to three seconds and its reset of the skill's cooldown wait on a status that outlives the action.
// Its passives and constellations are not built.
export const createFreminetKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, FREMINET_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
  const skillMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, FREMINET_SKILL_GROUP_ID, TALENT_START_LEVEL, index);
  const burstMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, FREMINET_BURST_GROUP_ID, TALENT_START_LEVEL, index);

  const normalAttacks: KitAction[] = NORMAL_ATTACKS.map(
    ({ cancelFrames, hitArea, hitmarkFrames, poiseDamage }, strikeIndex) => ({
      hits: [
        {
          hitArea,
          hitmarkSeconds: hitmarkFrames / 60,
          internalCooldownTag: InternalCooldownTag.NormalAttack,
          isBlunt: true,
          poiseDamage,
          talentMultiplier: attackMultiplier(strikeIndex),
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
        isBlunt: true,
        poiseDamage: 0,
        talentMultiplier: attackMultiplier(4),
      },
    ],
    seconds: CHARGED_ATTACK_FRAMES / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  };

  const elementalSkillHit: KitHit = {
    element: Element.Cryo,
    hitArea: SKILL_HIT_AREA,
    hitmarkSeconds: SKILL_HITMARK_FRAMES / 60,
    isBlunt: true,
    poiseDamage: SKILL_POISE_DAMAGE,
    talentMultiplier: skillMultiplier(0),
  };

  const elementalBurstHit: KitHit = {
    element: Element.Cryo,
    hitArea: BURST_HIT_AREA,
    hitmarkSeconds: BURST_HITMARK_FRAMES / 60,
    isBlunt: true,
    poiseDamage: 0,
    talentMultiplier: burstMultiplier(0),
  };

  return {
    burstCooldownSeconds: burstMultiplier(2),
    burstEnergyCost: burstMultiplier(3),
    chargedAttack,
    chargedAttackStamina: attackMultiplier(6),
    elementalBurst: { hits: [elementalBurstHit], seconds: BURST_FRAMES / 60, targetingArea: SKILL_TARGETING_AREA },
    elementalSkill: { hits: [elementalSkillHit], seconds: SKILL_FRAMES / 60, targetingArea: SKILL_TARGETING_AREA },
    highPlunge: {
      hits: [
        {
          hitArea: PLUNGE_HIT_AREAS.high,
          hitmarkSeconds: HIGH_PLUNGE_HITMARK_FRAMES / 60,
          isBlunt: true,
          poiseDamage: HIGH_PLUNGE_POISE_DAMAGE,
          talentMultiplier: attackMultiplier(10),
        },
      ],
      seconds: HIGH_PLUNGE_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    lowPlunge: {
      hits: [
        {
          hitArea: PLUNGE_HIT_AREAS.low,
          hitmarkSeconds: LOW_PLUNGE_HITMARK_FRAMES / 60,
          isBlunt: true,
          poiseDamage: LOW_PLUNGE_POISE_DAMAGE,
          talentMultiplier: attackMultiplier(9),
        },
      ],
      seconds: LOW_PLUNGE_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    normalAttacks,
    plungeCollision: {
      hitArea: PLUNGE_HIT_AREAS.collision,
      hitmarkSeconds: PLUNGE_COLLISION_HITMARK_FRAMES / 60,
      isBlunt: true,
      poiseDamage: 0,
      talentMultiplier: attackMultiplier(8),
    },
    skillCooldownSeconds: skillMultiplier(11),
  };
};
