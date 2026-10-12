import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA } from "#src/services/kit/constants";
import { createBoxReach } from "#src/services/kit/createBoxReach";
import { createFanReach } from "#src/services/kit/createFanReach";
import { createTargetedHitArea } from "#src/services/kit/createTargetedHitArea";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { createKitSummon } from "#src/services/kit/effects/createKitSummon";
import { findStandingKitSummon } from "#src/services/kit/effects/findStandingKitSummon";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Eula's proud skill groups, read at her talent level. The attack group holds the five strikes at 0 to 4, the charged
// Attack's spinning and final hits at 5 and 6, its stamina at 7, then the plunges' collision, low and high at 9, 10 and 11.
// The skill group holds Icetide Vortex's press at 0, its hold at 1, each Icewhirl at 2, the Cryo and Physical RES it shreds
// At 3 and 4, the seconds a shred lasts per Grimheart stack at 5, the press's cooldown at 6, the hold's at 7 and Grimheart's
// Seconds at 12. The burst group holds Glacial Illumination's initial hit at 0, the Lightfall Sword's explosion at 1, its
// DMG per stack at 2, the most stacks it holds at 3, its cooldown at 4 and its energy cost at 5
const EULA_ATTACK_GROUP_ID = 5131;
const EULA_SKILL_GROUP_ID = 5132;
const EULA_BURST_GROUP_ID = 5139;

// Measured: gcsim (MIT) eula/attack.go, each strike's hitmark and its animation's cancel frames, and each strike's poise.
// The fans and the box are priced round the body, as the other kits price their fans, their offsets left out
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/eula/attack.go
const NORMAL_ATTACKS = [
  { cancelFrames: 34, hitArea: createFanReach(270, 2), hitmarkFrames: [30], index: 0, poiseDamage: 101.2 },
  { cancelFrames: 36, hitArea: createFanReach(270, 2), hitmarkFrames: [19], index: 1, poiseDamage: 105.8 },
  { cancelFrames: 56, hitArea: createFanReach(360, 2), hitmarkFrames: [25, 42], index: 2, poiseDamage: 65.55 },
  { cancelFrames: 44, hitArea: createFanReach(270, 2), hitmarkFrames: [17], index: 3, poiseDamage: 129.95 },
  { cancelFrames: 105, hitArea: createBoxReach(0, 2, 3), hitmarkFrames: [29, 56], index: 4, poiseDamage: 68.21 },
];

// Provisional: gcsim leaves Eula's charged attack not implemented, so its two hits' reach is the circles of radius 3 and
// 3.5 gcsim's config gives, and their hitmarks, its animation and the reach of its hits are estimates until a recording of the
// Charged attack measures them
const CHARGED_ATTACK_SPIN_HITMARK_SECONDS = 0.5;
const CHARGED_ATTACK_FINAL_HITMARK_SECONDS = 1;
const CHARGED_ATTACK_SECONDS = 1.5;
const CHARGED_ATTACK_SPIN_RADIUS = 3;
const CHARGED_ATTACK_FINAL_RADIUS = 3.5;

// Measured: gcsim (MIT) eula/plunge.go, the low plunge's circle of radius 3 at 37 frames of an 80-frame animation, the high
// Plunge's of radius 5 at 41 frames of 84, and the collision's circle of radius 1 round the body
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/eula/plunge.go
const LOW_PLUNGE_FRAMES = 80;
const LOW_PLUNGE_HITMARK_FRAMES = 37;
const LOW_PLUNGE_RADIUS = 3;
const LOW_PLUNGE_POISE_DAMAGE = 150;
const HIGH_PLUNGE_FRAMES = 84;
const HIGH_PLUNGE_HITMARK_FRAMES = 41;
const HIGH_PLUNGE_RADIUS = 5;
const HIGH_PLUNGE_POISE_DAMAGE = 200;
const PLUNGE_COLLISION_RADIUS = 1;
// Provisional: gcsim gives the collision no poise, so it stands at 0 until a source gives it
const PLUNGE_COLLISION_POISE_DAMAGE = 0;

