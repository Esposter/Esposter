import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitHit } from "#src/models/kit/KitHit";

import { AttackTag } from "#src/models/combat/AttackTag";
import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { PLUNGE_HIT_AREAS, SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA } from "#src/services/kit/constants";
import { createBoxReach } from "#src/services/kit/createBoxReach";
import { createTargetedHitArea } from "#src/services/kit/createTargetedHitArea";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { createKitSummon } from "#src/services/kit/effects/createKitSummon";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";
import { takeOne } from "@esposter/shared";

// Kinich's proud skill groups, read at his talent level. The attack group holds his three strikes at 0 to 2, the charged
// Attack at 3 and its stamina at 4, and the plunges' collision, low and high at 5, 6 and 7. The skill group holds Loop
// Shot at 0, Scalespiker Cannon at 1 and the skill's cooldown at 2. The burst group holds Hail to the Almighty Dragonlord's
// Hit at 0, Dragon Breath at 1, its duration at 2, its cooldown at 3 and its energy cost at 4
const KINICH_ATTACK_GROUP_ID = 10131;
const KINICH_SKILL_GROUP_ID = 10132;
const KINICH_BURST_GROUP_ID = 10139;

export const KINICH_CHARACTER_ID = 10_000_101;

// Measured: gcsim (MIT) kinich/attack.go, each strike's hitmark and animation, and its box centred on the body, offset
// Along the body's line by -0.7, -1 and 0 metres: 3 by 3, 2 by 3.9 and 2.2 by 4.3 metres. Each strike is blunt with the
// Poise gcsim gives it
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/kinich/attack.go
const NORMAL_ATTACKS: {
  frames: number;
  groupIndex: number;
  hitArea: AttackArea;
  hitmarkFrames: number;
  poiseDamage: number;
}[] = [
  { frames: 47, groupIndex: 0, hitArea: createBoxReach(-0.7, 3, 3), hitmarkFrames: 21, poiseDamage: 131 },
  { frames: 48, groupIndex: 1, hitArea: createBoxReach(-1, 2, 3.9), hitmarkFrames: 22, poiseDamage: 117 },
  { frames: 79, groupIndex: 2, hitArea: createBoxReach(0, 2.2, 4.3), hitmarkFrames: 44, poiseDamage: 160 },
];
// Measured: gcsim (MIT) kinich/charge.go, three thrusts at 71, 95 and 119 frames, each a box of 3 by 5 metres centred
// 0.45 metres ahead of the body, of 40 poise each, with the animation at 87 frames
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/kinich/charge.go
const CHARGED_ATTACK_HITMARK_FRAMES = [71, 95, 119];
const CHARGED_ATTACK_HIT_AREA = createBoxReach(0.45, 3, 5);
const CHARGED_ATTACK_FRAMES = 87;
const CHARGED_ATTACK_POISE_DAMAGE = 40;
// Provisional: gcsim has no plunge file for Kinich, so his plunges' reach is the kit constants' borrowed from gcsim's
// Bennett plunge, each plunge hits as its action starts, and its seconds and poise are the wiki's standard, not measured
const PLUNGE_SECONDS = 0.4;
const LOW_PLUNGE_POISE_DAMAGE = 100;
const HIGH_PLUNGE_POISE_DAMAGE = 150;
const PLUNGE_COLLISION_POISE_DAMAGE = 25;
// Measured: gcsim (MIT) kinich/skill.go, the press's animation of 42 frames
const SKILL_FRAMES = 42;
// Measured: gcsim (MIT) kinich/burst.go, the burst's hit as a circle of radius 4 on the primary target at 161 frames,
// Its animation at 126 frames
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/kinich/burst.go
const BURST_HITMARK_FRAMES = 161;
const BURST_FRAMES = 126;
const BURST_HIT_AREA = createTargetedHitArea(SKILL_TARGETING_AREA, 4);
// Measured: gcsim (MIT) kinich/burst.go, the Ajaw's Dragon Breath: six lasers, the first 253 frames after the burst is cast
// And each next 145 or 150 frames on, the two drawn evenly, each a box of 1 by 10 metres on the primary target, priced as the
// Circle to its far corner, of 1U Dendro under the burst's internal cooldown and no poise
const DRAGON_BREATH_FIRST_HITMARK_FRAMES = 253;
const DRAGON_BREATH_INTERVAL_FRAMES = [145, 150];
const DRAGON_BREATH_COUNT = 6;
const DRAGON_BREATH_HIT_AREA = createTargetedHitArea(SKILL_TARGETING_AREA, Math.hypot(0.5, 5));

