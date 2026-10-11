import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitHit } from "#src/models/kit/KitHit";

import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA } from "#src/services/kit/constants";
import { createBoxReach } from "#src/services/kit/createBoxReach";
import { createFanReach } from "#src/services/kit/createFanReach";
import { createTargetedHitArea } from "#src/services/kit/createTargetedHitArea";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";
import { takeOne } from "@esposter/shared";

// Heizou's proud skill groups, read at his talent level, as the game's tables give them and gcsim v2.47.2 (MIT)
// Zz_shikanoinheizou.dm.go labels them. The attack group holds the first strike at 0, the second at 1, the third at 2,
// The fourth's three hits at 3, 4 and 5, the fifth at 6, the charged attack at 7 and its stamina at 8, and the plunges'
// Collision, low and high at 9, 10 and 11. The skill group holds Heartstopper Strike's damage at 0, the Declension DMG
// Bonus per stack at 1, the Conviction DMG Bonus at 2 and its cooldown at 3. The burst group holds Fudou Style Vacuum
// Slugger's damage at 0, its cooldown at 2 and its energy cost at 3
const HEIZOU_ATTACK_GROUP_ID = 5931;
const HEIZOU_SKILL_GROUP_ID = 5932;
const HEIZOU_BURST_GROUP_ID = 5939;
const HEIZOU_SKILL_DECLENSION_INDEX = 1;
const HEIZOU_SKILL_CONVICTION_INDEX = 2;
const HEIZOU_SKILL_COOLDOWN_INDEX = 3;
const HEIZOU_BURST_COOLDOWN_INDEX = 2;
const HEIZOU_BURST_ENERGY_COST_INDEX = 3;

// Measured: gcsim v2.47.2 (MIT) heizou/attack.go, each strike's hitmarks and the cancel frame its action has, its box or
// Circle as priced from the body, a box to its far corner and a circle as its offset plus its radius. gcsim gives no poise
// To the normal attacks, so none is read
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/heizou/attack.go
const FIRST_AND_SECOND_STRIKE_HIT_AREA = createBoxReach(-0.2, 3, 2);
const FIFTH_STRIKE_HIT_AREA = createFanReach(360, 1.1 + 2.4);
const THIRD_STRIKE_HIT_AREA = createFanReach(360, 1.1 + 2.2);
const NORMAL_ATTACK_CANCEL_FRAMES = [21, 21, 46, 38, 66];

// Measured: gcsim v2.47.2 (MIT) heizou/charge.go, the charged attack's box at 24 frames, its animation 46, and its stamina
// Of 25, which the table's index 8 gives too
const CHARGED_ATTACK_HITMARK_FRAMES = 24;
const CHARGED_ATTACK_FRAMES = 46;
const CHARGED_ATTACK_HIT_AREA = createBoxReach(-1.2, 2.8, 3.6);
const CHARGED_ATTACK_STAMINA_INDEX = 8;

// Measured: gcsim v2.47.2 (MIT) heizou/plunge.go, the collision at 38 frames as a circle of radius 1.5, and the low and high
// Plunges at 44 and 47 frames, circles of radius 3 and 3.5, with their animations of 75 and 78 frames. gcsim gives no poise
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/heizou/plunge.go
const COLLISION_HITMARK_FRAMES = 38;
const COLLISION_HIT_AREA = createFanReach(360, 1.5);
const LOW_PLUNGE_HITMARK_FRAMES = 44;
const LOW_PLUNGE_FRAMES = 75;
const LOW_PLUNGE_HIT_AREA = createFanReach(360, 3);
const HIGH_PLUNGE_HITMARK_FRAMES = 47;
const HIGH_PLUNGE_FRAMES = 78;
const HIGH_PLUNGE_HIT_AREA = createFanReach(360, 3.5);

// Measured: gcsim v2.47.2 (MIT) heizou/skill.go, Heartstopper Strike's hit at 20 frames and its animation's 19 after it, a
// Box of 3 by 5 metres 0.4 ahead of the body with no Declension stack, and at four stacks, the full hold's, a box of 4 by 6
// 0.3 ahead and the Conviction bonus. The hold is gcsim's full charge, which takes 180 frames and so releases at 3 seconds
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/heizou/skill.go
const SKILL_HITMARK_FRAMES = 20;
const SKILL_FRAMES = 19 + SKILL_HITMARK_FRAMES;
const PRESS_HIT_AREA = createBoxReach(-0.4, 3, 5);
const HOLD_HIT_AREA = createBoxReach(-0.3, 4, 6);
const DECLENSION_STACKS_AT_FULL_HOLD = 4;
const FULL_HOLD_SECONDS = 180 / 60;

// Measured: gcsim v2.47.2 (MIT) heizou/burst.go, Fudou Style Vacuum Slugger's circle of radius 6 round the primary target at
// 34 frames, and the burst's animation of 72 frames
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/heizou/burst.go
const BURST_HITMARK_FRAMES = 34;
const BURST_FRAMES = 72;
const BURST_HIT_AREA = createTargetedHitArea(SKILL_TARGETING_AREA, 6);

export const HEIZOU_CHARACTER_ID = 10_000_059;

