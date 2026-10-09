import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitTaunt } from "#src/models/kit/KitTaunt";

import { Attribute } from "#src/models/character/Attribute";
import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Amber's proud skill groups, read at her talent level. The attack group holds the five arrows at 0 to 4, the aimed shot at
// 5 and the fully charged aimed shot at 6, and the plunges' collision, low and high at 7, 8 and 9. The skill group holds the
// Puppet's inherited HP at 0 and its explosion at 1, and the burst group holds Fiery Rain's wave at 0
const AMBER_ATTACK_GROUP_ID = 2131;
const AMBER_SKILL_GROUP_ID = 2132;
const AMBER_BURST_GROUP_ID = 2139;

// Measured: gcsim v2.47.2 (MIT) amber/attack.go and aimed.go, the arrows and the shots land at the primary target through a
// Box a metre long and a tenth wide, so they are priced as a circle of a metre round the body until an area holds the aim.
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/amber/aimed.go
const ARROW_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1 });
// Provisional: gcsim has no plunge file for Amber, so her plunges' reach is Mona's until one measures it
const PLUNGE_COLLISION_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1 });
const LOW_PLUNGE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 3 });
const HIGH_PLUNGE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 5 });
// Measured: gcsim v2.47.2 (MIT) amber/bunny.go, the explosion is a circle of radius 3 round the bunny
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/amber/bunny.go
const BUNNY_EXPLOSION_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 3 });
// Measured: gcsim v2.47.2 (MIT) amber/burst.go, Fiery Rain's arrows land at random within a radius of 2 round its centre,
// Each one a circle of that radius, so an arrow reaches twice the radius from the body. Ascension 1 widens it by 30%
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/amber/burst.go
const FIERY_RAIN_RADIUS = 2;
const FIERY_RAIN_ASCENSION_RADIUS_MULTIPLIER = 1.3;
// Provisional: the reach the targeting reads for the strikes, the skill and the burst, as the Traveler's are
const SWORD_TARGETING_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 6, radius: 5 });
const SKILL_TARGETING_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 10, radius: 15 });

// Measured: gcsim v2.47.2 (MIT) amber/aimed.go, the fully charged shot at 86 frames, cancelling at 96
const FULL_AIM_HITMARK_FRAMES = 86;
const FULL_AIM_SECONDS = 96 / 60;
// Measured: gcsim v2.47.2 (MIT) amber/skill.go, the bunny released at 5 frames and landing at 45, cancelling at 33
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/amber/skill.go
const BUNNY_LANDING_FRAMES = 45;
const BUNNY_SECONDS = 484;
const SKILL_SECONDS = 33 / 60;
// Measured: gcsim v2.47.2 (MIT) amber/burst.go, the arrows' hitmarks from the burst's first wave at 72 frames: 5 main
// Arrows every 24 frames, 3 every 36 and 10 every 12, 18 in all. The burst cancels at 111 frames
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/amber/burst.go
const FIERY_RAIN_HITMARK_FRAMES = [
  84, 96, 96, 108, 108, 120, 120, 132, 144, 144, 144, 156, 168, 168, 180, 180, 192, 192,
];
const BURST_SECONDS = 111 / 60;

// Measured: gcsim v2.47.2 (MIT) amber/attack.go, each arrow's hitmark and cancel frame, and the wiki's Sharpshooter poise.
// A bow's arrows are physical, so none applies a gauge and none has an internal cooldown
const createArrow = (
  talentMultiplierMap: TalentMultiplierMap,
  groupIndex: number,
  hitmarkSeconds: number,
  poiseDamage: number,
  seconds: number,
): KitAction => ({
  hits: [
    {
      hitArea: ARROW_HIT_AREA,
      hitmarkSeconds,
      poiseDamage,
      talentMultiplier: getTalentMultiplier(talentMultiplierMap, AMBER_ATTACK_GROUP_ID, TALENT_START_LEVEL, groupIndex),
    },
  ],
  seconds,
  targetingArea: SWORD_TARGETING_AREA,
});

// Ascension 1, Every Arrow Finds Its Target, adds 10% CRIT Rate to Fiery Rain, priced by the combatant that cast it
const getFieryRainCombatant = (combatant: Combatant): Combatant => {
  if (combatant.ascension < 1) return combatant;
  const { attributeTotalMap } = combatant.attributes;
  return {
    ...combatant,
    attributes: {
      ...combatant.attributes,
      attributeTotalMap: {
        ...attributeTotalMap,
        [Attribute.CriticalRate]: attributeTotalMap[Attribute.CriticalRate] + 0.1,
      },
    },
  };
};

// Fiery Rain's arrows, each Pyro under an Elemental Burst internal cooldown, widened by Ascension 1
const createFieryRainHits = (talentMultiplierMap: TalentMultiplierMap, ascension: number): KitHit[] => {
  const radius = ascension >= 1 ? FIERY_RAIN_RADIUS * FIERY_RAIN_ASCENSION_RADIUS_MULTIPLIER : FIERY_RAIN_RADIUS;
  return FIERY_RAIN_HITMARK_FRAMES.map((frames) => ({
    element: Element.Pyro,
    gauge: 1,
    hitArea: { angle: 2 * Math.PI, height: 2, radius: 2 * radius },
    hitmarkSeconds: frames / 60,
    internalCooldownTag: InternalCooldownTag.ElementalBurst,
    poiseDamage: 7.22,
    talentMultiplier: getTalentMultiplier(talentMultiplierMap, AMBER_BURST_GROUP_ID, TALENT_START_LEVEL, 0),
  }));
};

