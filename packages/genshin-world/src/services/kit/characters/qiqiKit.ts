import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitFieldTick } from "#src/models/kit/KitFieldTick";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitPartyHeal } from "#src/models/kit/KitPartyHeal";

import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { UNBOUNDED_FIELD_RADIUS } from "#src/services/kit/constants";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { createKitSummon } from "#src/services/kit/effects/createKitSummon";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";
import { healPartyMember } from "#src/services/party/healPartyMember";

// Qiqi's proud skill groups, read at her talent level. The attack group holds the five strikes at 0 to 4, the third and
// Fourth strikes each of two hits at one index, the charged attack's two slashes at 5 and its stamina at 6, and the
// Plunges' collision, low and high at 7, 8 and 9. The skill group holds the regeneration on hit's ATK share at 0 and its
// Flat HP at 1, the continuous regeneration's ATK share at 2 and flat HP at 3, Herald of Frost's damage at 4, its duration
// At 5, its cooldown at 6 and its initial damage at 7. The burst group holds the Talisman's damage at 0, its cooldown at 4
// And its energy cost at 5; its regeneration and seconds at 1 to 3 wait for the Talisman
const QIQI_ATTACK_GROUP_ID = 3531;
const QIQI_SKILL_GROUP_ID = 3532;
const QIQI_BURST_GROUP_ID = 3539;

// Measured: gcsim v2.47.2 (MIT) qiqi/attack.go, each strike's circle or box as priced from the body: a circle is its offset
// Plus its radius, and a box spawns on its near edge, so it is priced as the circle to its far corner. The third strike's
// First hit is a fan of 30 degrees
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/qiqi/attack.go
const FIRST_STRIKE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 0.8 + 1.2 });
const SECOND_STRIKE_HIT_AREA: AttackArea = Object.freeze({
  angle: 2 * Math.PI,
  height: 2,
  radius: Math.hypot(2.2, 1.4 / 2),
});
const THIRD_STRIKE_FAN_HIT_AREA: AttackArea = Object.freeze({ angle: Math.PI / 6, height: 2, radius: 1 + 1.6 });
const THIRD_STRIKE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 0.6 + 1.6 });
const FOURTH_STRIKE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 0.6 + 1.6 });
const FIFTH_STRIKE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1 + 2.2 });
// Measured: gcsim v2.47.2 (MIT) qiqi/charge.go, the first slash of radius 2 half a metre ahead and the second of radius
// 2.8 a metre ahead, each priced as its offset plus its radius
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/qiqi/charge.go
const CHARGED_FIRST_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 0.5 + 2 });
const CHARGED_SECOND_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1 + 2.8 });
// Measured: gcsim v2.47.2 (MIT) qiqi/skill.go, Herald of Frost's initial damage and its swipes, each a circle of radius 2.5
// Round the body, the swipes following it
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/qiqi/skill.go
const HERALD_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 2.5 });
// Measured: gcsim v2.47.2 (MIT) qiqi/burst.go, Fortune-Preserving Talisman's circle of radius 7 round the body
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/qiqi/burst.go
const BURST_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 7 });
// Measured: gcsim v2.47.2 (MIT) qiqi/plunge.go, the collision's circle of radius 1 a metre ahead, and the low and high
// Plunges' of 3 and 5 a metre ahead, each priced as its offset plus its radius
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/qiqi/plunge.go
const PLUNGE_COLLISION_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1 + 1 });
const LOW_PLUNGE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1 + 3 });
const HIGH_PLUNGE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1 + 5 });
// Provisional: the reach the targeting reads for the strikes, the skill and the burst, as the other kits' are
const STRIKE_TARGETING_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 6, radius: 5 });
const SKILL_TARGETING_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 10, radius: 15 });

