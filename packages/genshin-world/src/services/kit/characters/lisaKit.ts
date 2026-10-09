import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitHit } from "#src/models/kit/KitHit";

import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Lisa's proud skill groups, read at her talent level. The attack group holds the four strikes at 0 to 3, the charged
// Attack at 4 and its stamina at 5, and the plunges' collision, low and high at 6, 7 and 8. The skill group holds Violet
// Arc's press at 5, and the burst group holds Lightning Rose's discharge at 0
const LISA_ATTACK_GROUP_ID = 431;
const LISA_SKILL_GROUP_ID = 432;
const LISA_BURST_GROUP_ID = 439;

// Measured: gcsim v2.47.2 (MIT) lisa/attack.go, charge.go, plunge.go and skill.go. Each strike is a circle of radius 1 round
// The target, priced round the body until an area holds a target, and the charged attack is a fan of 40 degrees and radius
// 10 a metre ahead of the body. The plunges are circles of 1.5 for the collision, 3 for the low and 3.5 for the high
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/lisa/attack.go
const STRIKE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1 });
const CHARGE_HIT_AREA: AttackArea = Object.freeze({ angle: (40 * Math.PI) / 180, height: 2, radius: 11 });
const PLUNGE_COLLISION_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1.5 });
const LOW_PLUNGE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 3 });
const HIGH_PLUNGE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 3.5 });
// Measured: gcsim v2.47.2 (MIT) lisa/skill.go, Violet Arc's press lands on the target, priced as the circle of radius 1
const PRESS_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1 });
// Measured: gcsim v2.47.2 (MIT) lisa/skill.go, the hold's strike on each enemy within 10 metres, a circle of radius 0.2 on
// Each one, so it reaches 10.2 metres round the body
const HOLD_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 10.2 });
// Measured: gcsim v2.47.2 (MIT) lisa/skill.go, each press applies a stack of Conductive to the enemy it hits, up to 3, and
// gcsim gives the stacks no duration. Lisa's charged attacks apply one too from her A1 (lisa/asc.go). The hold consumes
// The stacks. The wiki's hold holds for 1.9 seconds to charge in full, which the hold's minimum is taken from
const CONDUCTIVE_STATUS_ID = "conductive";
const CONDUCTIVE_STACK: EnemyStatus = {
  damageTakenBonus: 0,
  id: CONDUCTIVE_STATUS_ID,
  maxStacks: 3,
  secondsRemaining: Infinity,
  stacks: 1,
};
const HOLD_MINIMUM_HELD_SECONDS = 1.9;
// Measured: gcsim v2.47.2 (MIT) lisa/burst.go, Lightning Rose's activation and each discharge reach a circle of radius 7
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/lisa/burst.go
const LIGHTNING_ROSE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 7 });
// Provisional: the reach the targeting reads for the strikes, the skill and the burst, as the Traveler's are
const SWORD_TARGETING_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 6, radius: 5 });
const SKILL_TARGETING_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 10, radius: 15 });

// Measured: gcsim v2.47.2 (MIT) lisa/burst.go, the discharges begin at 119 frames and come every 30, for 15 seconds
// From the first. The last of them lands at 989 frames, so the rose stands for 15 seconds past its first discharge
const LIGHTNING_ROSE_FIRST_TICK_FRAMES = 119;
const LIGHTNING_ROSE_TICK_INTERVAL_FRAMES = 30;
const LIGHTNING_ROSE_TICK_COUNT = 30;
const LIGHTNING_ROSE_SECONDS = (LIGHTNING_ROSE_FIRST_TICK_FRAMES + 15 * 60) / 60;

// Lisa's strikes, her charged attack and her plunges are Electro, and the strikes share one internal cooldown of their
// Gauge, which the wiki gives as 1U each under Lisa Electro DMG
const createStrike = (
  hitmarkSeconds: number,
  poiseDamage: number,
  talentMultiplier: number,
  seconds: number,
): KitAction => ({
  hits: [
    {
      element: Element.Electro,
      gauge: 1,
      hitArea: STRIKE_HIT_AREA,
      hitmarkSeconds,
      internalCooldownTag: InternalCooldownTag.LisaElectroDamage,
      poiseDamage,
      talentMultiplier,
    },
  ],
  seconds,
  targetingArea: SWORD_TARGETING_AREA,
});

