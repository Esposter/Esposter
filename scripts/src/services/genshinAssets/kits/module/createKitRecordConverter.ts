import type { KitRecordConverter } from "#src/models/genshinAssets/kits/module/KitRecordConverter";
import type {
  AttackArea,
  Element,
  Kit,
  KitAction,
  KitActionRecord,
  KitHit,
  KitHitRecord,
  KitParameter,
  TalentMultiplierMap,
} from "genshin-world";

import { KIT_FRAMES_PER_SECOND } from "#src/services/genshinAssets/kits/constants";
import { decodeKitParameter } from "#src/services/genshinAssets/kits/module/decodeKitParameter";
import { probeKitScaling } from "#src/services/genshinAssets/kits/module/probeKitScaling";
import { InvalidOperationError, Operation } from "@esposter/shared";
import {
  Attribute,
  getTalentMultiplier,
  KitTargeting,
  SKILL_TARGETING_AREA,
  STRIKE_TARGETING_AREA,
  TALENT_START_LEVEL,
} from "genshin-world";

const toArea = ({ angle, height, radius }: AttackArea): AttackArea => ({ angle, height, radius });

const checkIsSameArea = (firstArea: AttackArea, secondArea: AttackArea): boolean =>
  firstArea.angle === secondArea.angle &&
  firstArea.height === secondArea.height &&
  firstArea.radius === secondArea.radius;

const toTargeting = (area: AttackArea): KitTargeting => {
  if (checkIsSameArea(area, STRIKE_TARGETING_AREA)) return KitTargeting.Strike;
  else if (checkIsSameArea(area, SKILL_TARGETING_AREA)) return KitTargeting.Skill;
  throw new InvalidOperationError(
    Operation.Read,
    toTargeting.name,
    `no targeting zone is the area ${JSON.stringify(area)}`,
  );
};

// Seconds as frames, whole where the seconds were whole frames, as every module writes them
const toFrames = (seconds: number): number => {
  const frames = Math.round(seconds * KIT_FRAMES_PER_SECOND);
  return frames / KIT_FRAMES_PER_SECOND === seconds ? frames : seconds * KIT_FRAMES_PER_SECOND;
};

