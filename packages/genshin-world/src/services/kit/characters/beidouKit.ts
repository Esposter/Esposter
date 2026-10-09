import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitHit } from "#src/models/kit/KitHit";

import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";
import { takeOne } from "@esposter/shared";

// Beidou's proud skill groups, read at her talent level. The attack group holds the five strikes at 0 to 4, the charged
// Attack's cyclic and final slashes at 5 and 6 and its stamina a second at 7, and the plunges' collision, low and high at
// 9, 10 and 11. The skill group holds the shield's share of her Max HP at 0 and its flat HP at 1, Tidecaller's base
// Damage at 2 and its cooldown at 4. The burst group holds Stormbreaker at 0, its lightning discharge at 1, the
// Thunderbeast's Targe's seconds at 3, and the burst's cooldown and energy cost at 4 and 5
const BEIDOU_ATTACK_GROUP_ID = 2431;
const BEIDOU_SKILL_GROUP_ID = 2432;
const BEIDOU_BURST_GROUP_ID = 2439;

// Measured: gcsim v2.47.2 (MIT) beidou/attack.go, the first strike's fan of 270 degrees and radius 2 centred half a metre
// Ahead, the third's circle of radius 2 and the fourth's fan of 270 degrees and radius 2 centred a metre ahead, each
// Priced as its offset plus its radius. The second's box 2 wide and 2.5 long from the body and the fifth's 2 wide and 3
// Long from half a metre behind both reach 2.5 metres ahead, as gcsim spawns a box on its near edge, so each is priced as
// The circle to that far corner
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/beidou/attack.go
const FIRST_STRIKE_HIT_AREA: AttackArea = Object.freeze({ angle: (3 * Math.PI) / 2, height: 2, radius: 0.5 + 2 });
const BOX_STRIKE_HIT_AREA: AttackArea = Object.freeze({
  angle: 2 * Math.PI,
  height: 2,
  radius: Math.hypot(2.5, 2 / 2),
});
const THIRD_STRIKE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1 + 2 });
const FOURTH_STRIKE_HIT_AREA: AttackArea = Object.freeze({ angle: (3 * Math.PI) / 2, height: 2, radius: 1 + 2 });
// Measured: gcsim v2.47.2 (MIT) beidou/config.yml, the charged attack's spinning circle of radius 3 centred 0.3 metres
// Ahead and its final circle of radius 3.5, both marked not yet implemented there
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/beidou/config.yml
const CHARGED_CYCLIC_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 0.3 + 3 });
const CHARGED_FINAL_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 3.5 });
// Provisional: gcsim has no plunge file for Beidou, so the plunges' reach is Jean's and Mona's until one measures it
const PLUNGE_COLLISION_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1 });
const LOW_PLUNGE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 3 });
const HIGH_PLUNGE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 5 });
// Measured: gcsim v2.47.2 (MIT) beidou/skill.go, Tidecaller's base circle of radius 6 round the body
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/beidou/skill.go
const TIDECALLER_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 6 });
// Measured: gcsim v2.47.2 (MIT) beidou/burst.go, Stormbreaker's circle of radius 4 round the body, and Bane of Evil's of 5
// Round the body on the field
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/beidou/burst.go
const STORMBREAKER_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 4 });
const BANE_OF_EVIL_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 5 });
// Provisional: the reach the targeting reads for the strikes, the skill and the burst, as the Traveler's are
const STRIKE_TARGETING_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 6, radius: 5 });
const SKILL_TARGETING_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 10, radius: 15 });

// Measured: gcsim v2.47.2 (MIT) beidou/attack.go, each strike's hitmark and the animation that ends it at 60 fps. Each
// Strike's poise is the wiki's Oceanborne advanced properties
const BEIDOU_STRIKES = [
  { frames: 31, hitArea: FIRST_STRIKE_HIT_AREA, hitmarkFrames: 23, poiseDamage: 85.67 },
  { frames: 36, hitArea: BOX_STRIKE_HIT_AREA, hitmarkFrames: 22, poiseDamage: 85.33 },
  { frames: 54, hitArea: THIRD_STRIKE_HIT_AREA, hitmarkFrames: 45, poiseDamage: 106.37 },
  { frames: 36, hitArea: FOURTH_STRIKE_HIT_AREA, hitmarkFrames: 25, poiseDamage: 104.19 },
  { frames: 96, hitArea: BOX_STRIKE_HIT_AREA, hitmarkFrames: 43, poiseDamage: 135.12 },
];

