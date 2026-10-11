import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitHit } from "#src/models/kit/KitHit";

import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { PLUNGE_HIT_AREAS, SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA } from "#src/services/kit/constants";
import { createBoxReach } from "#src/services/kit/createBoxReach";
import { createTargetedHitArea } from "#src/services/kit/createTargetedHitArea";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { createKitSummon } from "#src/services/kit/effects/createKitSummon";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

export const SIGEWINNE_CHARACTER_ID = 10_000_095;

// Sigewinne's proud groups, read at her talent level. The attack group holds her three strikes at 0, 1 and 2, the
// Fully-Charged Aimed Shot at 7, and the plunges at 3, 4 and 5 by the ratios of their values, which gcsim names no group
// For. The skill group holds Bolstering Bubblebalm's damage at 0 as a share of Max HP and the press's cooldown at 8. The
// Burst group holds Super Saturated Syringing's cooldown at 1, its energy cost at 2 and its damage at 0 as a share of Max HP
const SIGEWINNE_ATTACK_GROUP_ID = 9531;
const SIGEWINNE_SKILL_GROUP_ID = 9532;
const SIGEWINNE_BURST_GROUP_ID = 9539;

// Measured: gcsim (MIT) sigewinne/attack.go, each strike's hitmark and animation at 60 fps, its hit on the hitmark as the
// Kit lands it. The first strike is a box from 0.5 metres ahead, 0.1 wide and a metre long, and the second and third are
// Circles of radius 1 on the target
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/sigewinne/attack.go
const NORMAL_ATTACKS = [
  { frames: 33, groupIndex: 0, hitArea: createBoxReach(-0.5, 0.1, 1), hitmarkFrames: 12 },
  { frames: 40, groupIndex: 1, hitArea: createTargetedHitArea(STRIKE_TARGETING_AREA, 1), hitmarkFrames: 14 },
  { frames: 82, groupIndex: 2, hitArea: createTargetedHitArea(STRIKE_TARGETING_AREA, 1), hitmarkFrames: 38 },
] as const;
// Provisional: gcsim gives Sigewinne's strikes no poise, so they carry none until a source gives it
const NORMAL_ATTACK_POISE_DAMAGE = 0;

// Measured: gcsim (MIT) sigewinne/aimed.go, the Fully-Charged Aimed Shot at 86 frames within its 94-frame animation, a box
// Like her first strike's. Its charge's first level is gcsim's default; the second level's Mini-Stration Bubble is not built
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/sigewinne/aimed.go
const FULLY_CHARGED_AIMED_SHOT_FRAMES = 94;
const FULLY_CHARGED_AIMED_SHOT_HITMARK_FRAMES = 86;
const FULLY_CHARGED_AIMED_SHOT_HIT_AREA = createBoxReach(-0.5, 0.1, 1);

// Measured: gcsim (MIT) sigewinne/skill.go, the press's Bolstering Bubblebalm, its first bubble at 35 frames and then one
// Every 107 frames, five in all, each a circle of radius 1 on the target. The press's animation is 41 frames and its
// Cooldown 18 seconds. The bubbles' damage is a share of Max HP, which is the striker's as each bubble is priced
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/sigewinne/skill.go
const SKILL_PRESS_FRAMES = 41;
const SKILL_PRESS_HITMARK_FRAMES = 35;
const BUBBLE_HIT_INTERVAL_FRAMES = 107;
const BUBBLE_HIT_COUNT = 5;
const BUBBLE_HIT_AREA = createTargetedHitArea(SKILL_TARGETING_AREA, 1);

// Measured: gcsim (MIT) sigewinne/burst.go, Super Saturated Syringing's waves, each a box 4 metres wide and 10 long from
// Her, the first at 99 frames and then every 25 while its 241-frame animation lasts, six in all
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/sigewinne/burst.go
const BURST_FRAMES = 241;
const BURST_FIRST_WAVE_FRAMES = 99;
const BURST_WAVE_INTERVAL_FRAMES = 25;
const BURST_WAVE_COUNT = 6;
const BURST_WAVE_HIT_AREA = createBoxReach(0, 4, 10);

// Provisional: gcsim gives her no plunge hitmark, so each plunge lands as its action starts and lasts 0.4 seconds, as
// Ganyu's do, with the shared plunge reaches
const PLUNGE_SECONDS = 0.4;