// The discharges of Lightning Rose: each Electro under an Elemental Burst internal cooldown, the wiki's 1U and 10 poise
const createDischarges = (talentMultiplierMap: TalentMultiplierMap): KitHit[] =>
  Array.from({ length: LIGHTNING_ROSE_TICK_COUNT }, (_value, index) => ({
    element: Element.Electro,
    gauge: 1,
    hitArea: LIGHTNING_ROSE_HIT_AREA,
    hitmarkSeconds: (LIGHTNING_ROSE_FIRST_TICK_FRAMES + index * LIGHTNING_ROSE_TICK_INTERVAL_FRAMES) / 60,
    internalCooldownTag: InternalCooldownTag.ElementalBurst,
    poiseDamage: 10,
    talentMultiplier: getTalentMultiplier(talentMultiplierMap, LISA_BURST_GROUP_ID, TALENT_START_LEVEL, 0),
  }));

// Lisa's kit at talent level 1: four strikes, a charged attack, a collision and two plunges, Violet Arc's press and hold,
// And Lightning Rose. Its multipliers are read from its proud skill groups. A4's effect is not built
// Violet Arc's hold: a strike on each enemy within 10 metres, whose multiplier and poise are set by the enemy's Conductive
// Stacks, from none to three, and which consumes them. Its 2U of Electro and the wiki's stacked poise, 150 to 300. Measured:
// gcsim v2.47.2 (MIT) lisa/skill.go, the hold's strike at 117 frames and its animation of 143 frames, and the wiki's
// Violet Arc page for the multipliers at group indices 0 to 3, 320% to 487%, and the poise
const createVioletArcHold = (talentMultiplierMap: TalentMultiplierMap): KitAction => {
  const talentMultipliers = [0, 1, 2, 3].map((index) =>
    getTalentMultiplier(talentMultiplierMap, LISA_SKILL_GROUP_ID, TALENT_START_LEVEL, index),
  );
  return {
    hits: [
      {
        element: Element.Electro,
        gauge: 2,
        hitArea: HOLD_HIT_AREA,
        hitmarkSeconds: 117 / 60,
        poiseDamage: 150,
        stackedHit: { poiseDamages: [150, 195, 240, 300], statusId: CONDUCTIVE_STATUS_ID, talentMultipliers },
        talentMultiplier: talentMultipliers[0] ?? 0,
      },
    ],
    seconds: 143 / 60,
    targetingArea: SKILL_TARGETING_AREA,
  };
};

