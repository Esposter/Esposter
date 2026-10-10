import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitStepContext } from "#src/models/kit/KitStepContext";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { createTargetedHitArea } from "#src/services/kit/createTargetedHitArea";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { createKitSummon } from "#src/services/kit/effects/createKitSummon";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Fischl's proud skill groups, read at her talent level. The attack group holds the five arrows at 0 to 4, the aimed shot
// At 5 and the fully charged aimed shot at 6, and the plunges' collision, low and high at 7, 8 and 9, the layout the
// Amber's and the Traveler's groups share. The skill group holds Oz's summon at 0 and its attack at 1, the duration at 3
// And the skill's cooldown at 4. The burst group holds Midnight Phantasmagoria at 0, its cooldown at 4 and its energy cost
// At 5
const FISCHL_ATTACK_GROUP_ID = 3131;
const FISCHL_SKILL_GROUP_ID = 3132;
const FISCHL_BURST_GROUP_ID = 3139;

// Provisional: the reach the targeting reads for the strikes, the skill and the burst, as the other kits' are
const STRIKE_TARGETING_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 6, radius: 5 });
const SKILL_TARGETING_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 10, radius: 15 });

// Measured: gcsim v2.47.2 (MIT) fischl/attack.go, each arrow's hitmark and the frame its action cancels at. The arrow lands
// At the primary target through a box a metre long, so it is priced as a circle of a metre round the body, as Amber's are
// Https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/fischl/attack.go
const ARROW_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1 });
// Each arrow's hitmark and cancel frame, in the order of the five normal attacks
const ARROW_FRAMES = [
  { cancelFrames: 25, hitmarkFrames: 15 },
  { cancelFrames: 22, hitmarkFrames: 11 },
  { cancelFrames: 38, hitmarkFrames: 24 },
  { cancelFrames: 32, hitmarkFrames: 26 },
  { cancelFrames: 67, hitmarkFrames: 21 },
];
// Measured: gcsim v2.47.2 (MIT) fischl/aimed.go, the fully charged shot at 86 frames, travelling 10
// Https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/fischl/aimed.go
const FULL_AIM_HITMARK_FRAMES = 86;
const FULL_AIM_SECONDS = 96 / 60;
const ARROW_TRAVEL_FRAMES = 10;

// Measured: gcsim v2.47.2 (MIT) fischl/skill.go, Oz's summon hitting at 38 frames after the press's 18-frame spawn, and its
// Attacks every 59 frames from 82 frames, each landing 10 frames on. Oz stands for 600 frames from its spawn, and the
// Animation runs 43 frames
// Https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/fischl/skill.go
const SKILL_SECONDS = 43 / 60;
const OZ_SUMMON_HITMARK_FRAMES = 38;
const OZ_SPAWN_FRAMES = 18;
const OZ_FIRST_TICK_FRAMES = 64;
const OZ_TICK_INTERVAL_FRAMES = 59;
const OZ_DURATION_FRAMES = 600;
// The burst spawns the full Oz at 113 frames, and its first attack comes 69 frames later
// Https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/fischl/burst.go
const BURST_OZ_SPAWN_FRAMES = 113;
const BURST_OZ_FIRST_TICK_FRAMES = 69;
const BURST_HITMARK_FRAMES = 18;
const BURST_FRAMES = 148;

// Oz's attacks are Electro with no internal cooldown of their own in gcsim's table, so Oz's ticks take the skill's group
// Provisional: the cooldown tag gcsim gives Oz's ticks is an elemental art group this kit does not carry yet
const OZ_TICK_INTERVAL_TAG = InternalCooldownTag.ElementalSkill;
// Oz's attacks and summon deal no poise in gcsim, so their poise is none
const OZ_POISE_DAMAGE = 0;
const MIDNIGHT_PHANTASMAGORIA_POISE_DAMAGE = 150;

// Provisional: gcsim gives the arrows and plunges no poise, so these stand in until a source gives them
const ARROW_POISE_DAMAGE = 12.9;
const FULL_AIM_POISE_DAMAGE = 20;
const PLUNGE_COLLISION_POISE_DAMAGE = 10;
const LOW_PLUNGE_POISE_DAMAGE = 50;
const HIGH_PLUNGE_POISE_DAMAGE = 100;
const PLUNGE_COLLISION_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1 });
const LOW_PLUNGE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 3 });
const HIGH_PLUNGE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 5 });