// Measured: gcsim (MIT) eula/skill.go, Icetide Vortex's press at 48 frames with its hit at 20 on a circle of radius 3.5 round
// The target, and its hold at 100 frames with its hit at 49 on a circle of radius 5.5 round the target. The press's cooldown
// Is 4 seconds and the hold's 10, which the skill group gives
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/eula/skill.go
const PRESS_FRAMES = 48;
const PRESS_HITMARK_FRAMES = 20;
const PRESS_RADIUS = 3.5;
const PRESS_POISE_DAMAGE = 120;
const HOLD_FRAMES = 100;
const HOLD_HITMARK_FRAMES = 49;
const HOLD_RADIUS = 5.5;
const HOLD_POISE_DAMAGE = 150;
// Provisional: gcsim takes a hold from the input alone, with no threshold, so the seconds a skill must be held before it is a
// Hold are an estimate until a recording of the hold input measures them
const HOLD_MINIMUM_HELD_SECONDS = 0.5;
// Measured: gcsim (MIT) eula/skill.go, each Icewhirl at 79 and 92 frames on a circle of radius 3.5 round the target, the
// Shred it leaves on the enemy for the seconds per stack the skill group gives
const ICEWHIRL_HITMARK_FRAMES = [79, 92];
const ICEWHIRL_RADIUS = 3.5;
const SHRED_SECONDS_PER_STACK_INDEX = 5;
// Measured: gcsim (MIT) eula/eula.go and skill.go, Grimheart's ICD of 18 frames on the press's strikes, which are the only
// Strikes that gain a stack
const GRIMHEART_ICD_SECONDS = 0.3;
const GRIMHEART_STACK_IDS = ["eula-grimheart-stack-0", "eula-grimheart-stack-1"];
const GRIMHEART_MAX_STACKS = 2;
const GRIMHEART_ICD_ID = "eula-grimheart-icd";
const ICEWHIRL_SHRED_ID = "eula-icewhirl-shred";
// Measured: gcsim (MIT) eula/skill.go, Ascension 1's Shattered Lightfall Sword at 108 frames of the hold, on a circle of radius
// 6.5 round the target, which it places 2 metres ahead of the body. Its offset is left out, as the other kits leave theirs out
const SHATTERED_LIGHTFALL_HITMARK_FRAMES = 108;
const SHATTERED_LIGHTFALL_RADIUS = 6.5;
const SHATTERED_LIGHTFALL_POISE_DAMAGE = 180;
const SHATTERED_LIGHTFALL_MULTIPLIER_FRACTION = 0.5;
// Measured: gcsim (MIT) eula/eula.go, Constellation 1's Physical DMG Bonus of 30% for 6 seconds per Grimheart stack plus 6
// Seconds, from the hold that consumes them
const CONSTELLATION_1_PHYSICAL_BONUS = 0.3;
const CONSTELLATION_1_BASE_SECONDS = 6;
const CONSTELLATION_1_SECONDS_PER_STACK = 6;
const CONSTELLATION_4_DAMAGE_BONUS = 0.25;
const CONSTELLATION_4_HEALTH_SHARE = 0.5;

// Measured: gcsim (MIT) eula/burst.go, Glacial Illumination's animation at 123 frames with its hit at 100 on a circle of radius
// 8 round the target, and the Lightfall Sword lit from 117 frames until 566, its explosion landing 600 frames after the cast
// On a circle of radius 6.5 round the target, which gains a stack from each of Eula's strikes every 0.1 seconds, up to 30
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/eula/burst.go
const BURST_FRAMES = 123;
const BURST_HITMARK_FRAMES = 100;
const BURST_RADIUS = 8;
const BURST_POISE_DAMAGE = 0;
const LIGHTFALL_STATUS_START_FRAMES = 117;
const LIGHTFALL_STATUS_END_FRAMES = 566;
const LIGHTFALL_EXPLOSION_FRAMES = 600;
const LIGHTFALL_EXPLOSION_RADIUS = 6.5;
const LIGHTFALL_EXPLOSION_POISE_DAMAGE = 400;
// The explosion lands 35 frames after the Lightfall Sword is cast as the Sword is triggered early, by a swap of characters
const LIGHTFALL_TRIGGER_DELAY_FRAMES = 35;
const LIGHTFALL_STACK_ICD_SECONDS = 0.1;
const LIGHTFALL_STACK_ICD_ID = "eula-lightfall-stack-icd";
const LIGHTFALL_MAX_STACKS = 30;
const getLightfallStackId = (index: number): string => `eula-lightfall-stack-${index}`;
const LIGHTFALL_STACK_IDS = Array.from({ length: LIGHTFALL_MAX_STACKS }, (_, index) => getLightfallStackId(index));
const LIGHTFALL_SUMMON_ID = "eula-lightfall";
// Constellation 6 starts the Sword with this many stacks, with its extra stack from each of Eula's strikes a random roll that
// This kit leaves out
const CONSTELLATION_6_STARTING_STACKS = 5;

