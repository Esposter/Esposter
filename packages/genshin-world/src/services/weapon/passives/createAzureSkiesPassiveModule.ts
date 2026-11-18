import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { checkIsNormalOrChargedAttack } from "#src/services/kit/checkIsNormalOrChargedAttack";
import { addPassiveStack } from "#src/services/kit/effects/addPassiveStack";
import { takeOne } from "@esposter/shared";

const AZURE_SKIES_ID = "azureSkies";
const AZURE_SKIES_MAXIMUM_STACKS = 3;

// Azure Skies at its rank: a normal or charged attack hit its wielder deals adds a stack, raising its Normal Attack DMG and
// Charged Attack DMG by the rank's amounts per stack for its seconds, up to three stacks, a stack at most once every cooldown
export const createAzureSkiesPassiveModule = (params: number[]): PassiveModule => {
  const seconds = takeOne(params, 0);
  const cooldownSeconds = takeOne(params, 1);
  const normalAttackDamageBonus = takeOne(params, 2);
  const chargedAttackDamageBonus = takeOne(params, 3);
  return {
    onKitEvent: (event, { kitEffectState }, combatant) => {
      if (
        event.kind !== KitEventKind.DamageTaken ||
        event.striker.characterId !== combatant.characterId ||
        !checkIsNormalOrChargedAttack(event.attackTag)
      )
        return;
      addPassiveStack(kitEffectState, combatant.characterId, {
        cooldownSeconds,
        id: AZURE_SKIES_ID,
        maximumStacks: AZURE_SKIES_MAXIMUM_STACKS,
        perStackBonuses: [
          { amount: normalAttackDamageBonus, attribute: Attribute.NormalAttackDamageBonus },
          { amount: chargedAttackDamageBonus, attribute: Attribute.ChargedAttackDamageBonus },
        ],
        seconds,
      });
    },
  };
};