// Measured: gcsim v2.47.2 (MIT) fischl/burst.go, Midnight Phantasmagoria's circle on the body of radius 0.5
const BURST_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 0.5 });
// Measured: gcsim v2.47.2 (MIT) fischl/skill.go, Oz's spawn strikes a circle of radius 2 on the primary target, and each of
// Its attacks a box a metre long there, priced as a circle of a metre as the arrows are. Oz stands where Fischl cast it, so
// Both are priced round its body at the skill's reach plus their own
const OZ_SUMMON_HIT_AREA = createTargetedHitArea(SKILL_TARGETING_AREA, 2);
const OZ_ATTACK_HIT_AREA = createTargetedHitArea(SKILL_TARGETING_AREA, 1);

// Oz's attacks, as a summon's hits, from its spawn at the frame given: one every 59 frames, each 10 frames after its tick
const createOzAttackHits = (
  talentMultiplierMap: TalentMultiplierMap,
  spawnFrames: number,
  firstTickFrames: number,
): KitHit[] => {
  // An attack lands while Oz still stands, which is for the duration from its spawn
  const tickCount = Math.ceil((OZ_DURATION_FRAMES - firstTickFrames) / OZ_TICK_INTERVAL_FRAMES);
  return Array.from({ length: tickCount }, (_tick, index): KitHit => ({
    element: Element.Electro,
    gauge: 1,
    hitArea: OZ_ATTACK_HIT_AREA,
    hitmarkSeconds: (spawnFrames + firstTickFrames + index * OZ_TICK_INTERVAL_FRAMES + ARROW_TRAVEL_FRAMES) / 60,
    internalCooldownTag: OZ_TICK_INTERVAL_TAG,
    poiseDamage: OZ_POISE_DAMAGE,
    talentMultiplier: getTalentMultiplier(talentMultiplierMap, FISCHL_SKILL_GROUP_ID, TALENT_START_LEVEL, 1),
  }));
};

// A normal attack is one arrow, Physical, with its hitmark and its cancel, as gcsim gives each of the five
const createArrow = (
  talentMultiplierMap: TalentMultiplierMap,
  { cancelFrames, hitmarkFrames }: (typeof ARROW_FRAMES)[number],
  index: number,
): KitAction => ({
  hits: [
    {
      hitArea: ARROW_HIT_AREA,
      hitmarkSeconds: hitmarkFrames / 60,
      poiseDamage: ARROW_POISE_DAMAGE,
      talentMultiplier: getTalentMultiplier(talentMultiplierMap, FISCHL_ATTACK_GROUP_ID, TALENT_START_LEVEL, index),
    },
  ],
  seconds: cancelFrames / 60,
  targetingArea: STRIKE_TARGETING_AREA,
});

