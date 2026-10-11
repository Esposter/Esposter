import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitStance } from "#src/models/kit/KitStance";
import type { KitStatus } from "#src/models/kit/KitStatus";

import { Attribute } from "#src/models/character/Attribute";
import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA, UNBOUNDED_FIELD_RADIUS } from "#src/services/kit/constants";
import { createBoxReach } from "#src/services/kit/createBoxReach";
import { createFanReach } from "#src/services/kit/createFanReach";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { checkHasKitStatus } from "#src/services/kit/effects/checkHasKitStatus";
import { createKitSummon } from "#src/services/kit/effects/createKitSummon";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";
import { checkIsCharacterDown } from "#src/services/party/checkIsCharacterDown";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";
import { getPartyMember } from "#src/services/party/getPartyMember";

// The Raiden Shogun's proud skill groups, read at her talent level, each index matched to its level-1 value in the dm file
// Of gcsim (MIT), raiden/zz_raidenshogun.dm.go. The attack group holds the five strikes at 0 to 5, the fourth of two hits
// At 3 and 4, the charged attack at 6 and its stamina at 7, then the plunges' collision, low and high at 8, 9 and 10. The
// Skill group holds Eye of Stormy Judgment's hit at 0, its coordinated attack at 1, the Eye's seconds at 2, the Elemental
// Burst DMG Bonus it gives per point of a burst's energy cost at 3 and the skill's cooldown at 4. The burst group holds
// Musou no Hitotachi at 0, Resolve's bonus per stack to it at 1 and to Musou Isshin's attacks at 2, the stacks another
// Member's burst gives per point of energy at 3, Musou Isshin's five strikes at 4 to 9, the fourth of two hits at 7 and 8,
// Its charged attack's two hits at 10 and 11 and its stamina at 12, its plunges' collision, low and high at 13, 14 and 15,
// The energy its hits restore at 16, its seconds at 17, the burst's cooldown at 18 and its energy cost at 19. The plunges
// At 13 to 15 are not read, as the kit builds none
const RAIDEN_ATTACK_GROUP_ID = 5231;
const RAIDEN_SKILL_GROUP_ID = 5232;
const RAIDEN_BURST_GROUP_ID = 5239;

// Provisional: gcsim gives her strikes, charged attacks, skill, coordinated attacks, burst and collision no poise, so they
// Stand at 0 until a source gives them
const UNMEASURED_POISE_DAMAGE = 0;

// Measured: gcsim (MIT) raiden/attack.go, each polearm strike's hitmarks and animation, with its box priced to its far
// Corner and its circle at its offset plus its radius. The fourth strike's two circles are priced at the farther of them
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/raiden/attack.go
const NORMAL_ATTACKS = [
  { animationFrames: 24, hitArea: createBoxReach(-0.2, 1.8, 2.8), hits: [{ hitmarkFrames: 14, index: 0 }] },
  { animationFrames: 26, hitArea: createFanReach(270, 0.5 + 2.5), hits: [{ hitmarkFrames: 9, index: 1 }] },
  { animationFrames: 36, hitArea: createBoxReach(-1.2, 1.8, 4), hits: [{ hitmarkFrames: 14, index: 2 }] },
  {
    animationFrames: 57,
    hitArea: createFanReach(360, Math.hypot(0.5, 0.7) + 2.8),
    hits: [
      { hitmarkFrames: 14, index: 3 },
      { hitmarkFrames: 27, index: 4 },
    ],
  },
  { animationFrames: 50, hitArea: createFanReach(360, 3), hits: [{ hitmarkFrames: 34, index: 5 }] },
];

// Measured: gcsim (MIT) raiden/charge.go, the charged attack's box of 2.8 by 4.8 at 22 frames of 37
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/raiden/charge.go
const CHARGED_ATTACK_FRAMES = 37;
const CHARGED_ATTACK_HITMARK_FRAMES = 22;
const CHARGED_ATTACK_HIT_AREA = createBoxReach(-0.1, 2.8, 4.8);

