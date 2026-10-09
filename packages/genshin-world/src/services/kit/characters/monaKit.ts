import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitState } from "#src/models/kit/KitState";
import type { KitStepContext } from "#src/models/kit/KitStepContext";

import { Attribute } from "#src/models/character/Attribute";
import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { SUMMON_LINGER_SECONDS } from "#src/services/kit/constants";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Mona's proud skill groups, read at its talent level. The attack group holds the four strikes at 0 to 3, the charged
// Attack at 4 and its stamina at 5, and the plunges' collision, low and high at 6, 7 and 8. The skill group holds Mirror
// Reflection's damage-over-time tick at 0 and its explosion at 1, and the burst group the bubble's explosion at 1
const MONA_ATTACK_GROUP_ID = 4131;
const MONA_SKILL_GROUP_ID = 4132;
const MONA_BURST_GROUP_ID = 4139;
// Stellaris Phantasm's Omen is read from the burst group at its index for the duration, 3, and for the DMG bonus, 9. The
// Group's values at talent level 1 are 4 seconds and 42%, as the wiki's Stellaris Phantasm page gives them
// https://genshin-impact.fandom.com/wiki/Stellaris_Phantasm
const OMEN_DURATION_INDEX = 3;
const OMEN_DAMAGE_BONUS_INDEX = 9;
const OMEN_STATUS_ID = "mona-omen";

// Measured: gcsim v2.47.2 (MIT) mona/attack.go, the strikes' reach: circles of radius 1, 1, 1 and 2. gcsim centres them
// On the primary target, which an area does not hold, so they are priced round the body until it does
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/mona/attack.go
const STRIKE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1 });
const FOURTH_STRIKE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 2 });
// Measured: gcsim v2.47.2 (MIT) mona/charge.go, the charged attack's circle of radius 3, centred on the target
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/mona/charge.go
const CHARGED_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 3 });
// Provisional: gcsim has no plunge file for Mona, so the plunges' reach is Bennett's and Diluc's until one measures it
const PLUNGE_COLLISION_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1 });
const LOW_PLUNGE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 3 });
const HIGH_PLUNGE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 5 });
// Measured: gcsim v2.47.2 (MIT) mona/skill.go, Mirror Reflection's phantom is a circle of radius 5 for both its tick and
// Its explosion. Its height is provisional
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/mona/skill.go
const PHANTOM_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 5 });
// Measured: gcsim v2.47.2 (MIT) mona/asc.go, Ascension 1's phantom lasts 2 seconds and explodes at its end, for half of
// Mirror Reflection's explosion, the same circle of radius 5 the phantom uses
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/mona/asc.go
const A1_PHANTOM_SECONDS = 2;
const A1_PHANTOM_EXPLOSION_MULTIPLIER = 0.5;
// Measured: gcsim v2.47.2 (MIT) mona/asc.go, Ascension 4 adds 20% of Mona's Energy Recharge to her Hydro DMG Bonus
const A4_HYDRO_BONUS_OF_ENERGY_RECHARGE = 0.2;
// Measured: gcsim v2.47.2 (MIT) mona/burst.go, the bubble's circle of radius 10
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/mona/burst.go
const BUBBLE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 10 });
// Provisional: the reach the targeting reads for the strikes, the skill and the burst, as the Traveler's are
const SWORD_TARGETING_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 6, radius: 5 });
const SKILL_TARGETING_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 10, radius: 15 });

// Measured: gcsim v2.47.2 (MIT) mona/skill.go, the phantom's first tick at 86 frames and then every 59 frames, four
// Ticks in all, and its explosion at 243 frames after the first tick, 329 frames in. The phantom lasts until the explosion
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/mona/skill.go
const PHANTOM_TICK_HITMARK_FRAMES = [86, 145, 204, 263];
const PHANTOM_EXPLOSION_HITMARK_FRAMES = 329;

// Hits of a kit's normal attacks, charged attack and plunges are Hydro catalyst hits, each applying 1U and then the
// Gauge the wiki gives it. The poise is the wiki's Ripple of Fate advanced properties
const createNormalAttack = (
  hitArea: AttackArea,
  poiseDamage: number,
  talentMultiplier: number,
  hitmarkSeconds: number,
  seconds: number,
): KitAction => ({
  hits: [
    {
      element: Element.Hydro,
      gauge: 1,
      hitArea,
      hitmarkSeconds,
      internalCooldownTag: InternalCooldownTag.MonaHydroDamage,
      poiseDamage,
      talentMultiplier,
    },
  ],
  seconds,
  targetingArea: SWORD_TARGETING_AREA,
});