// Amber's first kit, at talent level 1: five arrows, a fully charged aimed shot, a collision and two plunges, Explosive
// Puppet's Baron Bunny and Fiery Rain. Its multipliers are read from its proud skill groups. The aimed shot's unlit form,
// The bow's aim binding and Amber's ascension 4 weak-point ATK bonus are not built, so the charged attack is the full shot
export const createAmberKit = (talentMultiplierMap: TalentMultiplierMap): Kit => ({
  burstCooldownSeconds: 12,
  burstEnergyCost: 40,
  // The wiki's fully charged aimed shot deals 2U of Pyro with Dropoff and 20 poise, under a Charged Attack internal cooldown
  chargedAttack: {
    hits: [
      {
        element: Element.Pyro,
        gauge: 2,
        hitArea: ARROW_HIT_AREA,
        hitmarkSeconds: FULL_AIM_HITMARK_FRAMES / 60,
        internalCooldownTag: InternalCooldownTag.ChargedAttack,
        poiseDamage: 20,
        talentMultiplier: getTalentMultiplier(talentMultiplierMap, AMBER_ATTACK_GROUP_ID, TALENT_START_LEVEL, 6),
      },
    ],
    isAimed: true,
    seconds: FULL_AIM_SECONDS,
    targetingArea: SWORD_TARGETING_AREA,
  },
  // A bow's aimed shot costs no stamina, as the wiki's Sharpshooter gives it
  chargedAttackStamina: 0,
  // Measured: gcsim v2.47.2 (MIT) amber/burst.go, the arrows of the wave above and the cancel at 111 frames. Fiery Rain's
  // Arrows are a summon's hits, landing from where Amber cast it
  elementalBurst: {
    hits: [],
    onStart: ({ body, combatant, effects }) =>
      addKitEffect(effects, {
        body: { facing: body.facing, height: body.height, position: { x: body.position.x, z: body.position.z } },
        combatant: getFieryRainCombatant(combatant),
        elapsedSeconds: 0,
        hits: createFieryRainHits(talentMultiplierMap, combatant.ascension),
        kind: "summon",
        secondsRemaining: Math.max(...FIERY_RAIN_HITMARK_FRAMES) / 60,
      }),
    seconds: BURST_SECONDS,
    targetingArea: SKILL_TARGETING_AREA,
  },
  // Measured: gcsim v2.47.2 (MIT) amber/skill.go, the cooldown of 15 seconds. The wiki's Explosive Puppet has no press
  // Gauge of its own, the bunny's explosion carries the 2U of Pyro
  elementalSkill: {
    hits: [],
    onStart: ({ body, combatant, effects }) => {
      const explosion: KitHit = {
        element: Element.Pyro,
        gauge: 2,
        hitArea: BUNNY_EXPLOSION_HIT_AREA,
        hitmarkSeconds: 0,
        isBlunt: true,
        poiseDamage: 260,
        talentMultiplier: getTalentMultiplier(talentMultiplierMap, AMBER_SKILL_GROUP_ID, TALENT_START_LEVEL, 1),
      };
      const taunt: KitTaunt = {
        body: { facing: body.facing, height: body.height, position: { x: body.position.x, z: body.position.z } },
        combatant,
        explosion,
        // Baron Bunny's HP is the table's share of Amber's Max HP
        health:
          getTalentMultiplier(talentMultiplierMap, AMBER_SKILL_GROUP_ID, TALENT_START_LEVEL, 0) *
          combatant.attributes.maxHealth,
        kind: "taunt",
        secondsRemaining: (BUNNY_LANDING_FRAMES + BUNNY_SECONDS) / 60,
      };
      addKitEffect(effects, taunt);
    },
    seconds: SKILL_SECONDS,
    targetingArea: SKILL_TARGETING_AREA,
  },
  highPlunge: {
    hits: [
      {
        hitArea: HIGH_PLUNGE_HIT_AREA,
        hitmarkSeconds: 0,
        poiseDamage: 100,
        talentMultiplier: getTalentMultiplier(talentMultiplierMap, AMBER_ATTACK_GROUP_ID, TALENT_START_LEVEL, 9),
      },
    ],
    seconds: 0.4,
    targetingArea: SWORD_TARGETING_AREA,
  },
  lowPlunge: {
    hits: [
      {
        hitArea: LOW_PLUNGE_HIT_AREA,
        hitmarkSeconds: 0,
        poiseDamage: 50,
        talentMultiplier: getTalentMultiplier(talentMultiplierMap, AMBER_ATTACK_GROUP_ID, TALENT_START_LEVEL, 8),
      },
    ],
    seconds: 0.4,
    targetingArea: SWORD_TARGETING_AREA,
  },
  normalAttacks: [
    createArrow(talentMultiplierMap, 0, 14 / 60, 12.9, 26 / 60),
    createArrow(talentMultiplierMap, 1, 10 / 60, 13.2, 22 / 60),
    createArrow(talentMultiplierMap, 2, 27 / 60, 15, 37 / 60),
    createArrow(talentMultiplierMap, 3, 26 / 60, 14.4, 34 / 60),
    createArrow(talentMultiplierMap, 4, 26 / 60, 16.5, 60 / 60),
  ],
  // The collision's poise is the wiki's 10, and it applies no gauge, as the wiki's table gives
  plungeCollision: {
    hitArea: PLUNGE_COLLISION_HIT_AREA,
    hitmarkSeconds: 0,
    poiseDamage: 10,
    talentMultiplier: getTalentMultiplier(talentMultiplierMap, AMBER_ATTACK_GROUP_ID, TALENT_START_LEVEL, 7),
  },
  skillCooldownSeconds: 15,
});