// Measured: gcsim (MIT) raiden/plunge.go, the low plunge's circle of radius 3 at 47 frames of 96, the high plunge's of
// Radius 5 at 49 frames of 99, their poise of 100 and 150, and the collision's circle of radius 1, each centred a metre
// Ahead of the body and priced at that offset plus its radius
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/raiden/plunge.go
const LOW_PLUNGE_FRAMES = 96;
const LOW_PLUNGE_HITMARK_FRAMES = 47;
const LOW_PLUNGE_HIT_AREA = createFanReach(360, 1 + 3);
const LOW_PLUNGE_POISE_DAMAGE = 100;
const HIGH_PLUNGE_FRAMES = 99;
const HIGH_PLUNGE_HITMARK_FRAMES = 49;
const HIGH_PLUNGE_HIT_AREA = createFanReach(360, 1 + 5);
const HIGH_PLUNGE_POISE_DAMAGE = 150;
const PLUNGE_COLLISION_HIT_AREA = createFanReach(360, 1 + 1);

// Measured: gcsim (MIT) raiden/skill.go, Eye of Stormy Judgment's circle of radius 5 round the body at 51 frames, past the
// Animation's 37, so it lands from a summon cast at the body. The Eye reaches the deployed team 66 frames after the cast
// For the skill group's seconds, and a member holding it who deals damage sets off its coordinated attack, a circle of
// Radius 4 round the enemy struck 5 frames on, once every 0.9 seconds across the team
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/raiden/skill.go
const SKILL_FRAMES = 37;
const SKILL_HITMARK_FRAMES = 51;
const SKILL_HIT_AREA = createFanReach(360, 5);
const EYE_DELAY_FRAMES = 66;
const EYE_STATUS_ID = "raiden-eye";
const EYE_PENDING_FIELD_ID = "raiden-eye-pending";
const COORDINATED_ATTACK_HITMARK_FRAMES = 5;
const COORDINATED_ATTACK_HIT_AREA = createFanReach(360, 4);
const COORDINATED_ATTACK_ICD_SECONDS = 0.9;
const COORDINATED_ATTACK_ICD_ID = "raiden-eye-icd";

// Measured: gcsim (MIT) raiden/burst.go, Musou Shinsetsu's animation of 112 frames and Musou no Hitotachi's box of 13 by 8
// At 98 frames, and the Musou Isshin state from the cast until the burst group's seconds past that hit, which leaving
// The field ends. The Resolve stacks the burst spends raise both, and Musou Isshin's strikes restore the team's energy
// Once a second, five times a cast
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/raiden/burst.go
const BURST_FRAMES = 112;
const BURST_HITMARK_FRAMES = 98;
const BURST_HIT_AREA = createBoxReach(-0.1, 13, 8);
const RESOLVE_STATUS_ID = "raiden-resolve";
// Measured: gcsim (MIT) raiden/burst.go, the Resolve another member's burst gives her, the burst group's stacks per point of
// The energy that burst cost, raised by Constellation 1 by 80% for an Electro member's burst and 20% for any other's, and
// Resolve's cap of 60 stacks
const RESOLVE_MAX_STACKS = 60;
const CONSTELLATION_1 = 1;
const CONSTELLATION_1_ELECTRO_RESOLVE_MULTIPLIER = 1.8;
const CONSTELLATION_1_RESOLVE_MULTIPLIER = 1.2;
const RESTORE_ICD_SECONDS = 1;
const RESTORE_ICD_ID = "raiden-restore-icd";
const RESTORE_COUNT_ID = "raiden-restore-count";
const RESTORE_MAX_COUNT = 5;