// Measured: gcsim v2.47.2 (MIT) beidou/skill.go, Tidecaller's hit at 23 frames, which its shield stands until, and the
// Animation's 45
const TIDECALLER_HITMARK_FRAMES = 23;
// Stormbreaker's Thunderbeast's Targe discharges at most once a second, as the wiki's Stormbreaker and gcsim v2.47.2
// (MIT) beidou/burst.go give it, landing a frame past the hit that set it off
// https://genshin-impact.fandom.com/wiki/Stormbreaker
const DISCHARGE_INTERVAL_SECONDS = 1;
// Bane of Evil, from six constellations, takes 15% off the Electro RES of the enemies round the body on the field while
// Stormbreaker stands, as the wiki's constellation page gives it, and gcsim v2.47.2 (MIT) beidou/burst.go gives the
// Enemies within 5 metres of it the cut for 90 frames, every 30 frames from 30 past the burst
// https://genshin-impact.fandom.com/wiki/Bane_of_Evil
const BANE_OF_EVIL_CONSTELLATION = 6;
const BANE_OF_EVIL_INTERVAL_FRAMES = 30;
const BANE_OF_EVIL_STATUS: EnemyStatus = {
  damageTakenBonus: 0,
  id: "beidou-bane-of-evil",
  resistanceReduction: { [Element.Electro]: 0.15 },
  secondsRemaining: 90 / 60,
};

// Whether an effect is the Thunderbeast's Targe of a character's, still standing the given seconds from now: the Targe
// Is her summon that follows the body on the field
const checkIsTargeStanding = (effect: KitEffect, characterId: number, seconds: number): boolean =>
  effect.kind === "summon" &&
  effect.isFollowing === true &&
  effect.combatant.characterId === characterId &&
  effect.secondsRemaining >= seconds;

