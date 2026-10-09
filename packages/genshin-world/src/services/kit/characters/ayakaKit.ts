import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Kamisato Ayaka's proud skill groups, read at her talent level. The attack group holds the first three strikes at 0 to 2,
// Each of the fourth strike's three hits at 3, the fifth strike at 6, each of the charged attack's three hits at 7 and its
// Stamina at 8, and the plunges' collision, low and high at 9, 10 and 11. The skill group holds Hyouka at 0, and the burst
// Group holds Soumetsu's cutting at 0 and its bloom at 1
const AYAKA_ATTACK_GROUP_ID = 231;
const AYAKA_SKILL_GROUP_ID = 232;
const AYAKA_BURST_GROUP_ID = 239;

// Measured: gcsim v2.47.2 (MIT) ayaka/attack.go, each strike a circle or a fan centred ahead of or behind the body, so
// Each is priced as its offset plus its radius until an area holds an offset. The fifth strike's circle of radius 0.8 is
// Centred on the primary target, which an area does not hold, so it is priced round the body, as Mona's strikes are
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/ayaka/attack.go
const FIRST_STRIKE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 0.8 + 1.6 });
const SECOND_STRIKE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 0.8 + 1.2 });
const THIRD_STRIKE_HIT_AREA: AttackArea = Object.freeze({ angle: Math.PI / 3, height: 2, radius: 2.8 - 0.5 });
const FOURTH_STRIKE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 0.6 + 1.6 });
const FIFTH_STRIKE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 0.8 });
// Measured: gcsim v2.47.2 (MIT) ayaka/charge.go, the charged attack strikes each enemy its search finds within 5 metres of
// The body, so it is priced as that circle
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/ayaka/charge.go
const CHARGED_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 5 });
// Measured: gcsim v2.47.2 (MIT) ayaka/plunge.go, the collision a circle of radius 1, the low plunge's 3 and the high's 5,
// Each a metre ahead of the body
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/ayaka/plunge.go
const PLUNGE_COLLISION_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1 + 1 });
const LOW_PLUNGE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1 + 3 });
const HIGH_PLUNGE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1 + 5 });
// Measured: gcsim v2.47.2 (MIT) ayaka/skill.go, Hyouka's circle of radius 4.5 round the body
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/ayaka/skill.go
const HYOUKA_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 4.5 });
// Measured: gcsim v2.47.2 (MIT) ayaka/burst.go, the storm's cut a circle of radius 3 offset 0.3 and its bloom a circle of
// Radius 5, and Blizzard Blade Seki no To's smaller storms' 1.5 and 3. gcsim centres each on the primary target, which an
// Area does not hold, so each is priced round the place Ayaka cast the storm
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/ayaka/burst.go
const FROSTFLAKE_CUT_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 0.3 + 3 });
const FROSTFLAKE_BLOOM_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 5 });
const SMALL_FROSTFLAKE_CUT_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 0.3 + 1.5 });
const SMALL_FROSTFLAKE_BLOOM_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 3 });
// Provisional: the reach the targeting reads for the strikes, the skill and the burst, as the Traveler's are
const SWORD_TARGETING_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 6, radius: 5 });
const SKILL_TARGETING_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 10, radius: 15 });

// Measured: gcsim v2.47.2 (MIT) ayaka/burst.go, the storm's nineteen cuts every 15 frames from 104 frames and its bloom
// 300 frames after the first cut
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/ayaka/burst.go
const FROSTFLAKE_FIRST_CUT_FRAMES = 104;
const FROSTFLAKE_CUT_INTERVAL_FRAMES = 15;
const FROSTFLAKE_CUT_COUNT = 19;
const FROSTFLAKE_BLOOM_FRAMES = FROSTFLAKE_FIRST_CUT_FRAMES + 300;
// Blizzard Blade Seki no To, from two constellations, casts two smaller storms beside the storm, each dealing a fifth of
// Its damage, as the wiki's constellation page and gcsim v2.47.2 (MIT) ayaka/burst.go give it
// https://genshin-impact.fandom.com/wiki/Blizzard_Blade_Seki_no_To
const BLIZZARD_BLADE_SEKI_NO_TO_CONSTELLATION = 2;
const SMALL_FROSTFLAKE_DAMAGE_SHARE = 0.2;
// Kamisato Art: Senho infuses Ayaka's attacks with Cryo for 5 seconds as she reappears, as the wiki's Senho page and gcsim
// V2.47.2 (MIT) ayaka/dash.go's 300 frames give. Each step of the sprint restarts it, so it runs out 5 seconds after the
// Sprint ends
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/ayaka/dash.go
const SENHO_INFUSION_SECONDS = 5;

// Ayaka's strikes are physical unless infused, so none applies a gauge of its own. Each is under a Normal Attack internal
// Cooldown, and its poise is the wiki's Kamisato Art: Kabuki advanced properties
const createStrikeHit = (
  hitArea: AttackArea,
  hitmarkFrames: number,
  poiseDamage: number,
  talentMultiplier: number,
): KitHit => ({
  hitArea,
  hitmarkSeconds: hitmarkFrames / 60,
  internalCooldownTag: InternalCooldownTag.NormalAttack,
  poiseDamage,
  talentMultiplier,
});

