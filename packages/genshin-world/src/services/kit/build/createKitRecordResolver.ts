import type { TalentLevelMap } from "#src/models/character/TalentLevelMap";
import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitActionRecord } from "#src/models/kit/record/KitActionRecord";
import type { KitHitRecord } from "#src/models/kit/record/KitHitRecord";
import type { KitParameter } from "#src/models/kit/record/KitParameter";
import type { KitRecord } from "#src/models/kit/record/KitRecord";

import { Attribute } from "#src/models/character/Attribute";
import { KitPlunge } from "#src/models/kit/record/KitPlunge";
import { KitTargeting } from "#src/models/kit/record/KitTargeting";
import { MISSING_KIT_BEHAVIOUR_ID } from "#src/services/kit/build/constants";
import { missingKitBehaviour } from "#src/services/kit/build/missingKitBehaviour";
import { SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA } from "#src/services/kit/constants";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";
import { toKitSeconds } from "#src/services/kit/toKitSeconds";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The field of a striker's attributes each stat a hit scales with is read from, its total where none holds it
const ScalingAttributeFieldMap: Partial<Record<Attribute, "attack" | "defense" | "maxHealth">> = {
  [Attribute.Attack]: "attack",
  [Attribute.Defense]: "defense",
  [Attribute.Health]: "maxHealth",
};

const KitTargetingAreaMap = {
  [KitTargeting.Skill]: SKILL_TARGETING_AREA,
  [KitTargeting.Strike]: STRIKE_TARGETING_AREA,
} as const satisfies Record<KitTargeting, KitAction["targetingArea"]>;

const getScalingStat = (attribute: Attribute, { attributes }: Combatant): number => {
  const field = ScalingAttributeFieldMap[attribute];
  return field === undefined ? attributes.attributeTotalMap[attribute] : attributes[field];
};

// A hit's stat other than ATK, where its multiplier is a share of one that is no Lunar hit's
const getAdditiveScalingAttribute = ({ lunarReactionType, scalingAttribute }: Partial<KitHitRecord>) =>
  lunarReactionType === undefined ? scalingAttribute : undefined;

