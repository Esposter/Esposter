import type {
  AttackArea,
  Element,
  Kit,
  KitAction,
  KitActionRecord,
  KitHit,
  KitHitRecord,
  KitHoldRecord,
  KitParameter,
  KitRecord,
  TalentMultiplierMap,
} from "genshin-world";

import { decodeKitParameter } from "#src/services/genshinAssets/kits/module/decodeKitParameter";
import { InvalidOperationError, Operation } from "@esposter/shared";
import {
  getTalentMultiplier,
  KitPlunge,
  KitTargeting,
  SKILL_TARGETING_AREA,
  STRIKE_TARGETING_AREA,
  TALENT_START_LEVEL,
} from "genshin-world";

const toArea = ({ angle, height, radius }: AttackArea): AttackArea => ({ angle, height, radius });

const checkIsSameArea = (left: AttackArea, right: AttackArea): boolean =>
  left.angle === right.angle && left.height === right.height && left.radius === right.radius;

const toTargeting = (area: AttackArea): KitTargeting => {
  if (checkIsSameArea(area, STRIKE_TARGETING_AREA)) return KitTargeting.Strike;
  else if (checkIsSameArea(area, SKILL_TARGETING_AREA)) return KitTargeting.Skill;
  throw new InvalidOperationError(
    Operation.Read,
    toTargeting.name,
    `no targeting zone is the area ${JSON.stringify(area)}`,
  );
};

// Seconds as frames at 60 a second, whole where the seconds were whole frames, as every module writes them
const toFrames = (seconds: number): number => {
  const frames = Math.round(seconds * 60);
  return frames / 60 === seconds ? frames : seconds * 60;
};

// A kit module's values as the record that would reproduce them: each action's seconds as frames, each hit's element as
// It deals it, none for a physical hit, and each value read from a table as its group and index. The kit is built
// Twice, once from the character's own multipliers and once from encoded ones, so a value equal to a table's parameter
// In both builds is known to read it, and any other keeps its number, as does a value the encoded build has no twin for
// Where a parameter sizes the kit, as a hold count
export const toModuleKitRecord = (
  kit: Kit,
  encodedKit: Kit,
  element: Element | undefined,
  talentMultiplierMap: TalentMultiplierMap,
): KitRecord => {
  const toParameter = (value: number, encodedValue: number | undefined): KitParameter => {
    const parameter = decodeKitParameter(encodedValue);
    if (
      parameter === undefined ||
      talentMultiplierMap[parameter.proudSkillGroupId] === undefined ||
      getTalentMultiplier(talentMultiplierMap, parameter.proudSkillGroupId, TALENT_START_LEVEL, parameter.index) !==
        value
    )
      return value;
    return parameter;
  };
  const toOptionalParameter = (value: number | undefined, encodedValue: number | undefined) =>
    value === undefined ? undefined : toParameter(value, encodedValue);
  const toHit = (hit: KitHit, encodedHit: KitHit | undefined): KitHitRecord => ({
    area: toArea(hit.hitArea),
    ...(hit.convertedHitArea && { convertedArea: toArea(hit.convertedHitArea) }),
    ...(hit.convertedPoiseDamage !== undefined && { convertedPoiseDamage: hit.convertedPoiseDamage }),
    ...((hit.element ?? (hit.gauge === undefined ? undefined : element)) !== undefined && {
      element: hit.element ?? element,
    }),
    ...(hit.gauge !== undefined && { gauge: hit.gauge }),
    hitmarkFrames: toFrames(hit.hitmarkSeconds),
    ...(hit.internalCooldownTag && { internalCooldownTag: hit.internalCooldownTag }),
    ...(hit.isBlunt && { isBlunt: true }),
    multiplier: toParameter(hit.talentMultiplier, encodedHit?.talentMultiplier),
    poiseDamage: hit.poiseDamage,
  });
  const toAction = (action: KitAction, encodedAction: KitAction | undefined): KitActionRecord => {
    const staminaPerSecond = toOptionalParameter(action.staminaPerSecond, encodedAction?.staminaPerSecond);
    return {
      cancelFrames: toFrames(action.seconds),
      hits: action.hits.map((hit, index) => toHit(hit, encodedAction?.hits[index])),
      ...(action.isAimed && { isAimed: true }),
      ...(staminaPerSecond !== undefined && { staminaPerSecond }),
      targeting: toTargeting(action.targetingArea),
    };
  };
  const skillCharges = toOptionalParameter(kit.elementalSkillCharges, encodedKit.elementalSkillCharges);
  const skillMaximumHeldSeconds = toOptionalParameter(
    kit.elementalSkillMaximumHeldSeconds,
    encodedKit.elementalSkillMaximumHeldSeconds,
  );
  return {
    burst: toAction(kit.elementalBurst, encodedKit.elementalBurst),
    burstCooldownSeconds: toParameter(kit.burstCooldownSeconds, encodedKit.burstCooldownSeconds),
    ...(Number.isFinite(kit.burstEnergyCost) && {
      burstEnergyCost: toParameter(kit.burstEnergyCost, encodedKit.burstEnergyCost),
    }),
    ...(kit.elementalBurstVariant && {
      burstVariant: toAction(kit.elementalBurstVariant.action, encodedKit.elementalBurstVariant?.action),
    }),
    chargedAttack: toAction(kit.chargedAttack, encodedKit.chargedAttack),
    chargedAttackStamina: toParameter(kit.chargedAttackStamina, encodedKit.chargedAttackStamina),
    normalAttacks: kit.normalAttacks.map((action, index) => toAction(action, encodedKit.normalAttacks[index])),
    plungeCollision: toHit(kit.plungeCollision, encodedKit.plungeCollision),
    plunges: {
      [KitPlunge.High]: toAction(kit.highPlunge, encodedKit.highPlunge),
      [KitPlunge.Low]: toAction(kit.lowPlunge, encodedKit.lowPlunge),
    },
    skill: toAction(kit.elementalSkill, encodedKit.elementalSkill),
    ...(kit.elementalSkillChain && {
      skillChain: {
        followUps: kit.elementalSkillChain.followUps.map((action, index) =>
          toAction(action, encodedKit.elementalSkillChain?.followUps[index]),
        ),
        windowSeconds: kit.elementalSkillChain.windowSeconds,
      },
    }),
    ...(skillCharges !== undefined && { skillCharges }),
    skillCooldownSeconds: toParameter(kit.skillCooldownSeconds, encodedKit.skillCooldownSeconds),
    skillHolds: (kit.elementalSkillHolds ?? []).map((hold, index) => {
      const encodedHold = encodedKit.elementalSkillHolds?.[index];
      const holdRecord: KitHoldRecord = {
        action: toAction(hold.action, encodedHold?.action),
        cooldownSeconds: toParameter(hold.cooldownSeconds, encodedHold?.cooldownSeconds),
        minimumHeldSeconds: hold.minimumHeldSeconds,
      };
      if (hold.variant) holdRecord.variant = toAction(hold.variant.action, encodedHold?.variant?.action);
      return holdRecord;
    }),
    ...(skillMaximumHeldSeconds !== undefined && { skillMaximumHeldSeconds }),
  };
};
