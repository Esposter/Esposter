import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";
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

import { AttackTag } from "#src/models/combat/AttackTag";
import { AuraType } from "#src/models/combat/AuraType";
import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { addEnemyStatus } from "#src/services/enemy/addEnemyStatus";
import { UNBOUNDED_FIELD_RADIUS } from "#src/services/kit/constants";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { checkHasKitStatus } from "#src/services/kit/effects/checkHasKitStatus";
import { createKitSummon } from "#src/services/kit/effects/createKitSummon";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";
import { healPartyMember } from "#src/services/party/healPartyMember";
import { reviveParty } from "#src/services/party/reviveParty";

// Qiqi's proud skill groups, read at her talent level. The attack group holds the five strikes at 0 to 4, the third and
// Fourth strikes each of two hits at one index, the charged attack's two slashes at 5 and its stamina at 6, and the
// Plunges' collision, low and high at 7, 8 and 9. The skill group holds the regeneration on hit's ATK share at 0 and its
// Flat HP at 1, the continuous regeneration's ATK share at 2 and flat HP at 3, Herald of Frost's damage at 4, its duration
// At 5, its cooldown at 6 and its initial damage at 7. The burst group holds the Talisman's heal's ATK share at 0 and its
// Flat HP at 1, its damage at 2, its seconds at 3, its cooldown at 4 and its energy cost at 5
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

// The Fortune-Preserving Talisman on an enemy: damage it takes from the character on the field heals that character, at
// Most once a second for each enemy. Measured: gcsim v2.47.2 (MIT) qiqi/burst.go, and the wiki's notes that the active
// Character's own hits alone heal and that the burst's Talisman lands before its damage
// https://genshin-impact.fandom.com/wiki/Adeptus_Art:_Preserver_of_Fortune
const TALISMAN_STATUS_ID = "qiqi-talisman";
const TALISMAN_HEAL_COOLDOWN_STATUS_ID = "qiqi-talisman-heal-cooldown";
const TALISMAN_HEAL_COOLDOWN_SECONDS = 1;
// A Glimpse into Arcanum, from Ascension 4: Qiqi's Normal and Charged Attacks give the enemy they hit a Talisman of 6
// Seconds on a 50% roll, at most once every 30 seconds, unless it holds a longer one. Measured: gcsim v2.47.2 (MIT)
// Qiqi/burst.go. https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/qiqi/burst.go
const A_GLIMPSE_INTO_ARCANUM_ASCENSION = 4;
const A_GLIMPSE_INTO_ARCANUM_CHANCE = 0.5;
const A_GLIMPSE_INTO_ARCANUM_TALISMAN_SECONDS = 6;
const A_GLIMPSE_INTO_ARCANUM_COOLDOWN_STATUS_ID = "qiqi-a-glimpse-into-arcanum-cooldown";
const A_GLIMPSE_INTO_ARCANUM_COOLDOWN_SECONDS = 30;
// Ascetics of Frost, from one constellation: the Herald's hits on an enemy holding a Talisman give Qiqi 2 energy
const ASCETICS_OF_FROST_CONSTELLATION = 1;
const ASCETICS_OF_FROST_ENERGY = 2;
// Frozen to the Bone, from two constellations: Qiqi's Normal and Charged Attack DMG against an enemy with Cryo on it,
// Or frozen, is raised by 15%
const FROZEN_TO_THE_BONE_CONSTELLATION = 2;
const FROZEN_TO_THE_BONE_DAMAGE_BONUS = 0.15;
// Divine Suppression, from four constellations: an enemy holding a Talisman strikes with 20% less ATK
const DIVINE_SUPPRESSION_CONSTELLATION = 4;
const DIVINE_SUPPRESSION_ATTACK_REDUCTION = 0.2;
// Rite of Resurrection, from six constellations: the burst revives the fallen members of the deployed team at 50% of
// Their Max HP, at most once every 15 minutes
const RITE_OF_RESURRECTION_CONSTELLATION = 6;
const RITE_OF_RESURRECTION_HEALTH_SHARE = 0.5;
const RITE_OF_RESURRECTION_COOLDOWN_STATUS_ID = "qiqi-rite-of-resurrection-cooldown";
const RITE_OF_RESURRECTION_COOLDOWN_SECONDS = 15 * 60;