// Resolves the values of a kit's record into its kit's, given the character's multipliers and the level each of its
// Talents plays at: a parameter read off its talent's table at that level, a count of frames divided into seconds, a
// Targeting zone as its area, and a hit scaling with a stat other than ATK as that share of the stat, its talent
// Multiplier nought. What a behaviour completes, a party heal's chance, an omen's id and a stacked hit's status, is left
// Missing for it to give
export const createKitRecordResolver = (talentMultiplierMap: TalentMultiplierMap, talentLevelMap: TalentLevelMap) => {
  const toParameter = (parameter: KitParameter): number => {
    if (typeof parameter === "number") return parameter;
    const { index, proudSkillGroupId } = parameter;
    const level = talentLevelMap[proudSkillGroupId];
    if (level === undefined)
      throw new InvalidOperationError(Operation.Read, `${proudSkillGroupId}`, "is not a talent of its kit");
    return getTalentMultiplier(talentMultiplierMap, proudSkillGroupId, level, index);
  };
  const toHitFields = (hitRecord: Partial<KitHitRecord>): Partial<KitHit> => {
    const { bubble, healParty, lunarReactionType, multiplier, scalingAttribute, stackedHit } = hitRecord;
    const additiveScalingAttribute = getAdditiveScalingAttribute(hitRecord);
    const multiplierValue = multiplier === undefined ? undefined : toParameter(multiplier);
    return {
      ...(additiveScalingAttribute !== undefined &&
        multiplierValue !== undefined && {
          additiveBaseDamageBonus: (combatant: Combatant) =>
            multiplierValue * getScalingStat(additiveScalingAttribute, combatant),
        }),
      ...(hitRecord.attackTag && { attackTag: hitRecord.attackTag }),
      ...(bubble && {
        bubble: {
          explosion: toHit(bubble.explosion),
          omen: {
            damageTakenBonus: toParameter(bubble.omen.damageTakenBonus),
            id: MISSING_KIT_BEHAVIOUR_ID,
            secondsRemaining: toParameter(bubble.omen.secondsRemaining),
          },
          secondsRemaining: toParameter(bubble.secondsRemaining),
        },
      }),
      ...(hitRecord.convertedArea && { convertedHitArea: hitRecord.convertedArea }),
      ...(hitRecord.convertedPoiseDamage !== undefined && { convertedPoiseDamage: hitRecord.convertedPoiseDamage }),
      ...(hitRecord.damageBonus !== undefined && { damageBonus: toParameter(hitRecord.damageBonus) }),
      ...(hitRecord.element !== undefined && { element: hitRecord.element }),
      ...(hitRecord.gauge !== undefined && { gauge: hitRecord.gauge }),
      ...(healParty && {
        healParty: {
          ...(healParty.attackShare !== undefined && { attackShare: toParameter(healParty.attackShare) }),
          chance: missingKitBehaviour,
          defenseShare: toParameter(healParty.defenseShare),
          flatHealth: toParameter(healParty.flatHealth),
          ...(healParty.isUnshielded && { isUnshielded: true }),
          ...(healParty.maxHealthShare !== undefined && { maxHealthShare: toParameter(healParty.maxHealthShare) }),
        },
      }),
      ...(hitRecord.area && { hitArea: hitRecord.area }),
      ...(hitRecord.hitmarkFrames !== undefined && { hitmarkSeconds: toKitSeconds(hitRecord.hitmarkFrames) }),
      ...(hitRecord.internalCooldownTag && { internalCooldownTag: hitRecord.internalCooldownTag }),
      ...(hitRecord.isBlunt && { isBlunt: true }),
      ...(lunarReactionType !== undefined && {
        lunarHit: {
          ...(scalingAttribute !== undefined && {
            getScalingStat: (combatant: Combatant) => getScalingStat(scalingAttribute, combatant),
          }),
          lunarReactionType,
        },
      }),
      ...(hitRecord.poiseDamage !== undefined && { poiseDamage: hitRecord.poiseDamage }),
      ...(stackedHit && {
        stackedHit: {
          poiseDamages: stackedHit.poiseDamages,
          statusId: MISSING_KIT_BEHAVIOUR_ID,
          talentMultipliers: stackedHit.multipliers.map((stackMultiplier) => toParameter(stackMultiplier)),
        },
      }),
      ...(multiplierValue !== undefined && {
        talentMultiplier: additiveScalingAttribute === undefined ? multiplierValue : 0,
      }),
    };
  };
  const toHit = (hitRecord: KitHitRecord): KitHit => ({
    ...toHitFields(hitRecord),
    hitArea: hitRecord.area,
    hitmarkSeconds: toKitSeconds(hitRecord.hitmarkFrames),
    poiseDamage: hitRecord.poiseDamage,
    talentMultiplier: getAdditiveScalingAttribute(hitRecord) === undefined ? toParameter(hitRecord.multiplier) : 0,
  });
  const toAction = ({ animationFrames, hits, isAimed, staminaPerSecond, targeting }: KitActionRecord): KitAction => ({
    hits: hits.map((hitRecord) => toHit(hitRecord)),
    ...(isAimed && { isAimed }),
    seconds: toKitSeconds(animationFrames),
    ...(staminaPerSecond !== undefined && { staminaPerSecond: toParameter(staminaPerSecond) }),
    targetingArea: KitTargetingAreaMap[targeting],
  });
  // The kit its record's slots build, each variant's check missing until its behaviour gives it
  const toKit = (record: KitRecord): Kit => ({
    burstCooldownSeconds: toParameter(record.burstCooldownSeconds),
    burstEnergyCost:
      record.burstEnergyCost === undefined ? Number.POSITIVE_INFINITY : toParameter(record.burstEnergyCost),
    chargedAttack: toAction(record.chargedAttack),
    chargedAttackStamina: toParameter(record.chargedAttackStamina),
    elementalBurst: toAction(record.burst),
    ...(record.burstVariant && {
      elementalBurstVariant: { action: toAction(record.burstVariant), checkIsActive: missingKitBehaviour },
    }),
    elementalSkill: toAction(record.skill),
    ...(record.skillChain && {
      elementalSkillChain: {
        followUps: record.skillChain.followUps.map((actionRecord) => toAction(actionRecord)),
        windowSeconds: record.skillChain.windowSeconds,
      },
    }),
    ...(record.skillCharges !== undefined && { elementalSkillCharges: toParameter(record.skillCharges) }),
    ...(record.skillHolds.length > 0 && {
      elementalSkillHolds: record.skillHolds.map(({ action, cooldownSeconds, minimumHeldSeconds, variant }) => ({
        action: toAction(action),
        cooldownSeconds: toParameter(cooldownSeconds),
        minimumHeldSeconds,
        ...(variant && { variant: { action: toAction(variant), checkIsActive: missingKitBehaviour } }),
      })),
    }),
    ...(record.skillMaximumHeldSeconds !== undefined && {
      elementalSkillMaximumHeldSeconds: toParameter(record.skillMaximumHeldSeconds),
    }),
    highPlunge: toAction(record.plunges[KitPlunge.High]),
    lowPlunge: toAction(record.plunges[KitPlunge.Low]),
    ...(record.moonsignBenediction && {
      moonsignBenediction: { lunarReactionTypes: record.moonsignBenediction.lunarReactionTypes },
    }),
    normalAttacks: record.normalAttacks.map((actionRecord) => toAction(actionRecord)),
    plungeCollision: toHit(record.plungeCollision),
    skillCooldownSeconds: toParameter(record.skillCooldownSeconds),
    ...(record.stellarJubilee && {
      stellarJubilee: { stellarReactionTypes: record.stellarJubilee.stellarReactionTypes },
    }),
  });
  return { toAction, toHit, toHitFields, toKit, toParameter };
};