// Beidou's first kit, at talent level 1: five strikes, a charged attack, a collision and two plunges, Tidecaller's press
// With its shield, and Stormbreaker with its Thunderbeast's Targe and the lightning it discharges. Its multipliers are
// Read from her proud skill groups
export const createBeidouKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const targeSeconds = getTalentMultiplier(talentMultiplierMap, BEIDOU_BURST_GROUP_ID, TALENT_START_LEVEL, 3);
  // A claymore's strikes are physical and blunt under the Normal Attack internal cooldown
  const strikeHits = BEIDOU_STRIKES.map(({ hitArea, hitmarkFrames, poiseDamage }, index): KitHit => ({
    hitArea,
    hitmarkSeconds: hitmarkFrames / 60,
    internalCooldownTag: InternalCooldownTag.NormalAttack,
    isBlunt: true,
    poiseDamage,
    talentMultiplier: getTalentMultiplier(talentMultiplierMap, BEIDOU_ATTACK_GROUP_ID, TALENT_START_LEVEL, index),
  }));
  // Provisional: gcsim does not model the charged attack and the wiki's table gives no frames for it, so its two slashes
  // Land at half a second and a second, as Diluc's and Razor's do, until a recording measures them. The wiki's Oceanborne
  // Gives the cyclic slash 60 poise and the final 120, both blunt under the Normal Attack internal cooldown
  const chargedAttackHits: KitHit[] = [
    {
      hitArea: CHARGED_CYCLIC_HIT_AREA,
      hitmarkSeconds: 0.5,
      internalCooldownTag: InternalCooldownTag.NormalAttack,
      isBlunt: true,
      poiseDamage: 60,
      talentMultiplier: getTalentMultiplier(talentMultiplierMap, BEIDOU_ATTACK_GROUP_ID, TALENT_START_LEVEL, 5),
    },
    {
      hitArea: CHARGED_FINAL_HIT_AREA,
      hitmarkSeconds: 1,
      internalCooldownTag: InternalCooldownTag.NormalAttack,
      isBlunt: true,
      poiseDamage: 120,
      talentMultiplier: getTalentMultiplier(talentMultiplierMap, BEIDOU_ATTACK_GROUP_ID, TALENT_START_LEVEL, 6),
    },
  ];
  // The Targe's lightning discharge beside each hit of her strikes and charged attack. The wiki's Stormbreaker gives it
  // 1U of Electro under the Elemental Burst internal cooldown and 50 poise. gcsim chains it from the enemy struck to a
  // Random other within 8 metres, which an area cannot pick, so it reaches what its hit reaches
  const dischargeMultiplier = getTalentMultiplier(talentMultiplierMap, BEIDOU_BURST_GROUP_ID, TALENT_START_LEVEL, 1);
  const hitDischargeMap = new Map(
    [...strikeHits, ...chargedAttackHits].map((hit): [KitHit, KitHit] => [
      hit,
      {
        element: Element.Electro,
        gauge: 1,
        hitArea: hit.hitArea,
        hitmarkSeconds: hit.hitmarkSeconds + 1 / 60,
        internalCooldownTag: InternalCooldownTag.ElementalBurst,
        poiseDamage: 50,
        talentMultiplier: dischargeMultiplier,
      },
    ]),
  );
  const dischargeHits = new Set(hitDischargeMap.values());
  // Casts a discharge where Beidou stands beside each of an action's hits whose hitmark her Targe still stands at, unless
  // An earlier discharge's second runs past it. Each is a summon standing until a second past its hit, so it marks that
  // Second as it stands
  const castDischarges = (
    { facing, height, position }: KitBody,
    combatant: Combatant,
    kitEffectState: KitEffectState,
    hits: readonly KitHit[],
  ): void => {
    for (const hit of hits) {
      const discharge = hitDischargeMap.get(hit);
      const { effects } = kitEffectState;
      if (
        discharge === undefined ||
        !effects.some((effect) => checkIsTargeStanding(effect, combatant.characterId, hit.hitmarkSeconds)) ||
        effects.some(
          (effect) =>
            effect.kind === "summon" &&
            effect.secondsRemaining > hit.hitmarkSeconds &&
            effect.hits.some((summonHit) => dischargeHits.has(summonHit)),
        )
      )
        continue;
      addKitEffect(kitEffectState, {
        body: { facing, height, position: { x: position.x, z: position.z } },
        combatant,
        elapsedSeconds: 0,
        hits: [discharge],
        kind: "summon",
        secondsRemaining: hit.hitmarkSeconds + DISCHARGE_INTERVAL_SECONDS,
      });
    }
  };
  // From six constellations, the Targe lands Bane of Evil's cut every 30 frames for its seconds, a hit of no damage, poise
  // Or element that gives each enemy round the body on the field its Electro RES cut
  const baneOfEvilTicks = Array.from(
    { length: Math.floor((targeSeconds * 60) / BANE_OF_EVIL_INTERVAL_FRAMES) },
    (_value, index): KitHit => ({
      enemyStatus: () => BANE_OF_EVIL_STATUS,
      hitArea: BANE_OF_EVIL_HIT_AREA,
      hitmarkSeconds: (BANE_OF_EVIL_INTERVAL_FRAMES * (index + 1)) / 60,
      poiseDamage: 0,
      talentMultiplier: 0,
    }),
  );
  const normalAttacks = BEIDOU_STRIKES.map(({ frames }, index): KitAction => {
    const hits = [takeOne(strikeHits, index)];
    return {
      hits,
      onStart: ({ body, combatant, kitEffectState }) => castDischarges(body, combatant, kitEffectState, hits),
      seconds: frames / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    };
  });
  return {
    burstCooldownSeconds: getTalentMultiplier(talentMultiplierMap, BEIDOU_BURST_GROUP_ID, TALENT_START_LEVEL, 4),
    burstEnergyCost: getTalentMultiplier(talentMultiplierMap, BEIDOU_BURST_GROUP_ID, TALENT_START_LEVEL, 5),
    chargedAttack: {
      hits: chargedAttackHits,
      onStart: ({ body, combatant, kitEffectState }) =>
        castDischarges(body, combatant, kitEffectState, chargedAttackHits),
      // Provisional: it ends at a second and a fifth, as Diluc's and Razor's do
      seconds: 1.2,
      // The table's stamina a second for the spin, 40, drained while the charge plays, as Diluc's is
      staminaPerSecond: getTalentMultiplier(talentMultiplierMap, BEIDOU_ATTACK_GROUP_ID, TALENT_START_LEVEL, 7),
      targetingArea: STRIKE_TARGETING_AREA,
    },
    // The charge needs no stamina to start and spends none at once, since its stamina is drained as it plays
    chargedAttackStamina: 0,
    // Measured: gcsim v2.47.2 (MIT) beidou/burst.go, the hit at 28 frames and the animation's 58. The wiki's Stormbreaker
    // Gives it 4U of Electro with no internal cooldown and 400 poise. The Thunderbeast's Targe stands from the cast for the
    // Group's seconds as a summon that follows the body on the field, whoever it is, as the wiki's notes give it
    elementalBurst: {
      hits: [
        {
          element: Element.Electro,
          gauge: 4,
          hitArea: STORMBREAKER_HIT_AREA,
          hitmarkSeconds: 28 / 60,
          poiseDamage: 400,
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, BEIDOU_BURST_GROUP_ID, TALENT_START_LEVEL, 0),
        },
      ],
      onStart: ({ body: { facing, height, position }, combatant, kitEffectState }) =>
        addKitEffect(kitEffectState, {
          body: { facing, height, position: { x: position.x, z: position.z } },
          combatant,
          elapsedSeconds: 0,
          hits: combatant.constellationCount >= BANE_OF_EVIL_CONSTELLATION ? baneOfEvilTicks : [],
          isFollowing: true,
          kind: "summon",
          secondsRemaining: targeSeconds,
        }),
      seconds: 58 / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    // The wiki's Tidecaller gives the press 2U of Electro with no internal cooldown and 100 poise, blunt. Its Electro
    // Shield is set at the press, of the group's share of Beidou's Max HP plus its flat HP, and stands until the hit, as
    // Gcsim's does
    elementalSkill: {
      hits: [
        {
          element: Element.Electro,
          gauge: 2,
          hitArea: TIDECALLER_HIT_AREA,
          hitmarkSeconds: TIDECALLER_HITMARK_FRAMES / 60,
          isBlunt: true,
          poiseDamage: 100,
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, BEIDOU_SKILL_GROUP_ID, TALENT_START_LEVEL, 2),
        },
      ],
      onStart: ({ combatant, kitEffectState }) =>
        addKitEffect(kitEffectState, {
          characterId: combatant.characterId,
          element: Element.Electro,
          health:
            getTalentMultiplier(talentMultiplierMap, BEIDOU_SKILL_GROUP_ID, TALENT_START_LEVEL, 0) *
              combatant.attributes.maxHealth +
            getTalentMultiplier(talentMultiplierMap, BEIDOU_SKILL_GROUP_ID, TALENT_START_LEVEL, 1),
          kind: "shield",
          secondsRemaining: TIDECALLER_HITMARK_FRAMES / 60,
        }),
      seconds: 45 / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    // Provisional: gcsim has no plunge file for Beidou and no source gives her plunges' landing frames, so each hits as its
    // Action starts, as Jean's do. The wiki's Oceanborne gives them 150 and 200 poise, both blunt
    highPlunge: {
      hits: [
        {
          hitArea: HIGH_PLUNGE_HIT_AREA,
          hitmarkSeconds: 0,
          isBlunt: true,
          poiseDamage: 200,
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, BEIDOU_ATTACK_GROUP_ID, TALENT_START_LEVEL, 11),
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
          isBlunt: true,
          poiseDamage: 150,
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, BEIDOU_ATTACK_GROUP_ID, TALENT_START_LEVEL, 10),
        },
      ],
      seconds: 0.4,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    normalAttacks,
    // The collision's poise is the wiki's 35, and it applies no gauge of its own, 0U, as the wiki's table gives
    plungeCollision: {
      gauge: 0,
      hitArea: PLUNGE_COLLISION_HIT_AREA,
      hitmarkSeconds: 0,
      poiseDamage: 35,
      talentMultiplier: getTalentMultiplier(talentMultiplierMap, BEIDOU_ATTACK_GROUP_ID, TALENT_START_LEVEL, 9),
    },
    // The group's, the wiki's and gcsim's 7.5 seconds
    skillCooldownSeconds: getTalentMultiplier(talentMultiplierMap, BEIDOU_SKILL_GROUP_ID, TALENT_START_LEVEL, 4),
  };
};