export const createSigewinneKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackMultiplier = (groupIndex: number): number =>
    getTalentMultiplier(talentMultiplierMap, SIGEWINNE_ATTACK_GROUP_ID, TALENT_START_LEVEL, groupIndex);
  const bubbleShare = getTalentMultiplier(talentMultiplierMap, SIGEWINNE_SKILL_GROUP_ID, TALENT_START_LEVEL, 0);
  const burstShare = getTalentMultiplier(talentMultiplierMap, SIGEWINNE_BURST_GROUP_ID, TALENT_START_LEVEL, 0);
  // Each bubble's hit is a share of its striker's Max HP as flat damage, priced as the hit is made
  const bubbleHits: KitHit[] = Array.from({ length: BUBBLE_HIT_COUNT }, (_value, index) => ({
    additiveBaseDamageBonus: ({ attributes }) => bubbleShare * attributes.maxHealth,
    element: Element.Hydro,
    gauge: 1,
    hitArea: BUBBLE_HIT_AREA,
    hitmarkSeconds: (SKILL_PRESS_HITMARK_FRAMES + BUBBLE_HIT_INTERVAL_FRAMES * index) / 60,
    internalCooldownTag: InternalCooldownTag.ElementalSkill,
    poiseDamage: 0,
    talentMultiplier: 0,
  }));
  const burstWaveHits: KitHit[] = Array.from({ length: BURST_WAVE_COUNT }, (_value, index) => ({
    additiveBaseDamageBonus: ({ attributes }) => burstShare * attributes.maxHealth,
    element: Element.Hydro,
    gauge: 1,
    hitArea: BURST_WAVE_HIT_AREA,
    hitmarkSeconds: (BURST_FIRST_WAVE_FRAMES + BURST_WAVE_INTERVAL_FRAMES * index) / 60,
    internalCooldownTag: InternalCooldownTag.ElementalBurst,
    poiseDamage: 0,
    talentMultiplier: 0,
  }));
  const normalAttacks: KitAction[] = NORMAL_ATTACKS.map(({ frames, groupIndex, hitArea, hitmarkFrames }) => ({
    hits: [
      {
        hitArea,
        hitmarkSeconds: hitmarkFrames / 60,
        internalCooldownTag: InternalCooldownTag.NormalAttack,
        poiseDamage: NORMAL_ATTACK_POISE_DAMAGE,
        talentMultiplier: attackMultiplier(groupIndex),
      },
    ],
    seconds: frames / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  }));
  return {
    burstCooldownSeconds: getTalentMultiplier(talentMultiplierMap, SIGEWINNE_BURST_GROUP_ID, TALENT_START_LEVEL, 1),
    burstEnergyCost: getTalentMultiplier(talentMultiplierMap, SIGEWINNE_BURST_GROUP_ID, TALENT_START_LEVEL, 2),
    chargedAttack: {
      hits: [
        {
          element: Element.Hydro,
          gauge: 1,
          hitArea: FULLY_CHARGED_AIMED_SHOT_HIT_AREA,
          hitmarkSeconds: FULLY_CHARGED_AIMED_SHOT_HITMARK_FRAMES / 60,
          internalCooldownTag: InternalCooldownTag.ChargedAttack,
          poiseDamage: 0,
          talentMultiplier: attackMultiplier(7),
        },
      ],
      isAimed: true,
      seconds: FULLY_CHARGED_AIMED_SHOT_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    // A bow's charged shot costs no stamina, as Ganyu's does not
    chargedAttackStamina: 0,
    elementalBurst: { hits: burstWaveHits, seconds: BURST_FRAMES / 60, targetingArea: SKILL_TARGETING_AREA },
    // The press casts Bolstering Bubblebalm where she stands, its five bubbles landing from there. Its healing and its
    // Hold's bubble tiers are not built
    elementalSkill: {
      hits: [],
      onStart: ({ body, combatant, kitEffectState }) => {
        addKitEffect(kitEffectState, createKitSummon(body, combatant, bubbleHits));
      },
      seconds: SKILL_PRESS_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    highPlunge: {
      hits: [
        { hitArea: PLUNGE_HIT_AREAS.high, hitmarkSeconds: 0, poiseDamage: 0, talentMultiplier: attackMultiplier(5) },
      ],
      seconds: PLUNGE_SECONDS,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    lowPlunge: {
      hits: [
        { hitArea: PLUNGE_HIT_AREAS.low, hitmarkSeconds: 0, poiseDamage: 0, talentMultiplier: attackMultiplier(4) },
      ],
      seconds: PLUNGE_SECONDS,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    normalAttacks,
    plungeCollision: {
      hitArea: PLUNGE_HIT_AREAS.collision,
      hitmarkSeconds: 0,
      poiseDamage: 0,
      talentMultiplier: attackMultiplier(3),
    },
    skillCooldownSeconds: getTalentMultiplier(talentMultiplierMap, SIGEWINNE_SKILL_GROUP_ID, TALENT_START_LEVEL, 8),
  };
};