// A storm's nineteen cuts and its bloom at a share of their multipliers, each 1U of Cryo and 30 poise, the cuts under an
// Elemental Burst internal cooldown and the bloom under none, as the wiki's Kamisato Art: Soumetsu advanced properties give
const createFrostflakeHits = (
  talentMultiplierMap: TalentMultiplierMap,
  damageShare: number,
  cutHitArea: AttackArea,
  bloomHitArea: AttackArea,
): KitHit[] => [
  ...Array.from({ length: FROSTFLAKE_CUT_COUNT }, (_value, index): KitHit => ({
    element: Element.Cryo,
    gauge: 1,
    hitArea: cutHitArea,
    hitmarkSeconds: (FROSTFLAKE_FIRST_CUT_FRAMES + FROSTFLAKE_CUT_INTERVAL_FRAMES * index) / 60,
    internalCooldownTag: InternalCooldownTag.ElementalBurst,
    poiseDamage: 30,
    talentMultiplier:
      damageShare * getTalentMultiplier(talentMultiplierMap, AYAKA_BURST_GROUP_ID, TALENT_START_LEVEL, 0),
  })),
  {
    element: Element.Cryo,
    gauge: 1,
    hitArea: bloomHitArea,
    hitmarkSeconds: FROSTFLAKE_BLOOM_FRAMES / 60,
    poiseDamage: 30,
    talentMultiplier:
      damageShare * getTalentMultiplier(talentMultiplierMap, AYAKA_BURST_GROUP_ID, TALENT_START_LEVEL, 1),
  },
];

// A Frostflake Seki no To, a storm standing where Ayaka cast it and priced by her as she stood then. It lives a tenth of a
// Second past its bloom, so the step that lands the bloom still has it on the field
const createFrostflake = ({ facing, height, position }: KitBody, combatant: Combatant, hits: KitHit[]): KitSummon => ({
  body: { facing, height, position: { x: position.x, z: position.z } },
  combatant,
  elapsedSeconds: 0,
  hits,
  kind: "summon",
  secondsRemaining: FROSTFLAKE_BLOOM_FRAMES / 60 + 0.1,
});

