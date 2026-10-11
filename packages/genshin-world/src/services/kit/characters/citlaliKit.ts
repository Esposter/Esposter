import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitHit } from "#src/models/kit/KitHit";

import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { PLUNGE_HIT_AREAS, SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA } from "#src/services/kit/constants";
import { createCircleReach } from "#src/services/kit/createCircleReach";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Citlali's proud skill groups, read at her talent level. The attack group holds the three strikes at 0 to 2, the charged
// Attack at 3, its stamina at 4, and the plunges' collision, low and high at 5, 6 and 7. The skill group holds Obsidian
// Tzitzimitl at 0 and the skill's cooldown at 7. The burst group holds Ice Storm at 0, the skulls at 1, the burst's cooldown
// At 4 and its energy cost at 5
const CITLALI_ATTACK_GROUP_ID = 10731;
const CITLALI_SKILL_GROUP_ID = 10732;
const CITLALI_BURST_GROUP_ID = 10739;
const CHARGED_ATTACK_MULTIPLIER_INDEX = 3;
const CHARGED_ATTACK_STAMINA_INDEX = 4;
const SKILL_COOLDOWN_INDEX = 7;
const BURST_COOLDOWN_INDEX = 4;
const BURST_ENERGY_COST_INDEX = 5;

// Measured: gcsim (MIT, main) citlali/attack.go, the three strikes' hitmarks, cancels and reach, a circle of radius 0.8 round
// The body. gcsim gives them no poise, and queues each hit to land 10 frames after its hitmark, its travel
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/citlali/attack.go
const NORMAL_ATTACK_FRAMES: readonly { cancelFrames: number; hitmarkFrames: number }[] = [
  { cancelFrames: 38, hitmarkFrames: 16 },
  { cancelFrames: 39, hitmarkFrames: 16 },
  { cancelFrames: 52, hitmarkFrames: 36 },
];
const NORMAL_ATTACK_HIT_AREA = createCircleReach(0, 0.8);
const NORMAL_ATTACK_TRAVEL_FRAMES = 10;

// Measured: gcsim (MIT, main) citlali/charge.go, the charged attack's animation at 56 frames and its hit at 50 as a circle
// Of radius 0.8 round the body, with no poise gcsim gives it
const CHARGED_ATTACK_FRAMES = 56;
const CHARGED_ATTACK_HITMARK_FRAMES = 50;
const CHARGED_ATTACK_HIT_AREA = createCircleReach(0, 0.8);

// Measured: gcsim (MIT, main) citlali/skill.go, the skill's press at 50 frames, its Obsidian Tzitzimitl hit at 20 as a circle
// Of radius 6 round the body. Its cooldown is 16 seconds. The hit is Nightsoul-tagged in gcsim, and the Itzpapa it summons and
// The Opal Shield it gives wait on the Nightsoul hook, so only the hit is built here
const SKILL_FRAMES = 50;
const SKILL_HITMARK_FRAMES = 20;
const SKILL_HIT_AREA = createCircleReach(0, 6);

// Measured: gcsim (MIT, main) citlali/burst.go, Ice Storm's animation at 113 frames and its hit at 118 as a circle of
// Radius 6.5 round the target. The burst's energy cost and cooldown come from the proud group. Its skulls are not built: each
// Is summoned on an enemy within 7 of Citlali and lands at a random time from 87 to 117 frames after its hit, which the
// Framework's fixed hitmarks cannot place, so they wait on the timed-hit hook
const BURST_FRAMES = 113;
const BURST_HITMARK_FRAMES = 118;
const BURST_HIT_AREA = createCircleReach(0, 6.5);

// Citlali's gcsim folder has no plunge file, so her plunge reaches are the shared table's, and each plunge lands as its
// Action starts with a zero animation, as the Ororon kit does. The collision, low and high plunges read the proud group's 5, 6
// And 7
const NO_POISE_DAMAGE = 0;

export const CITLALI_CHARACTER_ID = 10_000_107;