// Fischl's first kit, at talent level 1: five arrows, a fully charged aimed shot, a collision and two plunges, Oz's summon
// And attacks, and Midnight Phantasmagoria with the full Oz it spawns. Its multipliers are read from her proud skill groups.
// Thundering Retribution (ascension 4) and Gaze of the Deep and Evernight Raven (constellations 1 and 6) wait for the
// Reaction and the constellation events, and the skill's recast and the burst's short spawn after a swap are not built
export const createFischlKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const ozSummonHit: KitHit = {
    element: Element.Electro,
    gauge: 1,
    hitArea: OZ_SUMMON_HIT_AREA,
    hitmarkSeconds: OZ_SUMMON_HITMARK_FRAMES / 60,
    poiseDamage: OZ_POISE_DAMAGE,
    talentMultiplier: getTalentMultiplier(talentMultiplierMap, FISCHL_SKILL_GROUP_ID, TALENT_START_LEVEL, 0),
  };
  const midnightPhantasmagoria: KitHit = {
    element: Element.Electro,
    gauge: 1,
    hitArea: BURST_HIT_AREA,
    hitmarkSeconds: BURST_HITMARK_FRAMES / 60,
    internalCooldownTag: InternalCooldownTag.ElementalBurst,
    poiseDamage: MIDNIGHT_PHANTASMAGORIA_POISE_DAMAGE,
    talentMultiplier: getTalentMultiplier(talentMultiplierMap, FISCHL_BURST_GROUP_ID, TALENT_START_LEVEL, 0),
  };
  const skillOzHits = [ozSummonHit, ...createOzAttackHits(talentMultiplierMap, OZ_SPAWN_FRAMES, OZ_FIRST_TICK_FRAMES)];
  const burstOzHits = createOzAttackHits(talentMultiplierMap, BURST_OZ_SPAWN_FRAMES, BURST_OZ_FIRST_TICK_FRAMES);
  // Whether an effect is one of Fischl's Oz: the summon her skill or her burst casts
  const checkIsOz = (effect: KitEffect, characterId: number): effect is KitSummon =>
    effect.kind === "summon" &&
    effect.combatant.characterId === characterId &&
    (effect.hits === skillOzHits || effect.hits === burstOzHits);
  // Only one Oz stands, so the skill's or the burst's ends the one before, as gcsim's spawn drops the earlier Oz's attacks
  const castOz = ({ body, combatant, kitEffectState }: KitStepContext, hits: KitHit[]): void => {
    kitEffectState.effects = kitEffectState.effects.filter((effect) => !checkIsOz(effect, combatant.characterId));
    addKitEffect(kitEffectState, createKitSummon(body, combatant, hits));
  };
  return {
    burstCooldownSeconds: getTalentMultiplier(talentMultiplierMap, FISCHL_BURST_GROUP_ID, TALENT_START_LEVEL, 4),
    burstEnergyCost: getTalentMultiplier(talentMultiplierMap, FISCHL_BURST_GROUP_ID, TALENT_START_LEVEL, 5),
    // The wiki's fully charged aimed shot deals 1U of Electro, as gcsim's Durability 25 gives it, under the Charged Attack
    // Internal cooldown. A bow's aimed shot costs no stamina, as Amber's does not
    chargedAttack: {
      hits: [
        {
          element: Element.Electro,
          gauge: 1,
          hitArea: ARROW_HIT_AREA,
          hitmarkSeconds: FULL_AIM_HITMARK_FRAMES / 60,
          internalCooldownTag: InternalCooldownTag.ChargedAttack,
          poiseDamage: FULL_AIM_POISE_DAMAGE,
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, FISCHL_ATTACK_GROUP_ID, TALENT_START_LEVEL, 6),
        },
      ],
      isAimed: true,
      seconds: FULL_AIM_SECONDS,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    chargedAttackStamina: 0,
    // Midnight Phantasmagoria's hit lands on the body, and Oz spawns at 113 frames from the cast and attacks from there
    elementalBurst: {
      hits: [midnightPhantasmagoria],
      onStart: (context) => castOz(context, burstOzHits),
      seconds: BURST_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    // Oz spawns at 18 frames from the press, lands its summon's hit at 38 and attacks from its first tick
    elementalSkill: {
      hits: [],
      onStart: (context) => castOz(context, skillOzHits),
      seconds: SKILL_SECONDS,
      targetingArea: SKILL_TARGETING_AREA,
    },
    highPlunge: {
      hits: [
        {
          hitArea: HIGH_PLUNGE_HIT_AREA,
          hitmarkSeconds: 0,
          poiseDamage: HIGH_PLUNGE_POISE_DAMAGE,
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, FISCHL_ATTACK_GROUP_ID, TALENT_START_LEVEL, 9),
        },
      ],
      seconds: 0.4,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    lowPlunge: {
      hits: [
        {
          hitArea: LOW_PLUNGE_HIT_AREA,
          hitmarkSeconds: 0,
          poiseDamage: LOW_PLUNGE_POISE_DAMAGE,
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, FISCHL_ATTACK_GROUP_ID, TALENT_START_LEVEL, 8),
        },
      ],
      seconds: 0.4,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    normalAttacks: ARROW_FRAMES.map((frames, index) => createArrow(talentMultiplierMap, frames, index)),
    plungeCollision: {
      hitArea: PLUNGE_COLLISION_HIT_AREA,
      hitmarkSeconds: 0,
      poiseDamage: PLUNGE_COLLISION_POISE_DAMAGE,
      talentMultiplier: getTalentMultiplier(talentMultiplierMap, FISCHL_ATTACK_GROUP_ID, TALENT_START_LEVEL, 7),
    },
    skillCooldownSeconds: getTalentMultiplier(talentMultiplierMap, FISCHL_SKILL_GROUP_ID, TALENT_START_LEVEL, 4),
  };
};