// Measured: gcsim (MIT) raiden/attack.go and charge.go, each Musou Isshin strike's hitmarks, animation and box, and its
// Charged attack's two hits on a box of 7.5 by 8 at 24 and 32 frames of 56. A box set to one side is priced as one widened
// By that offset on each side, to its far corner
const MUSOU_ISSHIN_STRIKES = [
  { animationFrames: 21, hits: [{ hitArea: createBoxReach(-0.1, 3.8, 4.8), hitmarkFrames: 12, index: 4 }] },
  { animationFrames: 26, hits: [{ hitArea: createBoxReach(-1, 9.8 + 2 * 1, 4.5), hitmarkFrames: 13, index: 5 }] },
  { animationFrames: 34, hits: [{ hitArea: createBoxReach(-0.1, 3.2, 4.3), hitmarkFrames: 11, index: 6 }] },
  {
    animationFrames: 67,
    hits: [
      { hitArea: createBoxReach(0, 11 + 2 * 1, 6.6), hitmarkFrames: 22, index: 7 },
      { hitArea: createBoxReach(-1.5, 4.5 + 2 * 0.3, 8.5), hitmarkFrames: 33, index: 8 },
    ],
  },
  { animationFrames: 59, hits: [{ hitArea: createBoxReach(-0.1, 11, 5.5), hitmarkFrames: 33, index: 9 }] },
];
const MUSOU_ISSHIN_CHARGED_FRAMES = 56;
const MUSOU_ISSHIN_CHARGED_HIT_AREA = createBoxReach(-0.1, 7.5, 8);
const MUSOU_ISSHIN_CHARGED_HITS = [
  { hitmarkFrames: 24, index: 10 },
  { hitmarkFrames: 32, index: 11 },
];

// Measured: gcsim (MIT) raiden/asc.go, Ascension 1's 2 Resolve stacks as the party gains particles or orbs, once every 3
// Seconds
const ASCENSION_1 = 1;
const ASCENSION_1_RESOLVE_STACKS = 2;
const ASCENSION_1_ICD_SECONDS = 3;
const ASCENSION_1_ICD_ID = "raiden-a1-icd";
// Measured: gcsim (MIT) raiden/asc.go, Ascension 4's 0.6% more energy restored by Musou Isshin for each whole 1% of Energy
// Recharge past 100%, and its 0.4% Electro DMG Bonus for each 1% of it
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/raiden/asc.go
const ASCENSION_4 = 4;
const ASCENSION_4_RESTORE_BONUS_PER_PERCENT = 0.006;
const ASCENSION_4_ELECTRO_BONUS_PER_SHARE = 0.4;
// Measured: gcsim (MIT) raiden/cons.go, Constellation 4's 30% ATK for 10 seconds to the team but Raiden as Musou Isshin
// Ends, and Constellation 6's second off the other members' burst cooldowns on the strikes that restore energy
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/raiden/cons.go
const CONSTELLATION_4 = 4;
const CONSTELLATION_4_ATTACK_SHARE = 0.3;
const CONSTELLATION_4_SECONDS = 10;
const CONSTELLATION_4_SOURCE = "raiden-c4";
const CONSTELLATION_6 = 6;
const CONSTELLATION_6_COOLDOWN_SECONDS = 1;

// The stacks a status of the character's counts, none while it holds no status of the id
const countStatusStacks = (effects: readonly KitEffect[], characterId: number, id: string): number =>
  effects.find(
    (effect): effect is KitStatus => effect.kind === "status" && effect.characterId === characterId && effect.id === id,
  )?.stacks ?? 0;

// Adds Resolve stacks to those she holds, up to their cap, held until her burst spends them
const gainResolve = (kitEffectState: KitEffectState, characterId: number, stacks: number): void =>
  addKitEffect(kitEffectState, {
    characterId,
    id: RESOLVE_STATUS_ID,
    kind: "status",
    secondsRemaining: Number.POSITIVE_INFINITY,
    stacks: Math.min(
      countStatusStacks(kitEffectState.effects, characterId, RESOLVE_STATUS_ID) + stacks,
      RESOLVE_MAX_STACKS,
    ),
  });

// The Raiden Shogun's Musou Isshin, while it holds
const findMusouIsshin = (effects: readonly KitEffect[], characterId: number): KitStance | undefined =>
  effects.find((effect): effect is KitStance => effect.kind === "stance" && effect.characterId === characterId);

// Whether she holds the Eye, or her skill's field is about to give it
const checkHasEye = (effects: readonly KitEffect[], characterId: number): boolean =>
  checkHasKitStatus(effects, characterId, EYE_STATUS_ID) ||
  effects.some(
    (effect) => effect.kind === "field" && effect.characterId === characterId && effect.id === EYE_PENDING_FIELD_ID,
  );