export const createLisaKit = (talentMultiplierMap: TalentMultiplierMap): Kit => ({
  burstCooldownSeconds: 20,
  burstEnergyCost: 80,
  // Measured: gcsim v2.47.2 (MIT) lisa/charge.go, the charge's hit at 70 frames, 14 of them skipped after a strike's
  // Windup, so 56 here, and its animation after that. The wiki's charged attack is 1U of Electro with 15 poise
  chargedAttack: {
    hits: [
      {
        element: Element.Electro,
        // A1: each enemy a charged attack hits gains a stack of Conductive
        enemyStatus: (combatant) => (combatant.ascension >= 1 ? CONDUCTIVE_STACK : undefined),
        gauge: 1,
        hitArea: CHARGE_HIT_AREA,
        hitmarkSeconds: 56 / 60,
        poiseDamage: 15,
        talentMultiplier: getTalentMultiplier(talentMultiplierMap, LISA_ATTACK_GROUP_ID, TALENT_START_LEVEL, 4),
      },
    ],
    seconds: 79 / 60,
    targetingArea: SWORD_TARGETING_AREA,
  },
  chargedAttackStamina: getTalentMultiplier(talentMultiplierMap, LISA_ATTACK_GROUP_ID, TALENT_START_LEVEL, 5),
  // Measured: gcsim v2.47.2 (MIT) lisa/burst.go, the activation at 56 frames and the cancel at 88. The activation deals no
  // Damage, as the wiki gives it 0U and poise alone, and the rose's discharges are a summon's hits, landing from her body
  elementalBurst: {
    hits: [{ hitArea: LIGHTNING_ROSE_HIT_AREA, hitmarkSeconds: 56 / 60, poiseDamage: 10, talentMultiplier: 0 }],
    onStart: ({ body, combatant, effects }) =>
      addKitEffect(effects, {
        body: { facing: body.facing, height: body.height, position: { x: body.position.x, z: body.position.z } },
        combatant,
        elapsedSeconds: 0,
        hits: createDischarges(talentMultiplierMap),
        kind: "summon",
        secondsRemaining: LIGHTNING_ROSE_SECONDS,
      }),
    seconds: 88 / 60,
    targetingArea: SKILL_TARGETING_AREA,
  },
  // Measured: gcsim v2.47.2 (MIT) lisa/skill.go, the press at 22 frames and its animation of 40. The wiki's Violet Arc press
  // Applies 1U of Electro under the Lisa Electro DMG internal cooldown with 18 poise, and its press cooldown is 1 second
  elementalSkill: {
    hits: [
      {
        element: Element.Electro,
        enemyStatus: () => CONDUCTIVE_STACK,
        gauge: 1,
        hitArea: PRESS_HIT_AREA,
        hitmarkSeconds: 22 / 60,
        internalCooldownTag: InternalCooldownTag.LisaElectroDamage,
        poiseDamage: 18,
        talentMultiplier: getTalentMultiplier(talentMultiplierMap, LISA_SKILL_GROUP_ID, TALENT_START_LEVEL, 5),
      },
    ],
    seconds: 40 / 60,
    targetingArea: SKILL_TARGETING_AREA,
  },
  // Held past its minimum and released, the skill plays its hold at the hold's cooldown, which the table gives
  elementalSkillHolds: [
    {
      action: createVioletArcHold(talentMultiplierMap),
      cooldownSeconds: getTalentMultiplier(talentMultiplierMap, LISA_SKILL_GROUP_ID, TALENT_START_LEVEL, 4),
      minimumHeldSeconds: HOLD_MINIMUM_HELD_SECONDS,
    },
  ],
  highPlunge: {
    hits: [
      {
        element: Element.Electro,
        gauge: 1,
        hitArea: HIGH_PLUNGE_HIT_AREA,
        hitmarkSeconds: 47 / 60,
        poiseDamage: 100,
        talentMultiplier: getTalentMultiplier(talentMultiplierMap, LISA_ATTACK_GROUP_ID, TALENT_START_LEVEL, 8),
      },
    ],
    seconds: 68 / 60,
    targetingArea: SWORD_TARGETING_AREA,
  },
  lowPlunge: {
    hits: [
      {
        element: Element.Electro,
        gauge: 1,
        hitArea: LOW_PLUNGE_HIT_AREA,
        hitmarkSeconds: 45 / 60,
        poiseDamage: 50,
        talentMultiplier: getTalentMultiplier(talentMultiplierMap, LISA_ATTACK_GROUP_ID, TALENT_START_LEVEL, 7),
      },
    ],
    seconds: 67 / 60,
    targetingArea: SWORD_TARGETING_AREA,
  },
  normalAttacks: [
    // Measured: gcsim v2.47.2 (MIT) lisa/attack.go, the strikes' hitmarks at 26, 18, 17 and 31 frames, and the cancels
    createStrike(
      26 / 60,
      6.75,
      getTalentMultiplier(talentMultiplierMap, LISA_ATTACK_GROUP_ID, TALENT_START_LEVEL, 0),
      30 / 60,
    ),
    createStrike(
      18 / 60,
      6,
      getTalentMultiplier(talentMultiplierMap, LISA_ATTACK_GROUP_ID, TALENT_START_LEVEL, 1),
      24 / 60,
    ),
    createStrike(
      17 / 60,
      7.35,
      getTalentMultiplier(talentMultiplierMap, LISA_ATTACK_GROUP_ID, TALENT_START_LEVEL, 2),
      40 / 60,
    ),
    createStrike(
      31 / 60,
      8.7,
      getTalentMultiplier(talentMultiplierMap, LISA_ATTACK_GROUP_ID, TALENT_START_LEVEL, 3),
      57 / 60,
    ),
  ],
  // The collision's poise is the wiki's 5, and it applies no gauge of its own, as the wiki's table gives
  plungeCollision: {
    hitArea: PLUNGE_COLLISION_HIT_AREA,
    hitmarkSeconds: 0,
    poiseDamage: 5,
    talentMultiplier: getTalentMultiplier(talentMultiplierMap, LISA_ATTACK_GROUP_ID, TALENT_START_LEVEL, 6),
  },
  // Violet Arc's press cooldown is the wiki's 1 second (https://genshin-impact.fandom.com/wiki/Violet_Arc); the dump holds
  // Only the hold's skill row, whose 16 seconds is the hold's
  skillCooldownSeconds: 1,
});
