import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitHit } from "#src/models/kit/KitHit";

import { Attribute } from "#src/models/character/Attribute";
import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA } from "#src/services/kit/constants";
import { createBoxReach } from "#src/services/kit/createBoxReach";
import { createFanReach } from "#src/services/kit/createFanReach";
import { createTargetedHitArea } from "#src/services/kit/createTargetedHitArea";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Itto's proud skill groups, read at his talent level, as the game's tables give them and gcsim v2.47.2 (MIT)
// zz_aratakiitto.dm.go labels them. The attack group holds the four strikes at 0 to 3, the Saichimonji Slash at 4, the
// Arataki Kesagiri combo's and final slashes at 5 and 6, the plunges' collision at 8, and the low and high plunges at 9
// And 10. The skill group holds Masatsu Zetsugi's damage at 0 and its cooldown at 4. The burst group holds the ATK bonus
// Per DEF at 1, its cooldown at 4 and its energy cost at 5
const ITTO_ATTACK_GROUP_ID = 5731;
const ITTO_SKILL_GROUP_ID = 5732;
const ITTO_BURST_GROUP_ID = 5739;
const ITTO_SKILL_COOLDOWN_INDEX = 4;
const ITTO_BURST_DEFENSE_BONUS_INDEX = 1;
const ITTO_BURST_COOLDOWN_INDEX = 4;
const ITTO_BURST_ENERGY_COST_INDEX = 5;

// Measured: gcsim v2.47.2 (MIT) itto/attack.go, each strike's hitmark, its cancel to a charged attack and its circle or box,
// Priced from the body as the other kits' are: a circle as its offset plus its radius, and the box to its far corner. Its
// Poise is gcsim's too. Under the burst the strikes reach further, which the converted reaches below give
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/itto/attack.go
const NORMAL_ATTACK_STRIKES = [
  {
    cancelFrames: 41,
    convertedHitArea: createFanReach(360, 0.8 + 3.5),
    hitArea: createFanReach(360, 0.8 + 2.5),
    hitmarkFrames: 23,
    index: 0,
    poiseDamage: 82.9,
  },
  {
    cancelFrames: 51,
    convertedHitArea: createFanReach(360, 0.8 + 3.5),
    hitArea: createFanReach(360, 0.8 + 2.5),
    hitmarkFrames: 25,
    index: 1,
    poiseDamage: 77.9,
  },
  {
    cancelFrames: 57,
    convertedHitArea: createFanReach(360, 0.8 + 3.5),
    hitArea: createFanReach(360, 0.85 + 2.5),
    hitmarkFrames: 16,
    index: 2,
    poiseDamage: 98.3,
  },
  {
    cancelFrames: 83,
    convertedHitArea: createBoxReach(-1.7, 3.8, 8),
    hitArea: createBoxReach(-1.5, 3.2, 6),
    hitmarkFrames: 48,
    index: 3,
    poiseDamage: 124.5,
  },
];

// Measured: gcsim v2.47.2 (MIT) itto/charge.go, the Saichimonji Slash, the charged attack with no Superlative Superstrength,
// As a circle of radius 3 round the body at 89 frames, its animation 131, and 120 poise. Under the burst it is a circle of 4
// Https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/itto/charge.go
const SAICHIMONJI_HITMARK_FRAMES = 89;
const SAICHIMONJI_FRAMES = 131;
const SAICHIMONJI_HIT_AREA = createFanReach(360, 3);
const SAICHIMONJI_CONVERTED_HIT_AREA = createFanReach(360, 4);
const SAICHIMONJI_POISE_DAMAGE = 120;
// Measured: gcsim v2.47.2 (MIT) itto/charge.go, the charged attack's stamina as ActionStam gives it, 20 with no stacks, which
// The attack group's index 7 gives too
const CHARGED_ATTACK_STAMINA_INDEX = 7;

// Measured: gcsim v2.47.2 (MIT) itto/plunge.go, the collision at 31 frames as a circle of radius 1 round the body, and the
// Low and high plunges at 37 and 40 frames, circles of radius 3 and 5 with their animations of 83 and 87 frames, and 4 and 6
// Under the burst. gcsim gives the collision no poise and the plunges 150 and 200
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/itto/plunge.go
const COLLISION_HITMARK_FRAMES = 31;
const LOW_PLUNGE_HITMARK_FRAMES = 37;
const LOW_PLUNGE_FRAMES = 83;
const HIGH_PLUNGE_HITMARK_FRAMES = 40;
const HIGH_PLUNGE_FRAMES = 87;
const COLLISION_POISE_DAMAGE = 0;
const LOW_PLUNGE_POISE_DAMAGE = 150;
const HIGH_PLUNGE_POISE_DAMAGE = 200;

// Measured: gcsim v2.47.2 (MIT) itto/skill.go, Masatsu Zetsugi: Akaushi Burst's hit at 14 frames, a circle of radius 3.5 on
// The primary target, with its animation of 42 frames and 250 poise, blunt. Ushi is the skill's other half and is not built
// Https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/itto/skill.go
const SKILL_HITMARK_FRAMES = 14;
const SKILL_FRAMES = 42;
const SKILL_HIT_AREA = createTargetedHitArea(SKILL_TARGETING_AREA, 3.5);
const SKILL_POISE_DAMAGE = 250;
// Provisional: no source gives the skill's gauge in the files fetched, so it reads 2U, as the other Geo skills do, until the
// Mac measures it
const SKILL_GAUGE = 2;

// Measured: gcsim v2.47.2 (MIT) itto/burst.go, Royal Descent's animation of 91 frames, its ATK bonus per DEF, its 0.1 Normal
// ATK SPD and its Geo conversion, all for 795 frames: gcsim's 660, 90 and 45, which barely cover the basic combo
const BURST_FRAMES = 91;
const BURST_SECONDS = (660 + 90 + 45) / 60;
const BURST_NORMAL_ATTACK_SPEED_BONUS = 0.1;