// Ascension 1's phantom's explosion: a single Hydro hit at the phantom's end, at half of Mirror Reflection's explosion.
// Gcsim gives it no poise, and the phantom's own Hydro is 1U, as the explosion's is
const createA1PhantomHits = (talentMultiplierMap: TalentMultiplierMap): KitHit[] => [
  {
    element: Element.Hydro,
    gauge: 1,
    hitArea: PHANTOM_HIT_AREA,
    hitmarkSeconds: A1_PHANTOM_SECONDS,
    poiseDamage: 0,
    talentMultiplier:
      A1_PHANTOM_EXPLOSION_MULTIPLIER *
      getTalentMultiplier(talentMultiplierMap, MONA_SKILL_GROUP_ID, TALENT_START_LEVEL, 1),
  },
];

// Mirror Reflection's phantom: a tick every 59 frames from the first, which applies Hydro under an Elemental Skill ICD,
// And an explosion that applies Hydro with no internal cooldown, the wiki's 1U for each
const createMirrorReflectionHits = (talentMultiplierMap: TalentMultiplierMap): KitHit[] => [
  ...PHANTOM_TICK_HITMARK_FRAMES.map((frames): KitHit => ({
    element: Element.Hydro,
    gauge: 1,
    hitArea: PHANTOM_HIT_AREA,
    hitmarkSeconds: frames / 60,
    internalCooldownTag: InternalCooldownTag.ElementalSkill,
    poiseDamage: 40,
    talentMultiplier: getTalentMultiplier(talentMultiplierMap, MONA_SKILL_GROUP_ID, TALENT_START_LEVEL, 0),
  })),
  {
    element: Element.Hydro,
    gauge: 1,
    hitArea: PHANTOM_HIT_AREA,
    hitmarkSeconds: PHANTOM_EXPLOSION_HITMARK_FRAMES / 60,
    poiseDamage: 150,
    talentMultiplier: getTalentMultiplier(talentMultiplierMap, MONA_SKILL_GROUP_ID, TALENT_START_LEVEL, 1),
  },
];

// Ascension 4's Hydro DMG Bonus, which a hit reads as it is priced, from 20% of Mona's Energy Recharge
const getPassiveBonuses = (combatant: Combatant): { amount: number; attribute: Attribute }[] =>
  combatant.ascension < 4
    ? []
    : [
        {
          amount: A4_HYDRO_BONUS_OF_ENERGY_RECHARGE * combatant.attributes.attributeTotalMap[Attribute.EnergyRecharge],
          attribute: Attribute.HydroDamageBonus,
        },
      ];