// A Talisman for the seconds given, cutting the enemy's ATK from four constellations
const createTalisman = ({ constellationCount }: Combatant, secondsRemaining: number): EnemyStatus => ({
  ...(constellationCount >= DIVINE_SUPPRESSION_CONSTELLATION && {
    attackReduction: DIVINE_SUPPRESSION_ATTACK_REDUCTION,
  }),
  damageTakenBonus: 0,
  id: TALISMAN_STATUS_ID,
  secondsRemaining,
});

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
// Its swipes and its regeneration, and Fortune-Preserving Talisman's damage and the Talisman it marks enemies with, whose
// Heal, A Glimpse into Arcanum and the constellations answer the kit's events. Its multipliers are read from her proud
// Skill groups. Life-Prolonging Methods is not built, as no heal reads an Incoming Healing Bonus
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
  const talismanHealAttackShare = getTalentMultiplier(talentMultiplierMap, QIQI_BURST_GROUP_ID, TALENT_START_LEVEL, 0);
  const talismanHealHealth = getTalentMultiplier(talentMultiplierMap, QIQI_BURST_GROUP_ID, TALENT_START_LEVEL, 1);
  const talismanSeconds = getTalentMultiplier(talentMultiplierMap, QIQI_BURST_GROUP_ID, TALENT_START_LEVEL, 3);
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
    // The Talisman goes on each enemy the burst strikes before its damage, so the burst's own hit heals Qiqi. From six
    // Constellations the burst revives the fallen members, a step after it starts
    elementalBurst: {
      hits: [
        {
          element: Element.Cryo,
          enemyStatus: (combatant) => createTalisman(combatant, talismanSeconds),
          gauge: 2,
          hitArea: BURST_HIT_AREA,
          hitmarkSeconds: BURST_HITMARK_FRAMES / 60,
          poiseDamage: BURST_POISE_DAMAGE,
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, QIQI_BURST_GROUP_ID, TALENT_START_LEVEL, 2),
        },
      ],
      onStart: ({ body, combatant: { characterId, constellationCount }, kitEffectState }) => {
        if (
          constellationCount < RITE_OF_RESURRECTION_CONSTELLATION ||
          checkHasKitStatus(kitEffectState.effects, characterId, RITE_OF_RESURRECTION_COOLDOWN_STATUS_ID)
        )
          return;
        addKitEffect(kitEffectState, {
          characterId,
          id: RITE_OF_RESURRECTION_COOLDOWN_STATUS_ID,
          kind: "status",
          secondsRemaining: RITE_OF_RESURRECTION_COOLDOWN_SECONDS,
        });
        addKitEffect(kitEffectState, {
          centre: { x: body.position.x, z: body.position.z },
          characterId,
          kind: "field",
          nextTickSeconds: 0,
          onTick: ({ party }) => reviveParty(party, RITE_OF_RESURRECTION_HEALTH_SHARE),
          radius: UNBOUNDED_FIELD_RADIUS,
          // The field lives a tenth of a second past its tick, so the step that runs it still has it
          secondsRemaining: 0.1,
          tickIndex: 0,
          tickIntervalSeconds: Number.POSITIVE_INFINITY,
        });
      },
      seconds: BURST_ANIMATION_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    elementalSkill: {
      hits: [],
      onStart: ({ body, combatant, kitEffectState }) => castHerald(body, combatant, kitEffectState),
      seconds: HERALD_ANIMATION_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    getStrikeDamageBonus: ({ attackTag, combatant }, { elementalState: { auras } }) =>
      combatant.constellationCount >= FROZEN_TO_THE_BONE_CONSTELLATION &&
      (attackTag === AttackTag.NormalAttack || attackTag === AttackTag.ChargedAttack) &&
      (auras.has(AuraType.Cryo) || auras.has(AuraType.Freeze))
        ? FROZEN_TO_THE_BONE_DAMAGE_BONUS
        : 0,
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
    // Damage an enemy holding a Talisman takes from the character on the field heals that character, a Normal or Charged
    // Attack of Qiqi's may give the enemy a Talisman from Ascension 4, and the Herald's hits on it give her energy from
    // One constellation
    onKitEvent: (event, { activeCombatant, combatant, kitEffectState, party, random }) => {
      if (event.kind !== KitEventKind.DamageTaken) return;
      const { attackTag, enemy, hit, striker } = event;
      const { ascension, characterId, constellationCount } = combatant;
      const talisman = enemy.statuses.find(({ id }) => id === TALISMAN_STATUS_ID);
      if (
        talisman &&
        striker.characterId === activeCombatant.characterId &&
        !enemy.statuses.some(({ id }) => id === TALISMAN_HEAL_COOLDOWN_STATUS_ID)
      ) {
        addEnemyStatus(enemy, {
          damageTakenBonus: 0,
          id: TALISMAN_HEAL_COOLDOWN_STATUS_ID,
          secondsRemaining: TALISMAN_HEAL_COOLDOWN_SECONDS,
        });
        healPartyMember(
          party,
          striker.characterId,
          (talismanHealHealth + talismanHealAttackShare * combatant.attributes.attack) / striker.attributes.maxHealth,
        );
      }

      if (striker.characterId !== characterId) return;
      if (talisman && constellationCount >= ASCETICS_OF_FROST_CONSTELLATION && heraldHits.includes(hit))
        gainPartyMemberEnergy(party, combatant, ASCETICS_OF_FROST_ENERGY);
      if (
        ascension < A_GLIMPSE_INTO_ARCANUM_ASCENSION ||
        (attackTag !== AttackTag.NormalAttack && attackTag !== AttackTag.ChargedAttack) ||
        checkHasKitStatus(kitEffectState.effects, characterId, A_GLIMPSE_INTO_ARCANUM_COOLDOWN_STATUS_ID) ||
        random() >= A_GLIMPSE_INTO_ARCANUM_CHANCE ||
        (talisman?.secondsRemaining ?? 0) >= A_GLIMPSE_INTO_ARCANUM_TALISMAN_SECONDS
      )
        return;
      addEnemyStatus(enemy, createTalisman(combatant, A_GLIMPSE_INTO_ARCANUM_TALISMAN_SECONDS));
      addKitEffect(kitEffectState, {
        characterId,
        id: A_GLIMPSE_INTO_ARCANUM_COOLDOWN_STATUS_ID,
        kind: "status",
        secondsRemaining: A_GLIMPSE_INTO_ARCANUM_COOLDOWN_SECONDS,
      });
    },
    plungeCollision: {
      hitArea: PLUNGE_COLLISION_HIT_AREA,
      hitmarkSeconds: 0,
      poiseDamage: PLUNGE_COLLISION_POISE_DAMAGE,
      talentMultiplier: getTalentMultiplier(talentMultiplierMap, QIQI_ATTACK_GROUP_ID, TALENT_START_LEVEL, 7),
    },
    skillCooldownSeconds: getTalentMultiplier(talentMultiplierMap, QIQI_SKILL_GROUP_ID, TALENT_START_LEVEL, 6),
  };
};