// Converts a kit module's values to its record's, given the kit built from the character's own multipliers and its twin
// Built from encoded ones: each value read from a table as its group and index, where it equals that parameter at the
// First level, and any other as its number; each second count as frames; each hit's element as it deals it; and a
// Hit's flat damage from one stat of its striker as its multiplier of that stat, where it has no talent multiplier
export const createKitRecordConverter = (
  kit: Kit,
  characterId: number,
  element: Element | undefined,
  talentMultiplierMap: TalentMultiplierMap,
): KitRecordConverter => {
  const toParameter = (value: number, encodedValue: unknown): KitParameter => {
    const parameter = decodeKitParameter(encodedValue);
    return parameter !== undefined &&
      talentMultiplierMap[parameter.proudSkillGroupId] !== undefined &&
      getTalentMultiplier(talentMultiplierMap, parameter.proudSkillGroupId, TALENT_START_LEVEL, parameter.index) ===
        value
      ? parameter
      : value;
  };
  const toHitFields = (hit: Partial<KitHit>, encodedHit: Partial<KitHit> | undefined): Partial<KitHitRecord> => {
    const scaling =
      hit.additiveBaseDamageBonus !== undefined && hit.talentMultiplier === 0 && hit.lunarHit === undefined
        ? probeKitScaling(kit, characterId, hit.additiveBaseDamageBonus)
        : undefined;
    const encodedScaling =
      scaling === undefined || encodedHit?.additiveBaseDamageBonus === undefined
        ? undefined
        : probeKitScaling(kit, characterId, encodedHit.additiveBaseDamageBonus);
    const lunarScaling =
      hit.lunarHit?.getScalingStat === undefined
        ? undefined
        : probeKitScaling(kit, characterId, hit.lunarHit.getScalingStat);
    const scalingAttribute = (scaling ?? lunarScaling)?.attribute;
    const { bubble, healParty, stackedHit } = hit;
    return {
      ...(hit.hitArea && { area: toArea(hit.hitArea) }),
      ...(hit.attackTag && { attackTag: hit.attackTag }),
      ...(bubble && {
        bubble: {
          explosion: toHit(bubble.explosion, encodedHit?.bubble?.explosion),
          omen: {
            damageTakenBonus: toParameter(bubble.omen.damageTakenBonus, encodedHit?.bubble?.omen.damageTakenBonus),
            secondsRemaining: toParameter(bubble.omen.secondsRemaining, encodedHit?.bubble?.omen.secondsRemaining),
          },
          secondsRemaining: toParameter(bubble.secondsRemaining, encodedHit?.bubble?.secondsRemaining),
        },
      }),
      ...(hit.convertedHitArea && { convertedArea: toArea(hit.convertedHitArea) }),
      ...(hit.convertedPoiseDamage !== undefined && { convertedPoiseDamage: hit.convertedPoiseDamage }),
      ...(hit.damageBonus !== undefined && { damageBonus: toParameter(hit.damageBonus, encodedHit?.damageBonus) }),
      ...(hit.element !== undefined && { element: hit.element }),
      ...(hit.gauge !== undefined && { gauge: hit.gauge }),
      ...(healParty && {
        healParty: {
          ...(healParty.attackShare !== undefined && {
            attackShare: toParameter(healParty.attackShare, encodedHit?.healParty?.attackShare),
          }),
          defenseShare: toParameter(healParty.defenseShare, encodedHit?.healParty?.defenseShare),
          flatHealth: toParameter(healParty.flatHealth, encodedHit?.healParty?.flatHealth),
          ...(healParty.isUnshielded && { isUnshielded: true }),
          ...(healParty.maxHealthShare !== undefined && {
            maxHealthShare: toParameter(healParty.maxHealthShare, encodedHit?.healParty?.maxHealthShare),
          }),
        },
      }),
      ...(hit.hitmarkSeconds !== undefined && { hitmarkFrames: toFrames(hit.hitmarkSeconds) }),
      ...(hit.internalCooldownTag && { internalCooldownTag: hit.internalCooldownTag }),
      ...(hit.isBlunt && { isBlunt: true }),
      ...(hit.lunarHit && { lunarReactionType: hit.lunarHit.lunarReactionType }),
      ...(scaling === undefined
        ? hit.talentMultiplier !== undefined && {
            multiplier: toParameter(hit.talentMultiplier, encodedHit?.talentMultiplier),
          }
        : { multiplier: toParameter(scaling.share, encodedScaling?.share) }),
      ...(hit.poiseDamage !== undefined && { poiseDamage: hit.poiseDamage }),
      ...(scalingAttribute !== undefined && scalingAttribute !== Attribute.Attack && { scalingAttribute }),
      ...(stackedHit && {
        stackedHit: {
          multipliers: stackedHit.talentMultipliers.map((multiplier, index) =>
            toParameter(multiplier, encodedHit?.stackedHit?.talentMultipliers[index]),
          ),
          poiseDamages: stackedHit.poiseDamages,
        },
      }),
    };
  };
  // A whole hit, dealing its character's element where it has a gauge and names no element of its own
  const toHit = (hit: KitHit, encodedHit: KitHit | undefined): KitHitRecord => {
    const hitFields = toHitFields(hit, encodedHit);
    const hitElement = hit.element ?? (hit.gauge === undefined ? undefined : element);
    return {
      ...hitFields,
      area: toArea(hit.hitArea),
      ...(hitElement !== undefined && { element: hitElement }),
      hitmarkFrames: toFrames(hit.hitmarkSeconds),
      multiplier: hitFields.multiplier ?? toParameter(hit.talentMultiplier, encodedHit?.talentMultiplier),
      poiseDamage: hit.poiseDamage,
    };
  };
  const toActionFields = (
    action: Partial<KitAction>,
    encodedAction: Partial<KitAction> | undefined,
  ): Partial<KitActionRecord> => ({
    ...(action.seconds !== undefined && { animationFrames: toFrames(action.seconds) }),
    ...(action.hits && { hits: action.hits.map((hit, index) => toHit(hit, encodedAction?.hits?.[index])) }),
    ...(action.isAimed && { isAimed: true }),
    ...(action.staminaPerSecond !== undefined && {
      staminaPerSecond: toParameter(action.staminaPerSecond, encodedAction?.staminaPerSecond),
    }),
    ...(action.targetingArea && { targeting: toTargeting(action.targetingArea) }),
  });
  const toAction = (action: KitAction, encodedAction: KitAction | undefined): KitActionRecord => ({
    ...toActionFields(action, encodedAction),
    animationFrames: toFrames(action.seconds),
    hits: action.hits.map((hit, index) => toHit(hit, encodedAction?.hits[index])),
    targeting: toTargeting(action.targetingArea),
  });
  return { toAction, toActionFields, toArea, toFrames, toHit, toHitFields, toParameter };
};