// Citlali's kit as built: her three strikes, charged attack, Obsidian Tzitzimitl's hit and Ice Storm, and her collision, low
// And high plunges. Her skill's Itzpapa and Opal Shield and her burst's skulls wait on their hooks, and her passives on the
// Nightsoul hook
export const createCitlaliKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const createNormalAttack = (
    { cancelFrames, hitmarkFrames }: (typeof NORMAL_ATTACK_FRAMES)[number],
    index: number,
  ): KitAction => ({
    hits: [
      {
        hitArea: NORMAL_ATTACK_HIT_AREA,
        hitmarkSeconds: (hitmarkFrames + NORMAL_ATTACK_TRAVEL_FRAMES) / 60,
        poiseDamage: NO_POISE_DAMAGE,
        talentMultiplier: getTalentMultiplier(talentMultiplierMap, CITLALI_ATTACK_GROUP_ID, TALENT_START_LEVEL, index),
      },
    ],
    seconds: cancelFrames / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  });
  const createPlungeHit = (
    hitArea: (typeof PLUNGE_HIT_AREAS)[keyof typeof PLUNGE_HIT_AREAS],
    multiplierIndex: number,
  ): KitHit => ({
    hitArea,
    hitmarkSeconds: 0,
    poiseDamage: NO_POISE_DAMAGE,
    talentMultiplier: getTalentMultiplier(
      talentMultiplierMap,
      CITLALI_ATTACK_GROUP_ID,
      TALENT_START_LEVEL,
      multiplierIndex,
    ),
  });
  return {
    burstCooldownSeconds: getTalentMultiplier(
      talentMultiplierMap,
      CITLALI_BURST_GROUP_ID,
      TALENT_START_LEVEL,
      BURST_COOLDOWN_INDEX,
    ),
    burstEnergyCost: getTalentMultiplier(
      talentMultiplierMap,
      CITLALI_BURST_GROUP_ID,
      TALENT_START_LEVEL,
      BURST_ENERGY_COST_INDEX,
    ),
    chargedAttack: {
      hits: [
        {
          hitArea: CHARGED_ATTACK_HIT_AREA,
          hitmarkSeconds: CHARGED_ATTACK_HITMARK_FRAMES / 60,
          poiseDamage: NO_POISE_DAMAGE,
          talentMultiplier: getTalentMultiplier(
            talentMultiplierMap,
            CITLALI_ATTACK_GROUP_ID,
            TALENT_START_LEVEL,
            CHARGED_ATTACK_MULTIPLIER_INDEX,
          ),
        },
      ],
      seconds: CHARGED_ATTACK_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    chargedAttackStamina: getTalentMultiplier(
      talentMultiplierMap,
      CITLALI_ATTACK_GROUP_ID,
      TALENT_START_LEVEL,
      CHARGED_ATTACK_STAMINA_INDEX,
    ),
    elementalBurst: {
      hits: [
        {
          hitArea: BURST_HIT_AREA,
          hitmarkSeconds: BURST_HITMARK_FRAMES / 60,
          poiseDamage: NO_POISE_DAMAGE,
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, CITLALI_BURST_GROUP_ID, TALENT_START_LEVEL, 0),
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
          poiseDamage: NO_POISE_DAMAGE,
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, CITLALI_SKILL_GROUP_ID, TALENT_START_LEVEL, 0),
        },
      ],
      seconds: SKILL_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    highPlunge: { hits: [createPlungeHit(PLUNGE_HIT_AREAS.high, 7)], seconds: 0, targetingArea: STRIKE_TARGETING_AREA },
    lowPlunge: { hits: [createPlungeHit(PLUNGE_HIT_AREAS.low, 6)], seconds: 0, targetingArea: STRIKE_TARGETING_AREA },
    normalAttacks: NORMAL_ATTACK_FRAMES.map((frames, index) => createNormalAttack(frames, index)),
    plungeCollision: createPlungeHit(PLUNGE_HIT_AREAS.collision, 5),
    skillCooldownSeconds: getTalentMultiplier(
      talentMultiplierMap,
      CITLALI_SKILL_GROUP_ID,
      TALENT_START_LEVEL,
      SKILL_COOLDOWN_INDEX,
    ),
  };
};