// Mona's kit at talent level 1: four strikes, a charged attack, a collision and two plunges, Mirror Reflection of Doom
// And Stellaris Phantasm, with its Omen, and her passives. Its multipliers are read from its proud skill groups. The
// Bubble's explosion is not built, so the bubble applies its Hydro and the Omen, whose duration runs from the cast
export const createMonaKit = (talentMultiplierMap: TalentMultiplierMap): Kit => ({
  burstCooldownSeconds: 15,
  burstEnergyCost: 60,
  chargedAttack: {
    hits: [
      {
        element: Element.Hydro,
        gauge: 1,
        hitArea: CHARGED_HIT_AREA,
        // Measured: gcsim v2.47.2 (MIT) mona/charge.go, the charge at 66 frames and its cancel frame at 113
        hitmarkSeconds: 66 / 60,
        poiseDamage: 26.15,
        talentMultiplier: getTalentMultiplier(talentMultiplierMap, MONA_ATTACK_GROUP_ID, TALENT_START_LEVEL, 4),
      },
    ],
    seconds: 113 / 60,
    targetingArea: SWORD_TARGETING_AREA,
  },
  chargedAttackStamina: getTalentMultiplier(talentMultiplierMap, MONA_ATTACK_GROUP_ID, TALENT_START_LEVEL, 5),
  // Measured: gcsim v2.47.2 (MIT) mona/burst.go, the bubble at 107 frames and its cancel frame at 127. The wiki's
  // Stellaris Phantasm applies 1U of Hydro on cast under an Elemental Burst ICD, with 50 poise. Its Omen is applied with
  // The bubble on each enemy it strikes, as the wiki says both are applied on cast
  elementalBurst: {
    hits: [
      {
        element: Element.Hydro,
        enemyStatus: () => ({
          damageTakenBonus: getTalentMultiplier(
            talentMultiplierMap,
            MONA_BURST_GROUP_ID,
            TALENT_START_LEVEL,
            OMEN_DAMAGE_BONUS_INDEX,
          ),
          id: OMEN_STATUS_ID,
          secondsRemaining: getTalentMultiplier(
            talentMultiplierMap,
            MONA_BURST_GROUP_ID,
            TALENT_START_LEVEL,
            OMEN_DURATION_INDEX,
          ),
        }),
        gauge: 1,
        hitArea: BUBBLE_HIT_AREA,
        hitmarkSeconds: 107 / 60,
        internalCooldownTag: InternalCooldownTag.ElementalBurst,
        poiseDamage: 50,
        talentMultiplier: 0,
      },
    ],
    seconds: 127 / 60,
    targetingArea: SKILL_TARGETING_AREA,
  },
  // Measured: gcsim v2.47.2 (MIT) mona/skill.go, the press's cancel frame at 50 and its cooldown of 12 seconds. The phantom
  // Is cast where Mona stands, and its hits are the summon's
  elementalSkill: {
    hits: [],
    onStart: ({ body, combatant, kitEffectState }) =>
      addKitEffect(kitEffectState, {
        body: { facing: body.facing, height: body.height, position: { x: body.position.x, z: body.position.z } },
        combatant,
        elapsedSeconds: 0,
        hits: createMirrorReflectionHits(talentMultiplierMap),
        kind: "summon",
        secondsRemaining: PHANTOM_EXPLOSION_HITMARK_FRAMES / 60 + SUMMON_LINGER_SECONDS,
      }),
    seconds: 50 / 60,
    targetingArea: SKILL_TARGETING_AREA,
  },
  // Ascension 1: a phantom for every 2 seconds of sprint, which the kit spends from the sprint's seconds as it goes
  getPassiveBonuses,
  highPlunge: {
    hits: [
      {
        element: Element.Hydro,
        gauge: 1,
        hitArea: HIGH_PLUNGE_HIT_AREA,
        hitmarkSeconds: 0,
        poiseDamage: 100,
        talentMultiplier: getTalentMultiplier(talentMultiplierMap, MONA_ATTACK_GROUP_ID, TALENT_START_LEVEL, 8),
      },
    ],
    seconds: 0.4,
    targetingArea: SWORD_TARGETING_AREA,
  },
  lowPlunge: {
    hits: [
      {
        element: Element.Hydro,
        gauge: 1,
        hitArea: LOW_PLUNGE_HIT_AREA,
        hitmarkSeconds: 0,
        poiseDamage: 50,
        talentMultiplier: getTalentMultiplier(talentMultiplierMap, MONA_ATTACK_GROUP_ID, TALENT_START_LEVEL, 7),
      },
    ],
    seconds: 0.4,
    targetingArea: SWORD_TARGETING_AREA,
  },
  normalAttacks: [
    createNormalAttack(
      STRIKE_HIT_AREA,
      7.65,
      getTalentMultiplier(talentMultiplierMap, MONA_ATTACK_GROUP_ID, TALENT_START_LEVEL, 0),
      11 / 60,
      29 / 60,
    ),
    createNormalAttack(
      STRIKE_HIT_AREA,
      7.35,
      getTalentMultiplier(talentMultiplierMap, MONA_ATTACK_GROUP_ID, TALENT_START_LEVEL, 1),
      14 / 60,
      30 / 60,
    ),
    createNormalAttack(
      STRIKE_HIT_AREA,
      9.15,
      getTalentMultiplier(talentMultiplierMap, MONA_ATTACK_GROUP_ID, TALENT_START_LEVEL, 2),
      25 / 60,
      54 / 60,
    ),
    createNormalAttack(
      FOURTH_STRIKE_HIT_AREA,
      11.85,
      getTalentMultiplier(talentMultiplierMap, MONA_ATTACK_GROUP_ID, TALENT_START_LEVEL, 3),
      27 / 60,
      67 / 60,
    ),
  ],
  onSprint: ({ body, combatant, kitEffectState }: KitStepContext, kitState: KitState): void => {
    if (combatant.ascension < 1 || kitState.sprintSeconds < A1_PHANTOM_SECONDS) return;
    kitState.sprintSeconds -= A1_PHANTOM_SECONDS;
    addKitEffect(kitEffectState, {
      body: { facing: body.facing, height: body.height, position: { x: body.position.x, z: body.position.z } },
      combatant,
      elapsedSeconds: 0,
      hits: createA1PhantomHits(talentMultiplierMap),
      kind: "summon",
      secondsRemaining: A1_PHANTOM_SECONDS + SUMMON_LINGER_SECONDS,
    });
  },
  // The collision's poise is the wiki's 5, and it applies no gauge of its own, 0U, as the wiki's table gives. The plunges
  // Are Hydro, as the catalyst's attacks are
  plungeCollision: {
    element: Element.Hydro,
    gauge: 0,
    hitArea: PLUNGE_COLLISION_HIT_AREA,
    hitmarkSeconds: 0,
    poiseDamage: 5,
    talentMultiplier: getTalentMultiplier(talentMultiplierMap, MONA_ATTACK_GROUP_ID, TALENT_START_LEVEL, 6),
  },
  skillCooldownSeconds: 12,
});