export const ITTO_CHARACTER_ID = 10_000_057;

// Itto's first kit, at talent level 1: four strikes, the Saichimonji Slash, a collision and two plunges, Masatsu Zetsugi's
// Hit, and Royal Descent's Geo conversion with its ATK bonus per DEF and Normal ATK SPD. His multipliers are read from his
// Proud skill groups. Superlative Superstrength, Ushi and his passives and constellations are not built, so the charged
// Attack prices the Saichimonji Slash throughout
export const createIttoKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, ITTO_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
  const skillTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, ITTO_SKILL_GROUP_ID, TALENT_START_LEVEL, index);
  const burstTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, ITTO_BURST_GROUP_ID, TALENT_START_LEVEL, index);

  // Each strike is one hit at its hitmark, a blunt slash priced under the Normal Attack internal cooldown
  const normalAttacks: KitAction[] = NORMAL_ATTACK_STRIKES.map(
    ({ cancelFrames, convertedHitArea, hitArea, hitmarkFrames, index, poiseDamage }): KitAction => ({
      hits: [
        {
          convertedHitArea,
          convertedPoiseDamage: poiseDamage,
          hitArea,
          hitmarkSeconds: hitmarkFrames / 60,
          internalCooldownTag: InternalCooldownTag.NormalAttack,
          isBlunt: true,
          poiseDamage,
          talentMultiplier: attackTalentMultiplier(index),
        },
      ],
      seconds: cancelFrames / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    }),
  );

  const saichimonjiHit: KitHit = {
    convertedHitArea: SAICHIMONJI_CONVERTED_HIT_AREA,
    convertedPoiseDamage: SAICHIMONJI_POISE_DAMAGE,
    hitArea: SAICHIMONJI_HIT_AREA,
    hitmarkSeconds: SAICHIMONJI_HITMARK_FRAMES / 60,
    internalCooldownTag: InternalCooldownTag.ChargedAttack,
    isBlunt: true,
    poiseDamage: SAICHIMONJI_POISE_DAMAGE,
    talentMultiplier: attackTalentMultiplier(4),
  };

  return {
    burstCooldownSeconds: burstTalentMultiplier(ITTO_BURST_COOLDOWN_INDEX),
    burstEnergyCost: burstTalentMultiplier(ITTO_BURST_ENERGY_COST_INDEX),
    chargedAttack: { hits: [saichimonjiHit], seconds: SAICHIMONJI_FRAMES / 60, targetingArea: STRIKE_TARGETING_AREA },
    chargedAttackStamina: attackTalentMultiplier(CHARGED_ATTACK_STAMINA_INDEX),
    // Royal Descent deals no damage. It adds Itto's ATK per DEF to his attacks, and infuses them with Geo as they are
    // Converted, with the burst's Normal ATK SPD, for its seconds from the cast
    elementalBurst: {
      hits: [],
      onStart: ({ combatant, kitEffectState }) => {
        addKitEffect(kitEffectState, {
          amount: burstTalentMultiplier(ITTO_BURST_DEFENSE_BONUS_INDEX) * combatant.attributes.defense,
          attribute: Attribute.Attack,
          characterId: combatant.characterId,
          kind: "buff",
          secondsRemaining: BURST_SECONDS,
        });
        addKitEffect(kitEffectState, {
          characterId: combatant.characterId,
          element: Element.Geo,
          isConverted: true,
          kind: "infusion",
          normalAttackSpeedBonus: BURST_NORMAL_ATTACK_SPEED_BONUS,
          secondsRemaining: BURST_SECONDS,
        });
      },
      seconds: BURST_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    elementalSkill: {
      hits: [
        {
          element: Element.Geo,
          gauge: SKILL_GAUGE,
          hitArea: SKILL_HIT_AREA,
          hitmarkSeconds: SKILL_HITMARK_FRAMES / 60,
          internalCooldownTag: InternalCooldownTag.ElementalSkill,
          isBlunt: true,
          poiseDamage: SKILL_POISE_DAMAGE,
          talentMultiplier: skillTalentMultiplier(0),
        },
      ],
      seconds: SKILL_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    highPlunge: {
      hits: [
        {
          convertedHitArea: createFanReach(360, 6),
          convertedPoiseDamage: HIGH_PLUNGE_POISE_DAMAGE,
          hitArea: createFanReach(360, 5),
          hitmarkSeconds: HIGH_PLUNGE_HITMARK_FRAMES / 60,
          poiseDamage: HIGH_PLUNGE_POISE_DAMAGE,
          talentMultiplier: attackTalentMultiplier(10),
        },
      ],
      seconds: HIGH_PLUNGE_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    lowPlunge: {
      hits: [
        {
          convertedHitArea: createFanReach(360, 4),
          convertedPoiseDamage: LOW_PLUNGE_POISE_DAMAGE,
          hitArea: createFanReach(360, 3),
          hitmarkSeconds: LOW_PLUNGE_HITMARK_FRAMES / 60,
          poiseDamage: LOW_PLUNGE_POISE_DAMAGE,
          talentMultiplier: attackTalentMultiplier(9),
        },
      ],
      seconds: LOW_PLUNGE_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    normalAttacks,
    plungeCollision: {
      hitArea: createFanReach(360, 1),
      hitmarkSeconds: COLLISION_HITMARK_FRAMES / 60,
      poiseDamage: COLLISION_POISE_DAMAGE,
      talentMultiplier: attackTalentMultiplier(8),
    },
    skillCooldownSeconds: skillTalentMultiplier(ITTO_SKILL_COOLDOWN_INDEX),
  };
};