// Kamisato Ayaka's first kit, at talent level 1: five strikes, a charged attack, a collision and two plunges, Hyouka,
// Soumetsu's storm and Senho's infusion. Its multipliers are read from her proud skill groups. Senho's Cryo application
// And movement, A1's and A4's effects, and every constellation but Blizzard Blade Seki no To are not built
export const createAyakaKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const frostflakeHits = createFrostflakeHits(
    talentMultiplierMap,
    1,
    FROSTFLAKE_CUT_HIT_AREA,
    FROSTFLAKE_BLOOM_HIT_AREA,
  );
  const smallFrostflakeHits = createFrostflakeHits(
    talentMultiplierMap,
    SMALL_FROSTFLAKE_DAMAGE_SHARE,
    SMALL_FROSTFLAKE_CUT_HIT_AREA,
    SMALL_FROSTFLAKE_BLOOM_HIT_AREA,
  );
  return {
    burstCooldownSeconds: 20,
    burstEnergyCost: 80,
    // Measured: gcsim v2.47.2 (MIT) ayaka/charge.go, the three hits at 27, 33 and 39 frames, and the animation's 71. The
    // Wiki's Kabuki gives each 40 poise under a Charged Attack internal cooldown
    chargedAttack: {
      hits: [27, 33, 39].map((hitmarkFrames): KitHit => ({
        hitArea: CHARGED_HIT_AREA,
        hitmarkSeconds: hitmarkFrames / 60,
        internalCooldownTag: InternalCooldownTag.ChargedAttack,
        poiseDamage: 40,
        talentMultiplier: getTalentMultiplier(talentMultiplierMap, AYAKA_ATTACK_GROUP_ID, TALENT_START_LEVEL, 7),
      })),
      seconds: 71 / 60,
      targetingArea: SWORD_TARGETING_AREA,
    },
    chargedAttackStamina: getTalentMultiplier(talentMultiplierMap, AYAKA_ATTACK_GROUP_ID, TALENT_START_LEVEL, 8),
    // Measured: gcsim v2.47.2 (MIT) ayaka/burst.go, the animation's 125 frames. Soumetsu's storms are summons, standing
    // Where Ayaka cast them and priced by her
    elementalBurst: {
      hits: [],
      onStart: ({ body, combatant, kitEffectState }) => {
        addKitEffect(kitEffectState, createFrostflake(body, combatant, frostflakeHits));
        if (combatant.constellationCount < BLIZZARD_BLADE_SEKI_NO_TO_CONSTELLATION) return;
        addKitEffect(kitEffectState, createFrostflake(body, combatant, smallFrostflakeHits));
        addKitEffect(kitEffectState, createFrostflake(body, combatant, smallFrostflakeHits));
      },
      seconds: 125 / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    // Measured: gcsim v2.47.2 (MIT) ayaka/skill.go, Hyouka's blast at 33 frames and the animation's 49. The wiki's Hyouka
    // Applies 2U of Cryo with no internal cooldown and 110 poise
    elementalSkill: {
      hits: [
        {
          element: Element.Cryo,
          gauge: 2,
          hitArea: HYOUKA_HIT_AREA,
          hitmarkSeconds: 33 / 60,
          poiseDamage: 110,
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, AYAKA_SKILL_GROUP_ID, TALENT_START_LEVEL, 0),
        },
      ],
      seconds: 49 / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    // Measured: gcsim v2.47.2 (MIT) ayaka/plunge.go, the low plunge at 46 frames and the high at 48, ending at 73 and 74.
    // The wiki's Kabuki gives them 100 and 150 poise, both blunt
    highPlunge: {
      hits: [
        {
          hitArea: HIGH_PLUNGE_HIT_AREA,
          hitmarkSeconds: 48 / 60,
          isBlunt: true,
          poiseDamage: 150,
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, AYAKA_ATTACK_GROUP_ID, TALENT_START_LEVEL, 11),
        },
      ],
      seconds: 74 / 60,
      targetingArea: SWORD_TARGETING_AREA,
    },
    lowPlunge: {
      hits: [
        {
          hitArea: LOW_PLUNGE_HIT_AREA,
          hitmarkSeconds: 46 / 60,
          isBlunt: true,
          poiseDamage: 100,
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, AYAKA_ATTACK_GROUP_ID, TALENT_START_LEVEL, 10),
        },
      ],
      seconds: 73 / 60,
      targetingArea: SWORD_TARGETING_AREA,
    },
    // Measured: gcsim v2.47.2 (MIT) ayaka/attack.go, each strike's hitmarks and the animation that ends it at 60 fps
    normalAttacks: [
      {
        hits: [
          createStrikeHit(
            FIRST_STRIKE_HIT_AREA,
            8,
            42.5,
            getTalentMultiplier(talentMultiplierMap, AYAKA_ATTACK_GROUP_ID, TALENT_START_LEVEL, 0),
          ),
        ],
        seconds: 22 / 60,
        targetingArea: SWORD_TARGETING_AREA,
      },
      {
        hits: [
          createStrikeHit(
            SECOND_STRIKE_HIT_AREA,
            10,
            44.1,
            getTalentMultiplier(talentMultiplierMap, AYAKA_ATTACK_GROUP_ID, TALENT_START_LEVEL, 1),
          ),
        ],
        seconds: 20 / 60,
        targetingArea: SWORD_TARGETING_AREA,
      },
      {
        hits: [
          createStrikeHit(
            THIRD_STRIKE_HIT_AREA,
            16,
            55.2,
            getTalentMultiplier(talentMultiplierMap, AYAKA_ATTACK_GROUP_ID, TALENT_START_LEVEL, 2),
          ),
        ],
        seconds: 32 / 60,
        targetingArea: SWORD_TARGETING_AREA,
      },
      {
        hits: [8, 15, 22].map((hitmarkFrames) =>
          createStrikeHit(
            FOURTH_STRIKE_HIT_AREA,
            hitmarkFrames,
            19.68,
            getTalentMultiplier(talentMultiplierMap, AYAKA_ATTACK_GROUP_ID, TALENT_START_LEVEL, 3),
          ),
        ),
        seconds: 23 / 60,
        targetingArea: SWORD_TARGETING_AREA,
      },
      {
        hits: [
          createStrikeHit(
            FIFTH_STRIKE_HIT_AREA,
            27,
            74.1,
            getTalentMultiplier(talentMultiplierMap, AYAKA_ATTACK_GROUP_ID, TALENT_START_LEVEL, 6),
          ),
        ],
        seconds: 66 / 60,
        targetingArea: SWORD_TARGETING_AREA,
      },
    ],
    onSprint: ({ combatant, kitEffectState }) =>
      addKitEffect(kitEffectState, {
        characterId: combatant.characterId,
        element: Element.Cryo,
        kind: "infusion",
        secondsRemaining: SENHO_INFUSION_SECONDS,
      }),
    // The collision's poise is the wiki's 25, and it applies no gauge of its own, 0U, as the wiki's table gives
    plungeCollision: {
      gauge: 0,
      hitArea: PLUNGE_COLLISION_HIT_AREA,
      hitmarkSeconds: 0,
      poiseDamage: 25,
      talentMultiplier: getTalentMultiplier(talentMultiplierMap, AYAKA_ATTACK_GROUP_ID, TALENT_START_LEVEL, 9),
    },
    // The wiki's and the skill table's 10 seconds, which gcsim's 600 frames give too
    skillCooldownSeconds: 10,
  };
};
