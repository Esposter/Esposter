import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { StellarReactionType } from "#src/models/combat/StellarReactionType";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addPassiveStack } from "#src/services/kit/effects/addPassiveStack";
import { countKitStatusStacks } from "#src/services/kit/effects/countKitStatusStacks";
import { takeOne } from "@esposter/shared";

const GOLDEN_BLOOD_TIDE_ID = "goldenBloodTide";
const GOLDEN_BLOOD_TIDE_MAXIMUM_STACKS = 3;

// Golden Blood-Tide (Cashflow Supervision) at its rank: its ATK is static, and each stack of its wielder's own HP
// Change, once every cooldown the rank gives, raises its Normal Attack DMG, Charged Attack DMG and Stellar-Conduct DMG
// For the rank's seconds, up to three stacks, and with three of them its ATK SPD rises as well. The rank's first number
// Is both its ATK and its Normal attack DMG per stack, as the text gives both at 16%
export const createGoldenBloodTidePassiveModule = (params: number[]): PassiveModule => {
  const attackPercent = takeOne(params, 2);
  const seconds = takeOne(params, 0);
  const cooldownSeconds = takeOne(params, 1);
  const chargedAttackDamage = takeOne(params, 3);
  const attackSpeed = takeOne(params, 4);
  const stellarConductDamage = takeOne(params, 5);
  return {
    getPartyReactionBonus: ({ characterId }, { combatant, reactionType }, { kitEffectState }) =>
      combatant.characterId === characterId && reactionType === StellarReactionType.StellarConduct
        ? {
            damageBonus:
              stellarConductDamage * countKitStatusStacks(kitEffectState.effects, characterId, GOLDEN_BLOOD_TIDE_ID),
          }
        : {},
    getPassiveBonuses: () => [{ amount: attackPercent, attribute: Attribute.AttackPercent }],
    onKitEvent: (event, { kitEffectState }, { characterId }) => {
      if (event.kind !== KitEventKind.HealthChanged || event.characterId !== characterId || event.healthShare === 0)
        return;
      addPassiveStack(kitEffectState, characterId, {
        cooldownSeconds,
        id: GOLDEN_BLOOD_TIDE_ID,
        maximumBonuses: [{ amount: attackSpeed, attribute: Attribute.NormalAttackSpeed }],
        maximumStacks: GOLDEN_BLOOD_TIDE_MAXIMUM_STACKS,
        perStackBonuses: [
          { amount: attackPercent, attribute: Attribute.NormalAttackDamageBonus },
          { amount: chargedAttackDamage, attribute: Attribute.ChargedAttackDamageBonus },
        ],
        seconds,
      });
    },
  };
};
