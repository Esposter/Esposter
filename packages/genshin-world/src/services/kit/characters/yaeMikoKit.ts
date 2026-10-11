import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { PLUNGE_HIT_AREAS, SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA } from "#src/services/kit/constants";
import { createBoxReach } from "#src/services/kit/createBoxReach";
import { createCircleReach } from "#src/services/kit/createCircleReach";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Yae Miko's proud skill groups, read at her talent level. The attack group holds the string's three hits at 0 to 2, the
// Charged Attack at 3 and its stamina at 4, and the plunges' collision, low and high at 5, 6 and 7. The skill group holds
// Sesshou Sakura's strike at its totem count's level at 0 to 3, the duration at 4 and the skill's cooldown at 5. The burst
// Group holds Great Secret Art: Tenko Kenshin's hit at 0, each Tenko Thunderbolt at 1, its cooldown at 2 and its energy
// Cost at 3
const YAE_MIKO_ATTACK_GROUP_ID = 5831;
const YAE_MIKO_SKILL_GROUP_ID = 5832;
const YAE_MIKO_BURST_GROUP_ID = 5839;

const SESSHOU_SAKURA_ID = "yae-sesshou-sakura";

// Measured: gcsim v2.47.2 (MIT) yaemiko/kitsune.go, the totems stand at most three, and a fourth pops the oldest
const MAXIMUM_TOTEMS = 3;
// Measured: gcsim v2.47.2 (MIT) yaemiko/kitsune.go, a totem lasts 900 frames, its first strike lands 120 frames after the
// Press and then every 176 frames, its strike a circle of radius 0.5 round the totem
const TOTEM_SECONDS = 900 / 60;
const TOTEM_FIRST_STRIKE_FRAMES = 120;
const TOTEM_STRIKE_INTERVAL_FRAMES = 176;
const TOTEM_STRIKE_RADIUS = 0.5;
// Measured: gcsim v2.47.2 (MIT) yaemiko/skill.go, Sesshou Sakura is cast at 34 frames of a 37-frame animation, and it
// Stands from then on
const SKILL_SPAWN_FRAMES = 34;
const SKILL_ANIMATION_FRAMES = 37;

// Measured: gcsim v2.47.2 (MIT) yaemiko/attack.go, the string's three hitmarks at 14, 22 and 33 frames, each cancelling
// At 28, 40 and 79 frames, and its box of width 2 and length 8 round the body
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/yaemiko/attack.go
const NORMAL_ATTACK_FRAMES = [
  { cancelFrames: 28, hitmarkFrames: 14 },
  { cancelFrames: 40, hitmarkFrames: 22 },
  { cancelFrames: 79, hitmarkFrames: 33 },
] as const;
const NORMAL_ATTACK_HIT_AREA = createBoxReach(0, 2, 8);

// Measured: gcsim v2.47.2 (MIT) yaemiko/charge.go, the charged attack's box of width 2 and length 2 at its hitmark of 90
// Frames less a windup of 14, and an animation of 96 frames less the same windup
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/yaemiko/charge.go
const CHARGED_ATTACK_HIT_AREA = createBoxReach(0, 2, 2);
const CHARGED_ATTACK_HITMARK_FRAMES = 76;
const CHARGED_ATTACK_ANIMATION_FRAMES = 82;

// Measured: gcsim v2.47.2 (MIT) yaemiko/burst.go, Tenko Kenshin's circle of radius 7 at 100 frames of a 114-frame
// Animation, and each Tenko Thunderbolt the same circle at 154 frames, then every 24 frames for each totem standing
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/yaemiko/burst.go
const BURST_HIT_AREA = createCircleReach(0, 7);
const BURST_HITMARK_FRAMES = 100;
const BURST_ANIMATION_FRAMES = 114;
const THUNDERBOLT_FIRST_HITMARK_FRAMES = 154;
const THUNDERBOLT_INTERVAL_FRAMES = 24;

// Provisional: gcsim gives Yae Miko's strikes, charged attack, totems, burst and plunges no poise, so each deals none until
// The wiki's Advanced properties are measured
const NO_POISE_DAMAGE = 0;
// Provisional: the plunges' frames are not fetched from gcsim, so they are provisional until the Mac measures them
const PLUNGE_SECONDS = 0.4;

const checkIsStandingTotem = (effect: KitEffect, characterId: number): effect is KitSummon =>
  effect.kind === "summon" && effect.id === SESSHOU_SAKURA_ID && effect.combatant.characterId === characterId;

export const YAE_MIKO_CHARACTER_ID = 10_000_058;