// Measured: gcsim v2.47.2 (MIT) qiqi/attack.go, each strike's hitmarks and animation at 60 fps. The wiki's Ancient Sword Art
// Advanced properties give each hit's poise, as gcsim gives none. Each strike's hits are physical slashes
const QIQI_STRIKES = [
  {
    animationFrames: 21,
    hits: [{ groupIndex: 0, hitArea: FIRST_STRIKE_HIT_AREA, hitmarkFrames: 11, poiseDamage: 25.2 }],
  },
  {
    animationFrames: 22,
    hits: [{ groupIndex: 1, hitArea: SECOND_STRIKE_HIT_AREA, hitmarkFrames: 10, poiseDamage: 27.9 }],
  },
  {
    animationFrames: 33,
    hits: [
      { groupIndex: 2, hitArea: THIRD_STRIKE_FAN_HIT_AREA, hitmarkFrames: 9, poiseDamage: 35.1 },
      { groupIndex: 2, hitArea: THIRD_STRIKE_HIT_AREA, hitmarkFrames: 20, poiseDamage: 12.6 },
    ],
  },
  {
    animationFrames: 28,
    hits: [
      { groupIndex: 3, hitArea: FOURTH_STRIKE_HIT_AREA, hitmarkFrames: 8, poiseDamage: 12.6 },
      { groupIndex: 3, hitArea: FOURTH_STRIKE_HIT_AREA, hitmarkFrames: 18, poiseDamage: 12.6 },
    ],
  },
  {
    animationFrames: 53,
    hits: [{ groupIndex: 4, hitArea: FIFTH_STRIKE_HIT_AREA, hitmarkFrames: 16, poiseDamage: 68.6 }],
  },
];

// Measured: gcsim v2.47.2 (MIT) qiqi/charge.go, the charged attack's two slashes at 15 and 29 frames and its animation's
// 76. The wiki's advanced properties give each slash 63 poise
const CHARGED_ATTACK_FIRST_HITMARK_FRAMES = 15;
const CHARGED_ATTACK_SECOND_HITMARK_FRAMES = 29;
const CHARGED_ATTACK_ANIMATION_FRAMES = 76;
const CHARGED_ATTACK_POISE_DAMAGE = 63;

// Measured: gcsim v2.47.2 (MIT) qiqi/skill.go, Herald of Frost's press at its 32-frame hitmark, its swipes at 96, 231, 291,
// 426, 486, 621, 681, 816 and 876 frames (the cadence alternates 135 and 60 frames), its animation's 58, and its
// Regeneration ticking every 4.5 seconds from the hitmark, four times in all with the first. The skill lasts 15 seconds
const HERALD_ANIMATION_FRAMES = 58;
const HERALD_HITMARK_FRAMES = 32;
const HERALD_SWIPE_FRAMES = [96, 231, 291, 426, 486, 621, 681, 816, 876];
const HERALD_INITIAL_POISE_DAMAGE = 40;
const HERALD_SWIPE_POISE_DAMAGE = 80;
const REGENERATION_TICK_SECONDS = 4.5;

// Measured: gcsim v2.47.2 (MIT) qiqi/burst.go, the damage at 82 frames and the animation's 115. The wiki's advanced
// Properties give it 200 poise
const BURST_HITMARK_FRAMES = 82;
const BURST_ANIMATION_FRAMES = 115;
const BURST_POISE_DAMAGE = 200;

// Measured: gcsim v2.47.2 (MIT) qiqi/plunge.go, the low plunge's hitmark at 46 frames and animation's 76, the high's 46 and
// 77. The wiki's advanced properties give the low and high plunges 100 and 150 poise, as gcsim gives them, and the collision 25
const LOW_PLUNGE_HITMARK_FRAMES = 46;
const LOW_PLUNGE_ANIMATION_FRAMES = 76;
const HIGH_PLUNGE_HITMARK_FRAMES = 46;
const HIGH_PLUNGE_ANIMATION_FRAMES = 77;
const LOW_PLUNGE_POISE_DAMAGE = 100;
const HIGH_PLUNGE_POISE_DAMAGE = 150;
const PLUNGE_COLLISION_POISE_DAMAGE = 25;

// Whether a Herald of Frost that Qiqi cast stands: her following summon still on the field
const checkIsHeraldStanding = (characterId: number, effects: readonly KitEffect[]): boolean =>
  effects.some(
    (effect) =>
      effect.kind === "summon" &&
      effect.isFollowing === true &&
      effect.combatant.characterId === characterId &&
      effect.secondsRemaining > 0,
  );