const countGrimheartStacks = (effects: readonly KitEffect[], characterId: number): number =>
  effects.filter(
    (effect) =>
      effect.kind === "status" && effect.characterId === characterId && GRIMHEART_STACK_IDS.includes(effect.id),
  ).length;

const countLightfallStacks = (effects: readonly KitEffect[], characterId: number): number =>
  effects.filter(
    (effect) =>
      effect.kind === "status" && effect.characterId === characterId && LIGHTFALL_STACK_IDS.includes(effect.id),
  ).length;

const checkHasStatus = (effects: readonly KitEffect[], characterId: number, id: string): boolean =>
  effects.some((effect) => effect.kind === "status" && effect.characterId === characterId && effect.id === id);

// Each Grimheart stack gained refreshes every stack's seconds, as gcsim refreshes its one duration, and two is the most
const gainGrimheartStack = (kitEffectState: KitEffectState, combatant: Combatant, seconds: number): void => {
  const count = Math.min(countGrimheartStacks(kitEffectState.effects, combatant.characterId) + 1, GRIMHEART_MAX_STACKS);
  for (const id of GRIMHEART_STACK_IDS.slice(0, count))
    addKitEffect(kitEffectState, { characterId: combatant.characterId, id, kind: "status", secondsRemaining: seconds });
};

const clearGrimheartStacks = (kitEffectState: KitEffectState, characterId: number): void => {
  kitEffectState.effects = kitEffectState.effects.filter(
    (effect) =>
      !(effect.kind === "status" && effect.characterId === characterId && GRIMHEART_STACK_IDS.includes(effect.id)),
  );
};

// The explosion of the Lightfall Sword as the stacks it holds make it, its multiplier set by them and its hitmark at the seconds
const createLightfallExplosion = (
  explodeBase: number,
  explodePerStack: number,
  stacks: number,
  hitmarkSeconds: number,
): KitHit => ({
  hitArea: createTargetedHitArea(SKILL_TARGETING_AREA, LIGHTFALL_EXPLOSION_RADIUS),
  hitmarkSeconds,
  isBlunt: true,
  poiseDamage: LIGHTFALL_EXPLOSION_POISE_DAMAGE,
  talentMultiplier: explodeBase + explodePerStack * Math.min(stacks, LIGHTFALL_MAX_STACKS),
});

// Each Eula strike that lands while the Sword is lit gains it a stack, once every 0.1 seconds, and rebuilds its explosion
// From the stacks it now holds, so the explosion is priced by them when it lands
const gainLightfallStack = (
  kitEffectState: KitEffectState,
  combatant: Combatant,
  explodeBase: number,
  explodePerStack: number,
): void => {
  const { characterId } = combatant;
  const summon = findStandingKitSummon(kitEffectState.effects, LIGHTFALL_SUMMON_ID, characterId);
  if (
    summon === undefined ||
    summon.elapsedSeconds < LIGHTFALL_STATUS_START_FRAMES / 60 ||
    summon.elapsedSeconds >= LIGHTFALL_STATUS_END_FRAMES / 60 ||
    checkHasStatus(kitEffectState.effects, characterId, LIGHTFALL_STACK_ICD_ID)
  )
    return;
  addKitEffect(kitEffectState, {
    characterId,
    id: LIGHTFALL_STACK_ICD_ID,
    kind: "status",
    secondsRemaining: LIGHTFALL_STACK_ICD_SECONDS,
  });
  const count = countLightfallStacks(kitEffectState.effects, characterId);
  if (count >= LIGHTFALL_MAX_STACKS) return;
  addKitEffect(kitEffectState, {
    characterId,
    id: getLightfallStackId(count),
    kind: "status",
    secondsRemaining: Infinity,
  });
  const hits = [createLightfallExplosion(explodeBase, explodePerStack, count + 1, LIGHTFALL_EXPLOSION_FRAMES / 60)];
  kitEffectState.effects = kitEffectState.effects.map((effect) => (effect === summon ? { ...summon, hits } : effect));
};

