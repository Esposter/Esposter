import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBuff } from "#src/models/kit/KitBuff";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { takeOne } from "@esposter/shared";

const ENERGY_RECHARGE_BASE = 1;
const ETERNAL_STOVE_SOURCE = "eternalStove";

// The wielder's Energy Recharge as the pricing reads it: its attributes, with the Energy Recharge buffs on it added
const getEnergyRecharge = (combatant: Combatant, effects: readonly KitEffect[]): number => {
  const energyRechargeBuffs = effects.filter(
    (effect): effect is KitBuff =>
      effect.kind === "buff" &&
      effect.characterId === combatant.characterId &&
      effect.attribute === Attribute.EnergyRecharge,
  );
  return (
    combatant.attributes.attributeTotalMap[Attribute.EnergyRecharge] +
    energyRechargeBuffs.reduce((total, { amount }) => total + amount, 0)
  );
};

// Timeless Dream: Eternal Stove at its rank: the wielder's ATK rises by the rank's percentage for each point of Energy Recharge
// Over its base, up to the rank's maximum, and an Elemental Burst gives it the rank's Energy Recharge for the rank's seconds
export const createTimelessDreamEternalStovePassiveModule = (params: number[]): WeaponPassiveModule => {
  const attackPerEnergyRecharge = takeOne(params, 0);
  const maximumAttack = takeOne(params, 1);
  const energyRecharge = takeOne(params, 2);
  const seconds = takeOne(params, 3);
  return {
    getPassiveBonuses: (combatant, _healthShare, _deployedCombatants, effects) => [
      {
        amount: Math.min(
          Math.max(getEnergyRecharge(combatant, effects) - ENERGY_RECHARGE_BASE, 0) * attackPerEnergyRecharge,
          maximumAttack,
        ),
        attribute: Attribute.AttackPercent,
      },
    ],
    onKitEvent: (event, { kitEffectState }, combatant) => {
      if (event.kind !== KitEventKind.BurstUsed || event.characterId !== combatant.characterId) return;
      buffKitMember(kitEffectState, combatant.characterId, {
        amount: energyRecharge,
        attribute: Attribute.EnergyRecharge,
        secondsRemaining: seconds,
        source: ETERNAL_STOVE_SOURCE,
      });
    },
  };
};