// Yae Miko's first kit, at talent level 1: a three-hit string, a charged attack, a collision and two plunges, Sesshou
// Sakura's totems, which strike on their own schedule at a level by how many stand, and Great Secret Art: Tenko Kenshin,
// Which destroys the totems for a Tenko Thunderbolt each. Her multipliers are read from her proud skill groups. Her
// Passives and constellations are not built, as the kit's events reach none of them yet
export const createYaeMikoKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, YAE_MIKO_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
  const skillTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, YAE_MIKO_SKILL_GROUP_ID, TALENT_START_LEVEL, index);
  const burstTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, YAE_MIKO_BURST_GROUP_ID, TALENT_START_LEVEL, index);

  const normalAttacks: KitAction[] = NORMAL_ATTACK_FRAMES.map(({ cancelFrames, hitmarkFrames }, index) => ({
    hits: [
      {
        hitArea: NORMAL_ATTACK_HIT_AREA,
        hitmarkSeconds: hitmarkFrames / 60,
        poiseDamage: NO_POISE_DAMAGE,
        talentMultiplier: attackTalentMultiplier(index),
      },
    ],
    seconds: cancelFrames / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  }));

  const chargedAttack: KitAction = {
    hits: [
      {
        hitArea: CHARGED_ATTACK_HIT_AREA,
        hitmarkSeconds: CHARGED_ATTACK_HITMARK_FRAMES / 60,
        poiseDamage: NO_POISE_DAMAGE,
        talentMultiplier: attackTalentMultiplier(3),
      },
    ],
    seconds: CHARGED_ATTACK_ANIMATION_FRAMES / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  };

  // Each totem's strikes are fixed when it is cast, so its multiplier is the one its level gives then, as the level is
  // Read from the totems standing as it is cast
  const createTotemStrikes = (level: number): KitHit[] => {
    const talentMultiplier = skillTalentMultiplier(level - 1);
    const hits: KitHit[] = [];
    for (
      let strikeFrames = TOTEM_FIRST_STRIKE_FRAMES;
      strikeFrames < TOTEM_SECONDS * 60;
      strikeFrames += TOTEM_STRIKE_INTERVAL_FRAMES
    )
      hits.push({
        hitArea: createCircleReach(0, TOTEM_STRIKE_RADIUS),
        hitmarkSeconds: strikeFrames / 60,
        poiseDamage: NO_POISE_DAMAGE,
        talentMultiplier,
      });
    return hits;
  };

  const elementalSkill: KitAction = {
    hits: [],
    onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
      const standingTotems = kitEffectState.effects.filter(
        (effect): effect is KitSummon =>
          checkIsStandingTotem(effect, combatant.characterId) && effect.secondsRemaining > 0,
      );
      // A fourth totem pops the oldest, the effects being kept in the order they were added
      for (const oldestTotem of standingTotems.slice(0, Math.max(0, standingTotems.length - MAXIMUM_TOTEMS + 1)))
        oldestTotem.secondsRemaining = 0;
      const level = Math.min(standingTotems.length + 1, MAXIMUM_TOTEMS);
      castKitSummon(kitEffectState, body, combatant, createTotemStrikes(level), {
        id: SESSHOU_SAKURA_ID,
        secondsRemaining: TOTEM_SECONDS,
        spawnSeconds: SKILL_SPAWN_FRAMES / 60,
      });
    },
    seconds: SKILL_ANIMATION_FRAMES / 60,
    targetingArea: SKILL_TARGETING_AREA,
  };

  const tenkoKenshin: KitAction = {
    hits: [
      {
        hitArea: BURST_HIT_AREA,
        hitmarkSeconds: BURST_HITMARK_FRAMES / 60,
        poiseDamage: NO_POISE_DAMAGE,
        talentMultiplier: burstTalentMultiplier(0),
      },
    ],
    // Destroys every totem standing, each one a Tenko Thunderbolt that strikes from the burst's own clock
    onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
      const standingTotems = kitEffectState.effects.filter(
        (effect): effect is KitSummon =>
          checkIsStandingTotem(effect, combatant.characterId) && effect.secondsRemaining > 0,
      );
      for (const totem of standingTotems) totem.secondsRemaining = 0;
      if (standingTotems.length === 0) return;
      const thunderbolts: KitHit[] = standingTotems.map((_value, index) => ({
        hitArea: BURST_HIT_AREA,
        hitmarkSeconds: (THUNDERBOLT_FIRST_HITMARK_FRAMES + index * THUNDERBOLT_INTERVAL_FRAMES) / 60,
        poiseDamage: NO_POISE_DAMAGE,
        talentMultiplier: burstTalentMultiplier(1),
      }));
      castKitSummon(kitEffectState, body, combatant, thunderbolts);
    },
    seconds: BURST_ANIMATION_FRAMES / 60,
    targetingArea: SKILL_TARGETING_AREA,
  };

  return {
    burstCooldownSeconds: burstTalentMultiplier(2),
    burstEnergyCost: burstTalentMultiplier(3),
    chargedAttack,
    chargedAttackStamina: attackTalentMultiplier(4),
    elementalBurst: tenkoKenshin,
    elementalSkill,
    highPlunge: {
      hits: [
        {
          hitArea: PLUNGE_HIT_AREAS.high,
          hitmarkSeconds: 0,
          poiseDamage: NO_POISE_DAMAGE,
          talentMultiplier: attackTalentMultiplier(7),
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
          poiseDamage: NO_POISE_DAMAGE,
          talentMultiplier: attackTalentMultiplier(6),
        },
      ],
      seconds: PLUNGE_SECONDS,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    normalAttacks,
    plungeCollision: {
      hitArea: PLUNGE_HIT_AREAS.collision,
      hitmarkSeconds: 0,
      poiseDamage: NO_POISE_DAMAGE,
      talentMultiplier: attackTalentMultiplier(5),
    },
    skillCooldownSeconds: skillTalentMultiplier(5),
  };
};