// Kinich's first kit, at talent level 1: his three strikes, a charged attack, a collision and two plunges, and the burst's
// Hit with the Ajaw's lasers. His multipliers are read from his proud skill groups
export const createKinichKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, KINICH_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
  const burstMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, KINICH_BURST_GROUP_ID, TALENT_START_LEVEL, index);
  // The Ajaw's lasers, each landing the interval drawn for it after the one before
  const createDragonBreathHits = (random: () => number): KitHit[] => {
    let hitmarkFrames = DRAGON_BREATH_FIRST_HITMARK_FRAMES;
    return Array.from({ length: DRAGON_BREATH_COUNT }, (_value, index): KitHit => {
      if (index > 0)
        hitmarkFrames += takeOne(
          DRAGON_BREATH_INTERVAL_FRAMES,
          Math.floor(random() * DRAGON_BREATH_INTERVAL_FRAMES.length),
        );
      return {
        element: Element.Dendro,
        gauge: 1,
        hitArea: DRAGON_BREATH_HIT_AREA,
        hitmarkSeconds: hitmarkFrames / 60,
        internalCooldownTag: InternalCooldownTag.ElementalBurst,
        poiseDamage: 0,
        talentMultiplier: burstMultiplier(1),
      };
    });
  };
  const normalAttacks = NORMAL_ATTACKS.map(
    ({ frames, groupIndex, hitArea, hitmarkFrames, poiseDamage }): KitAction => ({
      hits: [
        {
          hitArea,
          hitmarkSeconds: hitmarkFrames / 60,
          internalCooldownTag: InternalCooldownTag.NormalAttack,
          isBlunt: true,
          poiseDamage,
          talentMultiplier: attackMultiplier(groupIndex),
        },
      ],
      seconds: frames / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    }),
  );
  const chargedAttackHits = CHARGED_ATTACK_HITMARK_FRAMES.map((hitmarkFrames): KitHit => ({
    hitArea: CHARGED_ATTACK_HIT_AREA,
    hitmarkSeconds: hitmarkFrames / 60,
    internalCooldownTag: InternalCooldownTag.NormalAttack,
    isBlunt: true,
    poiseDamage: CHARGED_ATTACK_POISE_DAMAGE,
    talentMultiplier: attackMultiplier(3),
  }));
  // Provisional: each plunge hits as its action starts, its seconds the wiki's standard and no source's
  const createPlunge = (hitArea: AttackArea, poiseDamage: number, groupIndex: number): KitAction => ({
    hits: [{ hitArea, hitmarkSeconds: 0, isBlunt: true, poiseDamage, talentMultiplier: attackMultiplier(groupIndex) }],
    seconds: PLUNGE_SECONDS,
    targetingArea: STRIKE_TARGETING_AREA,
  });
  return {
    burstCooldownSeconds: burstMultiplier(3),
    burstEnergyCost: burstMultiplier(4),
    chargedAttack: {
      hits: chargedAttackHits,
      seconds: CHARGED_ATTACK_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    chargedAttackStamina: attackMultiplier(4),
    // The burst calls the Ajaw as it is cast, a summon at the body whose lasers' intervals are drawn from the world's seeded
    // Random source then, as gcsim draws each as the laser before it fires
    elementalBurst: {
      hits: [
        {
          element: Element.Dendro,
          gauge: 1,
          hitArea: BURST_HIT_AREA,
          hitmarkSeconds: BURST_HITMARK_FRAMES / 60,
          internalCooldownTag: InternalCooldownTag.ElementalBurst,
          poiseDamage: 0,
          talentMultiplier: burstMultiplier(0),
        },
      ],
      onStart: ({ body, combatant, kitEffectState, random }) =>
        addKitEffect(kitEffectState, {
          ...createKitSummon(body, combatant, createDragonBreathHits(random)),
          attackTag: AttackTag.ElementalBurst,
        }),
      seconds: BURST_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    // Not built: the Nightsoul Blessing the press enters, with its Scalespiker Cannon and Loop Shots and its Nightsoul
    // Points. The blessing is a stance, which waits on the stance's attackTags hook, so the press deals nothing until then
    elementalSkill: { hits: [], seconds: SKILL_FRAMES / 60, targetingArea: SKILL_TARGETING_AREA },
    highPlunge: createPlunge(PLUNGE_HIT_AREAS.high, HIGH_PLUNGE_POISE_DAMAGE, 7),
    lowPlunge: createPlunge(PLUNGE_HIT_AREAS.low, LOW_PLUNGE_POISE_DAMAGE, 6),
    normalAttacks,
    plungeCollision: {
      hitArea: PLUNGE_HIT_AREAS.collision,
      hitmarkSeconds: 0,
      poiseDamage: PLUNGE_COLLISION_POISE_DAMAGE,
      talentMultiplier: attackMultiplier(5),
    },
    skillCooldownSeconds: getTalentMultiplier(talentMultiplierMap, KINICH_SKILL_GROUP_ID, TALENT_START_LEVEL, 2),
  };
};