// Regeneration on hit: a Normal or Charged Attack hit heals every member of the party while Herald of Frost stands, by
// Its flat HP plus a share of the striker's ATK. It is unshielded, so it rolls on each hit without a shield
const createRegenerationOnHit = (talentMultiplierMap: TalentMultiplierMap): KitPartyHeal => ({
  attackShare: getTalentMultiplier(talentMultiplierMap, QIQI_SKILL_GROUP_ID, TALENT_START_LEVEL, 0),
  chance: (striker, effects) => (checkIsHeraldStanding(striker.characterId, effects) ? 1 : 0),
  defenseShare: 0,
  flatHealth: getTalentMultiplier(talentMultiplierMap, QIQI_SKILL_GROUP_ID, TALENT_START_LEVEL, 1),
  isUnshielded: true,
});

// Qiqi's first kit, at talent level 1: five strikes, a charged attack, a collision and two plunges, and Herald of Frost with
// Its swipes and its regeneration, and Fortune-Preserving Talisman's damage. The Talisman's heal, its A4 and its
// Constellations wait for an event the kit does not see, a hit landing on the enemy the Talisman marks. Its multipliers
// Are read from her proud skill groups
export const createQiqiKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const regenerationOnHit = createRegenerationOnHit(talentMultiplierMap);
  const normalAttacks: KitAction[] = QIQI_STRIKES.map(({ animationFrames, hits }): KitAction => ({
    hits: hits.map(({ groupIndex, hitArea, hitmarkFrames, poiseDamage }): KitHit => ({
      healParty: regenerationOnHit,
      hitArea,
      hitmarkSeconds: hitmarkFrames / 60,
      internalCooldownTag: InternalCooldownTag.NormalAttack,
      poiseDamage,
      talentMultiplier: getTalentMultiplier(talentMultiplierMap, QIQI_ATTACK_GROUP_ID, TALENT_START_LEVEL, groupIndex),
    })),
    seconds: animationFrames / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  }));
  const chargedAttackTalentMultiplier = getTalentMultiplier(
    talentMultiplierMap,
    QIQI_ATTACK_GROUP_ID,
    TALENT_START_LEVEL,
    5,
  );
  // The skill's initial damage lands at its hitmark, and its swipes follow the body as Beidou's Targe does
  const heraldHits: KitHit[] = [
    {
      element: Element.Cryo,
      gauge: 1,
      hitArea: HERALD_HIT_AREA,
      hitmarkSeconds: HERALD_HITMARK_FRAMES / 60,
      // The wiki gives the initial damage the Elemental Skill New tag, which has no member here, so it shares the swipes'
      internalCooldownTag: InternalCooldownTag.ElementalSkill,
      poiseDamage: HERALD_INITIAL_POISE_DAMAGE,
      talentMultiplier: getTalentMultiplier(talentMultiplierMap, QIQI_SKILL_GROUP_ID, TALENT_START_LEVEL, 7),
    },
    ...HERALD_SWIPE_FRAMES.map((swipeFrames): KitHit => ({
      element: Element.Cryo,
      gauge: 1,
      hitArea: HERALD_HIT_AREA,
      hitmarkSeconds: swipeFrames / 60,
      internalCooldownTag: InternalCooldownTag.ElementalSkill,
      poiseDamage: HERALD_SWIPE_POISE_DAMAGE,
      talentMultiplier: getTalentMultiplier(talentMultiplierMap, QIQI_SKILL_GROUP_ID, TALENT_START_LEVEL, 4),
    })),
  ];
  const skillSeconds = getTalentMultiplier(talentMultiplierMap, QIQI_SKILL_GROUP_ID, TALENT_START_LEVEL, 5);
  // Continuous regeneration snapshots Qiqi's ATK on cast, as the wiki's note gives it, and heals the active character
  const createRegenerationTick =
    (combatant: Combatant): ((tick: KitFieldTick) => void) =>
    ({ activeCombatant, party }) => {
      const regenerationHealth =
        getTalentMultiplier(talentMultiplierMap, QIQI_SKILL_GROUP_ID, TALENT_START_LEVEL, 3) +
        getTalentMultiplier(talentMultiplierMap, QIQI_SKILL_GROUP_ID, TALENT_START_LEVEL, 2) *
          combatant.attributes.attack;
      healPartyMember(party, activeCombatant.characterId, regenerationHealth / activeCombatant.attributes.maxHealth);
    };
  // Herald of Frost is cast where Qiqi stands: its swipes follow her, and its regeneration ticks from the press
  const castHerald = (body: KitBody, combatant: Combatant, kitEffectState: KitEffectState): void => {
    addKitEffect(kitEffectState, { ...createKitSummon(body, combatant, heraldHits, skillSeconds), isFollowing: true });
    addKitEffect(kitEffectState, {
      centre: { x: body.position.x, z: body.position.z },
      characterId: combatant.characterId,
      kind: "field",
      nextTickSeconds: HERALD_HITMARK_FRAMES / 60,
      onTick: createRegenerationTick(combatant),
      radius: UNBOUNDED_FIELD_RADIUS,
      secondsRemaining: skillSeconds,
      tickIndex: 0,
      tickIntervalSeconds: REGENERATION_TICK_SECONDS,
    });
  };

  return {
    burstCooldownSeconds: getTalentMultiplier(talentMultiplierMap, QIQI_BURST_GROUP_ID, TALENT_START_LEVEL, 4),
    burstEnergyCost: getTalentMultiplier(talentMultiplierMap, QIQI_BURST_GROUP_ID, TALENT_START_LEVEL, 5),
    chargedAttack: {
      hits: [
        {
          healParty: regenerationOnHit,
          hitArea: CHARGED_FIRST_HIT_AREA,
          hitmarkSeconds: CHARGED_ATTACK_FIRST_HITMARK_FRAMES / 60,
          internalCooldownTag: InternalCooldownTag.NormalAttack,
          poiseDamage: CHARGED_ATTACK_POISE_DAMAGE,
          talentMultiplier: chargedAttackTalentMultiplier,
        },
        {
          healParty: regenerationOnHit,
          hitArea: CHARGED_SECOND_HIT_AREA,
          hitmarkSeconds: CHARGED_ATTACK_SECOND_HITMARK_FRAMES / 60,
          internalCooldownTag: InternalCooldownTag.NormalAttack,
          poiseDamage: CHARGED_ATTACK_POISE_DAMAGE,
          talentMultiplier: chargedAttackTalentMultiplier,
        },
      ],
      seconds: CHARGED_ATTACK_ANIMATION_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    chargedAttackStamina: getTalentMultiplier(talentMultiplierMap, QIQI_ATTACK_GROUP_ID, TALENT_START_LEVEL, 6),
    elementalBurst: {
      hits: [
        {
          element: Element.Cryo,
          gauge: 2,
          hitArea: BURST_HIT_AREA,
          hitmarkSeconds: BURST_HITMARK_FRAMES / 60,
          poiseDamage: BURST_POISE_DAMAGE,
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, QIQI_BURST_GROUP_ID, TALENT_START_LEVEL, 0),
        },
      ],
      seconds: BURST_ANIMATION_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    elementalSkill: {
      hits: [],
      onStart: ({ body, combatant, kitEffectState }) => castHerald(body, combatant, kitEffectState),
      seconds: HERALD_ANIMATION_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    highPlunge: {
      hits: [
        {
          hitArea: HIGH_PLUNGE_HIT_AREA,
          hitmarkSeconds: HIGH_PLUNGE_HITMARK_FRAMES / 60,
          poiseDamage: HIGH_PLUNGE_POISE_DAMAGE,
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, QIQI_ATTACK_GROUP_ID, TALENT_START_LEVEL, 9),
        },
      ],
      seconds: HIGH_PLUNGE_ANIMATION_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    lowPlunge: {
      hits: [
        {
          hitArea: LOW_PLUNGE_HIT_AREA,
          hitmarkSeconds: LOW_PLUNGE_HITMARK_FRAMES / 60,
          poiseDamage: LOW_PLUNGE_POISE_DAMAGE,
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, QIQI_ATTACK_GROUP_ID, TALENT_START_LEVEL, 8),
        },
      ],
      seconds: LOW_PLUNGE_ANIMATION_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    normalAttacks,
    plungeCollision: {
      hitArea: PLUNGE_COLLISION_HIT_AREA,
      hitmarkSeconds: 0,
      poiseDamage: PLUNGE_COLLISION_POISE_DAMAGE,
      talentMultiplier: getTalentMultiplier(talentMultiplierMap, QIQI_ATTACK_GROUP_ID, TALENT_START_LEVEL, 7),
    },
    skillCooldownSeconds: getTalentMultiplier(talentMultiplierMap, QIQI_SKILL_GROUP_ID, TALENT_START_LEVEL, 6),
  };
};