// A swap of characters ends the Sword early: its explosion lands 35 frames on, priced by the stacks it holds then
const triggerLightfall = (
  kitEffectState: KitEffectState,
  characterId: number,
  explodeBase: number,
  explodePerStack: number,
): void => {
  const summon = findStandingKitSummon(kitEffectState.effects, LIGHTFALL_SUMMON_ID, characterId);
  if (summon === undefined) return;
  const stacks = countLightfallStacks(kitEffectState.effects, characterId);
  const hit = createLightfallExplosion(explodeBase, explodePerStack, stacks, LIGHTFALL_TRIGGER_DELAY_FRAMES / 60);
  kitEffectState.effects = kitEffectState.effects.filter(
    (effect) =>
      effect !== summon &&
      !(effect.kind === "status" && effect.characterId === characterId && LIGHTFALL_STACK_IDS.includes(effect.id)),
  );
  addKitEffect(kitEffectState, createKitSummon(summon.body, summon.combatant, [hit]));
};

export const EULA_CHARACTER_ID = 10_000_051;

// Eula's first kit, at talent level 1: five strikes, a charged attack, two plunges and a collision, Icetide Vortex's press
// And its hold, which spends her Grimheart stacks, and Glacial Illumination, which lights the Lightfall Sword. Her Grimheart
// Stacks come from the press, and her Lightfall Sword's stacks from her strikes. Her Ascension 1 Shattered Lightfall Sword,
// Ascension 4's stack, Constellation 1's Physical DMG Bonus, Constellation 4's Glacial Illumination bonus and Constellation
// 6's starting stacks are built. Her Constellation 2 hold cooldown, which the kit model cannot set per hold, is not, nor is
// Ascension 4's reset of the hold's cooldown, which it has no field to reach. The Constellation 6 roll's extra stack is left out
export const createEulaKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackMultiplier = (index: number) =>
    getTalentMultiplier(talentMultiplierMap, EULA_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
  const skillMultiplier = (index: number) =>
    getTalentMultiplier(talentMultiplierMap, EULA_SKILL_GROUP_ID, TALENT_START_LEVEL, index);
  const burstMultiplier = (index: number) =>
    getTalentMultiplier(talentMultiplierMap, EULA_BURST_GROUP_ID, TALENT_START_LEVEL, index);
  const explodeBase = burstMultiplier(1);
  const explodePerStack = burstMultiplier(2);
  const shredResistance = skillMultiplier(3);
  const shredPhysicalResistance = skillMultiplier(4);
  const shredSecondsPerStack = skillMultiplier(SHRED_SECONDS_PER_STACK_INDEX);
  const grimheartSeconds = skillMultiplier(12);
  // The burst's initial hit, which Constellation 4's bonus reads
  const burstInitialHit: KitHit = {
    element: Element.Cryo,
    gauge: 2,
    hitArea: createTargetedHitArea(SKILL_TARGETING_AREA, BURST_RADIUS),
    hitmarkSeconds: BURST_HITMARK_FRAMES / 60,
    isBlunt: true,
    poiseDamage: BURST_POISE_DAMAGE,
    talentMultiplier: burstMultiplier(0),
  };
  const normalAttacks: KitAction[] = NORMAL_ATTACKS.map(
    ({ cancelFrames, hitArea, hitmarkFrames, index, poiseDamage }) => ({
      hits: hitmarkFrames.map((hitmark) => ({
        hitArea,
        hitmarkSeconds: hitmark / 60,
        onStrike: ({ combatant, kitEffectState }) =>
          gainLightfallStack(kitEffectState, combatant, explodeBase, explodePerStack),
        poiseDamage,
        talentMultiplier: attackMultiplier(index),
      })),
      seconds: cancelFrames / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    }),
  );
  return {
    burstCooldownSeconds: burstMultiplier(4),
    burstEnergyCost: burstMultiplier(5),
    chargedAttack: {
      hits: [
        {
          hitArea: createFanReach(360, CHARGED_ATTACK_SPIN_RADIUS),
          hitmarkSeconds: CHARGED_ATTACK_SPIN_HITMARK_SECONDS,
          poiseDamage: 0,
          talentMultiplier: attackMultiplier(5),
        },
        {
          hitArea: createFanReach(360, CHARGED_ATTACK_FINAL_RADIUS),
          hitmarkSeconds: CHARGED_ATTACK_FINAL_HITMARK_SECONDS,
          poiseDamage: 0,
          talentMultiplier: attackMultiplier(6),
        },
      ],
      seconds: CHARGED_ATTACK_SECONDS,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    chargedAttackStamina: attackMultiplier(7),
    elementalBurst: {
      hits: [burstInitialHit],
      onStart: ({ body, combatant, kitEffectState }) => {
        const { characterId } = combatant;
        // A fresh cast takes the Sword's stacks from zero, as the cast resets them, Constellation 6 starting it with five
        kitEffectState.effects = kitEffectState.effects.filter(
          (effect) =>
            !(
              effect.kind === "status" &&
              effect.characterId === characterId &&
              LIGHTFALL_STACK_IDS.includes(effect.id)
            ) && !(effect.kind === "summon" && effect.id === LIGHTFALL_SUMMON_ID),
        );
        // Ascension 4 gains a Grimheart stack, which gcsim keeps only while the Grimheart it adds to is up
        if (combatant.ascension >= 4 && countGrimheartStacks(kitEffectState.effects, characterId) > 0)
          gainGrimheartStack(kitEffectState, combatant, grimheartSeconds);
        const startingStacks = combatant.constellationCount >= 6 ? CONSTELLATION_6_STARTING_STACKS : 0;
        for (const id of LIGHTFALL_STACK_IDS.slice(0, startingStacks))
          addKitEffect(kitEffectState, { characterId, id, kind: "status", secondsRemaining: Infinity });
        const lightfall: KitSummon = {
          ...createKitSummon(body, combatant, [
            createLightfallExplosion(explodeBase, explodePerStack, startingStacks, LIGHTFALL_EXPLOSION_FRAMES / 60),
          ]),
          id: LIGHTFALL_SUMMON_ID,
        };
        addKitEffect(kitEffectState, lightfall);
      },
      seconds: BURST_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    elementalSkill: {
      hits: [
        {
          element: Element.Cryo,
          gauge: 1,
          hitArea: createTargetedHitArea(SKILL_TARGETING_AREA, PRESS_RADIUS),
          hitmarkSeconds: PRESS_HITMARK_FRAMES / 60,
          isBlunt: true,
          onStrike: ({ combatant, kitEffectState }) => {
            if (checkHasStatus(kitEffectState.effects, combatant.characterId, GRIMHEART_ICD_ID)) return;
            addKitEffect(kitEffectState, {
              characterId: combatant.characterId,
              id: GRIMHEART_ICD_ID,
              kind: "status",
              secondsRemaining: GRIMHEART_ICD_SECONDS,
            });
            gainGrimheartStack(kitEffectState, combatant, grimheartSeconds);
            gainLightfallStack(kitEffectState, combatant, explodeBase, explodePerStack);
          },
          poiseDamage: PRESS_POISE_DAMAGE,
          talentMultiplier: skillMultiplier(0),
        },
      ],
      seconds: PRESS_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    elementalSkillHolds: [
      {
        action: {
          hits: [
            {
              element: Element.Cryo,
              gauge: 1,
              hitArea: createTargetedHitArea(SKILL_TARGETING_AREA, HOLD_RADIUS),
              hitmarkSeconds: HOLD_HITMARK_FRAMES / 60,
              isBlunt: true,
              onStrike: ({ combatant, kitEffectState }) =>
                gainLightfallStack(kitEffectState, combatant, explodeBase, explodePerStack),
              poiseDamage: HOLD_POISE_DAMAGE,
              talentMultiplier: skillMultiplier(1),
            },
          ],
          onStart: ({ body, combatant, kitEffectState }) => {
            const { characterId } = combatant;
            const stacks = countGrimheartStacks(kitEffectState.effects, characterId);
            clearGrimheartStacks(kitEffectState, characterId);
            if (stacks === 0) return;
            // Each stack sets off one Icewhirl, each shredding the RES of the enemy it strikes for the seconds per stack
            const shred = (): EnemyStatus => ({
              damageTakenBonus: 0,
              id: ICEWHIRL_SHRED_ID,
              physicalResistanceReduction: shredPhysicalResistance,
              resistanceReduction: { [Element.Cryo]: shredResistance },
              secondsRemaining: shredSecondsPerStack * stacks,
            });
            const icewhirls: KitHit[] = ICEWHIRL_HITMARK_FRAMES.slice(0, stacks).map((hitmark) => ({
              element: Element.Cryo,
              enemyStatus: shred,
              gauge: 1,
              hitArea: createTargetedHitArea(SKILL_TARGETING_AREA, ICEWHIRL_RADIUS),
              hitmarkSeconds: hitmark / 60,
              onStrike: ({ combatant: striker, kitEffectState: strikeEffectState }) =>
                gainLightfallStack(strikeEffectState, striker, explodeBase, explodePerStack),
              poiseDamage: 0,
              talentMultiplier: skillMultiplier(2),
            }));
            addKitEffect(kitEffectState, createKitSummon(body, combatant, icewhirls));
            // Two stacks raise a Shattered Lightfall Sword at Ascension 1, which explodes on its own once the hold has begun
            if (stacks === GRIMHEART_MAX_STACKS && combatant.ascension >= 1)
              addKitEffect(
                kitEffectState,
                createKitSummon(body, combatant, [
                  {
                    hitArea: createTargetedHitArea(SKILL_TARGETING_AREA, SHATTERED_LIGHTFALL_RADIUS),
                    hitmarkSeconds: SHATTERED_LIGHTFALL_HITMARK_FRAMES / 60,
                    isBlunt: true,
                    poiseDamage: SHATTERED_LIGHTFALL_POISE_DAMAGE,
                    talentMultiplier: explodeBase * SHATTERED_LIGHTFALL_MULTIPLIER_FRACTION,
                  },
                ]),
              );
            // Constellation 1's bonus lasts six seconds plus six for each stack consumed
            if (combatant.constellationCount >= 1)
              addKitEffect(kitEffectState, {
                amount: CONSTELLATION_1_PHYSICAL_BONUS,
                attribute: Attribute.PhysicalDamageBonus,
                characterId,
                kind: "buff",
                secondsRemaining: CONSTELLATION_1_BASE_SECONDS + CONSTELLATION_1_SECONDS_PER_STACK * stacks,
                source: "eula-c1",
              });
          },
          seconds: HOLD_FRAMES / 60,
          targetingArea: SKILL_TARGETING_AREA,
        },
        cooldownSeconds: skillMultiplier(7),
        minimumHeldSeconds: HOLD_MINIMUM_HELD_SECONDS,
      },
    ],
    getStrikeDamageBonus: ({ combatant, hit }, enemy) =>
      combatant.constellationCount >= 4 &&
      hit === burstInitialHit &&
      enemy.health / enemy.maxHealth < CONSTELLATION_4_HEALTH_SHARE
        ? CONSTELLATION_4_DAMAGE_BONUS
        : 0,
    highPlunge: {
      hits: [
        {
          hitArea: createFanReach(360, HIGH_PLUNGE_RADIUS),
          hitmarkSeconds: HIGH_PLUNGE_HITMARK_FRAMES / 60,
          poiseDamage: HIGH_PLUNGE_POISE_DAMAGE,
          talentMultiplier: attackMultiplier(11),
        },
      ],
      seconds: HIGH_PLUNGE_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    lowPlunge: {
      hits: [
        {
          hitArea: createFanReach(360, LOW_PLUNGE_RADIUS),
          hitmarkSeconds: LOW_PLUNGE_HITMARK_FRAMES / 60,
          poiseDamage: LOW_PLUNGE_POISE_DAMAGE,
          talentMultiplier: attackMultiplier(10),
        },
      ],
      seconds: LOW_PLUNGE_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    normalAttacks,
    onKitEvent: (event, { combatant, kitEffectState }) => {
      if (event.kind === KitEventKind.CharacterSwapped)
        triggerLightfall(kitEffectState, combatant.characterId, explodeBase, explodePerStack);
    },
    plungeCollision: {
      hitArea: createFanReach(360, PLUNGE_COLLISION_RADIUS),
      hitmarkSeconds: 0,
      poiseDamage: PLUNGE_COLLISION_POISE_DAMAGE,
      talentMultiplier: attackMultiplier(9),
    },
    skillCooldownSeconds: skillMultiplier(6),
  };
};