// Ascension 4's Electro DMG Bonus, which a hit reads as it is priced, from her Energy Recharge past 100%
const getPassiveBonuses = (combatant: Combatant): { amount: number; attribute: Attribute }[] =>
  combatant.ascension < ASCENSION_4
    ? []
    : [
        {
          amount:
            ASCENSION_4_ELECTRO_BONUS_PER_SHARE *
            Math.max(combatant.attributes.attributeTotalMap[Attribute.EnergyRecharge] - 1, 0),
          attribute: Attribute.ElectroDamageBonus,
        },
      ];

export const RAIDEN_CHARACTER_ID = 10_000_052;

// The Raiden Shogun's first kit, at talent level 1: five strikes, a charged attack, a collision and two plunges, Eye of
// Stormy Judgment with its Eye and coordinated attacks, and Musou Shinsetsu, whose Musou Isshin stance plays her Electro
// Strikes and charged attack. Another member's burst gives her Resolve by its energy cost, and the burst spends her
// Resolve stacks into Musou no Hitotachi and every Musou Isshin attack, whose strikes restore the team's energy. The Eye's
// Elemental Burst DMG Bonus raises her own burst hits, read as the burst is cast. Ascension 1's Resolve from particles,
// Ascension 4 and Constellations 1, 4 and 6 are built. The Eye's bonus to another member's burst, Constellation 2's DEF
// Ignored, the Musou Isshin plunges and the skill's particles are not, as no kit reaches another kit's pricing, a hit's
// DEF ignored, a stance's plunges or a particle a skill makes
export const createRaidenKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackMultiplier = (index: number) =>
    getTalentMultiplier(talentMultiplierMap, RAIDEN_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
  const skillMultiplier = (index: number) =>
    getTalentMultiplier(talentMultiplierMap, RAIDEN_SKILL_GROUP_ID, TALENT_START_LEVEL, index);
  const burstMultiplier = (index: number) =>
    getTalentMultiplier(talentMultiplierMap, RAIDEN_BURST_GROUP_ID, TALENT_START_LEVEL, index);
  const burstEnergyCost = burstMultiplier(19);
  const resolveStackGain = burstMultiplier(3);
  const eyeSeconds = skillMultiplier(2);
  const eyeBurstDamageBonus = skillMultiplier(3) * burstEnergyCost;
  const resolveAttackBonus = burstMultiplier(2);
  const restoreEnergy = burstMultiplier(16);
  const musouIsshinSeconds = burstMultiplier(17);
  // The Eye's coordinated attack, which sets off no other
  const coordinatedAttackHit: KitHit = {
    element: Element.Electro,
    gauge: 1,
    hitArea: COORDINATED_ATTACK_HIT_AREA,
    hitmarkSeconds: COORDINATED_ATTACK_HITMARK_FRAMES / 60,
    internalCooldownTag: InternalCooldownTag.ElementalSkill,
    poiseDamage: UNMEASURED_POISE_DAMAGE,
    talentMultiplier: skillMultiplier(1),
  };
  const skillHit: KitHit = {
    element: Element.Electro,
    gauge: 1,
    hitArea: SKILL_HIT_AREA,
    hitmarkSeconds: SKILL_HITMARK_FRAMES / 60,
    poiseDamage: UNMEASURED_POISE_DAMAGE,
    talentMultiplier: skillMultiplier(0),
  };
  // Musou Isshin's strikes and charged attack, each multiplier raised by the Resolve stacks the burst spent and each DMG
  // Bonus the Eye's, if she held it as she cast
  const createMusouIsshinActions = (
    stacks: number,
    damageBonus: number,
  ): Pick<KitStance["actions"], "chargedAttack" | "chargedAttackStamina" | "normalAttacks"> => {
    const createHit = (hitArea: AttackArea, hitmarkFrames: number, index: number): KitHit => ({
      damageBonus,
      element: Element.Electro,
      gauge: 1,
      hitArea,
      hitmarkSeconds: hitmarkFrames / 60,
      internalCooldownTag: InternalCooldownTag.NormalAttack,
      poiseDamage: UNMEASURED_POISE_DAMAGE,
      talentMultiplier: burstMultiplier(index) + resolveAttackBonus * stacks,
    });
    return {
      chargedAttack: {
        hits: MUSOU_ISSHIN_CHARGED_HITS.map(({ hitmarkFrames, index }) =>
          createHit(MUSOU_ISSHIN_CHARGED_HIT_AREA, hitmarkFrames, index),
        ),
        seconds: MUSOU_ISSHIN_CHARGED_FRAMES / 60,
        targetingArea: STRIKE_TARGETING_AREA,
      },
      chargedAttackStamina: burstMultiplier(12),
      normalAttacks: MUSOU_ISSHIN_STRIKES.map(({ animationFrames, hits }) => ({
        hits: hits.map(({ hitArea, hitmarkFrames, index }) => createHit(hitArea, hitmarkFrames, index)),
        seconds: animationFrames / 60,
        targetingArea: STRIKE_TARGETING_AREA,
      })),
    };
  };
  const normalAttacks: KitAction[] = NORMAL_ATTACKS.map(({ animationFrames, hitArea, hits }) => ({
    hits: hits.map(({ hitmarkFrames, index }) => ({
      hitArea,
      hitmarkSeconds: hitmarkFrames / 60,
      poiseDamage: UNMEASURED_POISE_DAMAGE,
      talentMultiplier: attackMultiplier(index),
    })),
    seconds: animationFrames / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  }));
  return {
    burstCooldownSeconds: burstMultiplier(18),
    burstEnergyCost,
    chargedAttack: {
      hits: [
        {
          hitArea: CHARGED_ATTACK_HIT_AREA,
          hitmarkSeconds: CHARGED_ATTACK_HITMARK_FRAMES / 60,
          poiseDamage: UNMEASURED_POISE_DAMAGE,
          talentMultiplier: attackMultiplier(6),
        },
      ],
      seconds: CHARGED_ATTACK_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    chargedAttackStamina: attackMultiplier(7),
    // The burst spends Resolve's stacks as it is cast, where gcsim spends them at the hit 98 frames on, Musou no Hitotachi
    // Landing from a summon at the body, and takes the Musou Isshin stance, whose skill and burst stay the kit's own
    elementalBurst: {
      hits: [],
      onStart: ({ body, combatant, kitEffectState }) => {
        const { characterId, kit } = combatant;
        const stacks = countStatusStacks(kitEffectState.effects, characterId, RESOLVE_STATUS_ID);
        kitEffectState.effects = kitEffectState.effects.filter(
          (effect) =>
            !(
              effect.kind === "status" &&
              effect.characterId === characterId &&
              (effect.id === RESOLVE_STATUS_ID || effect.id === RESTORE_COUNT_ID)
            ),
        );
        const damageBonus = checkHasEye(kitEffectState.effects, characterId) ? eyeBurstDamageBonus : 0;
        addKitEffect(
          kitEffectState,
          createKitSummon(body, combatant, [
            {
              damageBonus,
              element: Element.Electro,
              gauge: 2,
              hitArea: BURST_HIT_AREA,
              hitmarkSeconds: BURST_HITMARK_FRAMES / 60,
              poiseDamage: UNMEASURED_POISE_DAMAGE,
              talentMultiplier: burstMultiplier(0) + burstMultiplier(1) * stacks,
            },
          ]),
        );
        addKitEffect(kitEffectState, {
          actions: {
            ...createMusouIsshinActions(stacks, damageBonus),
            elementalBurst: kit.elementalBurst,
            elementalSkill: kit.elementalSkill,
          },
          characterId,
          elapsedSeconds: 0,
          kind: "stance",
          secondsRemaining: BURST_HITMARK_FRAMES / 60 + musouIsshinSeconds,
        });
      },
      seconds: BURST_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    // The skill's hit lands from a summon at the body, and the Eye reaches every member of the deployed team from a field
    // Whose one tick gives it
    elementalSkill: {
      hits: [],
      onStart: ({ body, combatant, kitEffectState }) => {
        addKitEffect(kitEffectState, createKitSummon(body, combatant, [skillHit]));
        addKitEffect(kitEffectState, {
          centre: { x: body.position.x, z: body.position.z },
          characterId: combatant.characterId,
          id: EYE_PENDING_FIELD_ID,
          kind: "field",
          nextTickSeconds: EYE_DELAY_FRAMES / 60,
          onTick: ({ kitEffectState: tickEffectState, party }) => {
            for (const characterId of party.teams[party.deployedTeamIndex]?.characterIds ?? [])
              addKitEffect(tickEffectState, {
                characterId,
                id: EYE_STATUS_ID,
                kind: "status",
                secondsRemaining: eyeSeconds,
              });
          },
          radius: UNBOUNDED_FIELD_RADIUS,
          // The field lives a tenth of a second past its tick, so the step that runs it still has it
          secondsRemaining: EYE_DELAY_FRAMES / 60 + 0.1,
          tickIndex: 0,
          tickIntervalSeconds: Number.POSITIVE_INFINITY,
        });
      },
      seconds: SKILL_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    getPassiveBonuses,
    highPlunge: {
      hits: [
        {
          hitArea: HIGH_PLUNGE_HIT_AREA,
          hitmarkSeconds: HIGH_PLUNGE_HITMARK_FRAMES / 60,
          isBlunt: true,
          poiseDamage: HIGH_PLUNGE_POISE_DAMAGE,
          talentMultiplier: attackMultiplier(10),
        },
      ],
      seconds: HIGH_PLUNGE_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    lowPlunge: {
      hits: [
        {
          hitArea: LOW_PLUNGE_HIT_AREA,
          hitmarkSeconds: LOW_PLUNGE_HITMARK_FRAMES / 60,
          isBlunt: true,
          poiseDamage: LOW_PLUNGE_POISE_DAMAGE,
          talentMultiplier: attackMultiplier(9),
        },
      ],
      seconds: LOW_PLUNGE_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    normalAttacks,
    // Another member's burst gives her Resolve, and from Ascension 1 the party's particles and orbs give her 2 stacks
    // Once every 3 seconds. Musou Isshin ends as she leaves the field, and its end gives the rest of the team
    // Constellation 4's ATK. A Musou Isshin attack that lands restores the team's energy, and from Constellation 6 cuts
    // The others' burst cooldowns, once a second and five times a cast, as gcsim's two callbacks keep the same interval
    // And count. A member holding the Eye who deals damage sets off its coordinated attack on the enemy struck
    onKitEvent: (event, { characterIdCombatantMap, combatant, kitEffectState, party }) => {
      const { ascension, characterId, constellationCount } = combatant;
      const musouIsshin = findMusouIsshin(kitEffectState.effects, characterId);
      if (event.kind === KitEventKind.CharacterSwapped) {
        if (event.previousCharacterId === characterId && musouIsshin) musouIsshin.secondsRemaining = 0;
        return;
      }

      if (event.kind === KitEventKind.BurstUsed) {
        if (event.characterId === characterId) return;
        const isElectro = characterIdCombatantMap.get(event.characterId)?.element === Element.Electro;
        const multiplier =
          constellationCount < CONSTELLATION_1
            ? 1
            : isElectro
              ? CONSTELLATION_1_ELECTRO_RESOLVE_MULTIPLIER
              : CONSTELLATION_1_RESOLVE_MULTIPLIER;
        gainResolve(kitEffectState, characterId, resolveStackGain * event.energyCost * multiplier);
        return;
      }

      if (event.kind === KitEventKind.EnergyParticleCollected) {
        if (ascension < ASCENSION_1 || checkHasKitStatus(kitEffectState.effects, characterId, ASCENSION_1_ICD_ID))
          return;
        addKitEffect(kitEffectState, {
          characterId,
          id: ASCENSION_1_ICD_ID,
          kind: "status",
          secondsRemaining: ASCENSION_1_ICD_SECONDS,
        });
        gainResolve(kitEffectState, characterId, ASCENSION_1_RESOLVE_STACKS);
        return;
      }

      const memberIds = party.teams[party.deployedTeamIndex]?.characterIds ?? [];
      const otherMemberIds = memberIds.filter((memberId) => memberId !== characterId);
      if (event.kind === KitEventKind.EffectExpired) {
        const { effect } = event;
        if (effect.kind !== "stance" || effect.characterId !== characterId || constellationCount < CONSTELLATION_4)
          return;
        for (const memberId of otherMemberIds) {
          const member = characterIdCombatantMap.get(memberId);
          if (member)
            addKitEffect(kitEffectState, {
              amount: CONSTELLATION_4_ATTACK_SHARE * member.attributes.attributeTotalMap[Attribute.BaseAttack],
              attribute: Attribute.Attack,
              characterId: memberId,
              kind: "buff",
              secondsRemaining: CONSTELLATION_4_SECONDS,
              source: CONSTELLATION_4_SOURCE,
            });
        }
        return;
      }

      if (event.kind !== KitEventKind.DamageTaken) return;
      const { enemy, hit, striker } = event;
      const restoreCount = countStatusStacks(kitEffectState.effects, characterId, RESTORE_COUNT_ID);
      if (
        musouIsshin &&
        striker.characterId === characterId &&
        [...musouIsshin.actions.normalAttacks, musouIsshin.actions.chargedAttack].some(({ hits }) =>
          hits.includes(hit),
        ) &&
        restoreCount < RESTORE_MAX_COUNT &&
        !checkHasKitStatus(kitEffectState.effects, characterId, RESTORE_ICD_ID)
      ) {
        addKitEffect(kitEffectState, {
          characterId,
          id: RESTORE_ICD_ID,
          kind: "status",
          secondsRemaining: RESTORE_ICD_SECONDS,
        });
        // The count lasts as long as the stance, so the next cast starts its own
        addKitEffect(kitEffectState, {
          characterId,
          id: RESTORE_COUNT_ID,
          kind: "status",
          secondsRemaining: musouIsshin.secondsRemaining,
          stacks: restoreCount + 1,
        });
        // Ascension 4 raises the energy by each whole 1% of her Energy Recharge past 100%
        const excessEnergyRecharge = Math.max(combatant.attributes.attributeTotalMap[Attribute.EnergyRecharge] - 1, 0);
        const energy =
          restoreEnergy *
          (1 +
            (ascension >= ASCENSION_4
              ? Math.floor(excessEnergyRecharge * 100) * ASCENSION_4_RESTORE_BONUS_PER_PERCENT
              : 0));
        // A fallen member gains none, as it has lost its energy
        for (const memberId of memberIds) {
          const member = characterIdCombatantMap.get(memberId);
          if (member && !checkIsCharacterDown(party, memberId)) gainPartyMemberEnergy(party, member, energy);
        }
        if (constellationCount >= CONSTELLATION_6)
          for (const memberId of otherMemberIds) {
            const partyMember = getPartyMember(party, memberId);
            partyMember.burstCooldownSeconds = Math.max(
              partyMember.burstCooldownSeconds - CONSTELLATION_6_COOLDOWN_SECONDS,
              0,
            );
          }
      }
      // A hit of no multiplier deals no damage of its own, and the coordinated attack sets off no other
      if (
        hit === coordinatedAttackHit ||
        hit.talentMultiplier === 0 ||
        checkHasKitStatus(kitEffectState.effects, characterId, COORDINATED_ATTACK_ICD_ID) ||
        !checkHasKitStatus(kitEffectState.effects, striker.characterId, EYE_STATUS_ID)
      )
        return;
      addKitEffect(kitEffectState, {
        characterId,
        id: COORDINATED_ATTACK_ICD_ID,
        kind: "status",
        secondsRemaining: COORDINATED_ATTACK_ICD_SECONDS,
      });
      addKitEffect(
        kitEffectState,
        createKitSummon({ facing: 0, height: 0, position: enemy.position }, combatant, [coordinatedAttackHit]),
      );
    },
    plungeCollision: {
      hitArea: PLUNGE_COLLISION_HIT_AREA,
      hitmarkSeconds: 0,
      poiseDamage: UNMEASURED_POISE_DAMAGE,
      talentMultiplier: attackMultiplier(8),
    },
    skillCooldownSeconds: skillMultiplier(4),
  };
};