// Heizou's first kit, at talent level 1: five strikes with the fourth's three hits, a charged attack, a collision and two
// Plunges, Heartstopper Strike's press and its full hold with the Declension stacks it gains, and Fudou Style Vacuum
// Slugger. His multipliers are read from his proud skill groups. Windmuster Iris, which reads the enemy's aura, and his
// Passives and constellations are not built
export const createHeizouKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, HEIZOU_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
  const skillTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, HEIZOU_SKILL_GROUP_ID, TALENT_START_LEVEL, index);
  const burstTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, HEIZOU_BURST_GROUP_ID, TALENT_START_LEVEL, index);

  // Each strike is its own hits at their hitmarks, the fourth strike's three at 3, 4 and 5 of the attack group
  const normalAttackHits: KitHit[][] = [
    [
      {
        hitArea: FIRST_AND_SECOND_STRIKE_HIT_AREA,
        hitmarkSeconds: 12 / 60,
        poiseDamage: 0,
        talentMultiplier: attackTalentMultiplier(0),
      },
    ],
    [
      {
        hitArea: FIRST_AND_SECOND_STRIKE_HIT_AREA,
        hitmarkSeconds: 13 / 60,
        poiseDamage: 0,
        talentMultiplier: attackTalentMultiplier(1),
      },
    ],
    [
      {
        hitArea: THIRD_STRIKE_HIT_AREA,
        hitmarkSeconds: 21 / 60,
        poiseDamage: 0,
        talentMultiplier: attackTalentMultiplier(2),
      },
    ],
    [
      {
        hitArea: FIRST_AND_SECOND_STRIKE_HIT_AREA,
        hitmarkSeconds: 13 / 60,
        poiseDamage: 0,
        talentMultiplier: attackTalentMultiplier(3),
      },
      {
        hitArea: FIRST_AND_SECOND_STRIKE_HIT_AREA,
        hitmarkSeconds: 19 / 60,
        poiseDamage: 0,
        talentMultiplier: attackTalentMultiplier(4),
      },
      {
        hitArea: FIRST_AND_SECOND_STRIKE_HIT_AREA,
        hitmarkSeconds: 27 / 60,
        poiseDamage: 0,
        talentMultiplier: attackTalentMultiplier(5),
      },
    ],
    [
      {
        hitArea: FIFTH_STRIKE_HIT_AREA,
        hitmarkSeconds: 31 / 60,
        poiseDamage: 0,
        talentMultiplier: attackTalentMultiplier(6),
      },
    ],
  ];
  const normalAttacks: KitAction[] = normalAttackHits.map((hits, index): KitAction => ({
    hits: hits.map((hit): KitHit => ({ ...hit, internalCooldownTag: InternalCooldownTag.NormalAttack })),
    seconds: takeOne(NORMAL_ATTACK_CANCEL_FRAMES, index) / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  }));

  // A press strikes with no Declension stack, and the full hold with four, its Conviction bonus added
  const pressHit: KitHit = {
    hitArea: PRESS_HIT_AREA,
    hitmarkSeconds: SKILL_HITMARK_FRAMES / 60,
    internalCooldownTag: InternalCooldownTag.ElementalSkill,
    poiseDamage: 0,
    talentMultiplier: skillTalentMultiplier(0),
  };
  const fullHoldHit: KitHit = {
    hitArea: HOLD_HIT_AREA,
    hitmarkSeconds: SKILL_HITMARK_FRAMES / 60,
    internalCooldownTag: InternalCooldownTag.ElementalSkill,
    poiseDamage: 0,
    talentMultiplier:
      skillTalentMultiplier(0) +
      DECLENSION_STACKS_AT_FULL_HOLD * skillTalentMultiplier(HEIZOU_SKILL_DECLENSION_INDEX) +
      skillTalentMultiplier(HEIZOU_SKILL_CONVICTION_INDEX),
  };
  const skillCooldownSeconds = skillTalentMultiplier(HEIZOU_SKILL_COOLDOWN_INDEX);

  return {
    burstCooldownSeconds: burstTalentMultiplier(HEIZOU_BURST_COOLDOWN_INDEX),
    burstEnergyCost: burstTalentMultiplier(HEIZOU_BURST_ENERGY_COST_INDEX),
    chargedAttack: {
      hits: [
        {
          hitArea: CHARGED_ATTACK_HIT_AREA,
          hitmarkSeconds: CHARGED_ATTACK_HITMARK_FRAMES / 60,
          poiseDamage: 0,
          talentMultiplier: attackTalentMultiplier(7),
        },
      ],
      seconds: CHARGED_ATTACK_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    chargedAttackStamina: attackTalentMultiplier(CHARGED_ATTACK_STAMINA_INDEX),
    elementalBurst: {
      hits: [
        {
          hitArea: BURST_HIT_AREA,
          hitmarkSeconds: BURST_HITMARK_FRAMES / 60,
          poiseDamage: 0,
          talentMultiplier: burstTalentMultiplier(0),
        },
      ],
      seconds: BURST_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    elementalSkill: { hits: [pressHit], seconds: SKILL_FRAMES / 60, targetingArea: SKILL_TARGETING_AREA },
    // The hold is gcsim's full charge: it releases at three seconds with four stacks, and its strike lands 20 frames on
    elementalSkillHolds: [
      {
        action: { hits: [fullHoldHit], seconds: SKILL_FRAMES / 60, targetingArea: SKILL_TARGETING_AREA },
        cooldownSeconds: skillCooldownSeconds,
        minimumHeldSeconds: FULL_HOLD_SECONDS,
      },
    ],
    highPlunge: {
      hits: [
        {
          hitArea: HIGH_PLUNGE_HIT_AREA,
          hitmarkSeconds: HIGH_PLUNGE_HITMARK_FRAMES / 60,
          poiseDamage: 0,
          talentMultiplier: attackTalentMultiplier(11),
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
          poiseDamage: 0,
          talentMultiplier: attackTalentMultiplier(10),
        },
      ],
      seconds: LOW_PLUNGE_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    normalAttacks,
    plungeCollision: {
      hitArea: COLLISION_HIT_AREA,
      hitmarkSeconds: COLLISION_HITMARK_FRAMES / 60,
      poiseDamage: 0,
      talentMultiplier: attackTalentMultiplier(9),
    },
    skillCooldownSeconds,
  };
};
