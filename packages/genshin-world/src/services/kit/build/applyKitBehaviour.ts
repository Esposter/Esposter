import type { Kit } from "#src/models/kit/Kit";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitVariant } from "#src/models/kit/KitVariant";
import type { KitVariantBehaviour } from "#src/models/kit/KitVariantBehaviour";

import { KitPlunge } from "#src/models/kit/record/KitPlunge";
import { applyKitActionBehaviour } from "#src/services/kit/build/applyKitActionBehaviour";
import { applyKitHitBehaviour } from "#src/services/kit/build/applyKitHitBehaviour";
import { missingKitBehaviour } from "#src/services/kit/build/missingKitBehaviour";
import { InvalidOperationError, Operation } from "@esposter/shared";

const checkHasCount = (path: string, behaviourCount: number, count: number) => {
  if (behaviourCount > count) throw new InvalidOperationError(Operation.Update, path, `its record holds ${count}`);
};

const applyKitVariantBehaviour = (
  variant: KitVariant | undefined,
  behaviour: KitVariantBehaviour | undefined,
  path: string,
) => {
  if (!variant) {
    if (behaviour) throw new InvalidOperationError(Operation.Update, path, "its record holds no variant");
    return;
  }
  if (behaviour) variant.checkIsActive = behaviour.checkIsActive;
  if (variant.checkIsActive === missingKitBehaviour)
    throw new InvalidOperationError(Operation.Update, path, "its behaviour gives no check");
  applyKitActionBehaviour(variant.action, behaviour, `${path}.action`);
};

// A kit its record's slots built given its behaviour, in place: the kit's own functions, and each action's and hit's
// Behaviour, every action checked complete whether its behaviour names it or not. It fails where the behaviour names an
// Action, a hit or a variant the record does not hold
export const applyKitBehaviour = (kit: Kit, behaviour: KitBehaviour): Kit => {
  const {
    burst,
    burstVariant,
    chargedAttack,
    getChargedAttackStaminaMultiplier,
    getNormalAttackExtraHit,
    getNormalAttackSpeedBonus,
    getPassiveBonuses,
    getSkillChargeBonus,
    getSkillCooldownMultiplier,
    getStrikeCriticalRateBonus,
    getStrikeDamageBonus,
    moonsignBenediction,
    normalAttacks = [],
    onKitEvent,
    onSprint,
    plungeCollision = {},
    plunges = {},
    skill,
    skillChain = [],
    skillHolds = [],
  } = behaviour;
  if (getChargedAttackStaminaMultiplier) kit.getChargedAttackStaminaMultiplier = getChargedAttackStaminaMultiplier;
  if (getNormalAttackExtraHit) kit.getNormalAttackExtraHit = getNormalAttackExtraHit;
  if (getNormalAttackSpeedBonus) kit.getNormalAttackSpeedBonus = getNormalAttackSpeedBonus;
  if (getPassiveBonuses) kit.getPassiveBonuses = getPassiveBonuses;
  if (getSkillChargeBonus) kit.getSkillChargeBonus = getSkillChargeBonus;
  if (getSkillCooldownMultiplier) kit.getSkillCooldownMultiplier = getSkillCooldownMultiplier;
  if (getStrikeCriticalRateBonus) kit.getStrikeCriticalRateBonus = getStrikeCriticalRateBonus;
  if (getStrikeDamageBonus) kit.getStrikeDamageBonus = getStrikeDamageBonus;
  if (onKitEvent) kit.onKitEvent = onKitEvent;
  if (onSprint) kit.onSprint = onSprint;
  if (moonsignBenediction?.getBaseDamageBonus) {
    if (!kit.moonsignBenediction)
      throw new InvalidOperationError(Operation.Update, "moonsignBenediction", "its record holds none");
    kit.moonsignBenediction.getBaseDamageBonus = moonsignBenediction.getBaseDamageBonus;
  }
  applyKitActionBehaviour(kit.elementalBurst, burst, "burst");
  applyKitVariantBehaviour(kit.elementalBurstVariant, burstVariant, "burstVariant");
  applyKitActionBehaviour(kit.chargedAttack, chargedAttack, "chargedAttack");
  checkHasCount("normalAttacks", normalAttacks.length, kit.normalAttacks.length);
  for (const [index, action] of kit.normalAttacks.entries())
    applyKitActionBehaviour(action, normalAttacks[index], `normalAttacks.${index}`);
  applyKitHitBehaviour(kit.plungeCollision, plungeCollision, "plungeCollision");
  applyKitActionBehaviour(kit.highPlunge, plunges[KitPlunge.High], `plunges.${KitPlunge.High}`);
  applyKitActionBehaviour(kit.lowPlunge, plunges[KitPlunge.Low], `plunges.${KitPlunge.Low}`);
  applyKitActionBehaviour(kit.elementalSkill, skill, "skill");
  const followUps = kit.elementalSkillChain?.followUps ?? [];
  checkHasCount("skillChain", skillChain.length, followUps.length);
  for (const [index, action] of followUps.entries())
    applyKitActionBehaviour(action, skillChain[index], `skillChain.${index}`);
  const holds = kit.elementalSkillHolds ?? [];
  checkHasCount("skillHolds", skillHolds.length, holds.length);
  for (const [index, hold] of holds.entries()) {
    const holdBehaviour = skillHolds[index];
    applyKitActionBehaviour(hold.action, holdBehaviour, `skillHolds.${index}`);
    applyKitVariantBehaviour(hold.variant, holdBehaviour?.variant, `skillHolds.${index}.variant`);
  }
  return kit;
};
