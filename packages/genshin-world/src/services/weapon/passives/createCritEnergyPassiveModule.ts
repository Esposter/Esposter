import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";
import { takeOne } from "@esposter/shared";

const CRIT_ENERGY_COOLDOWN_ID = "critEnergyCooldown";
// The energy a proc regenerates for the wielder, as the passive's text gives it
const CRIT_ENERGY = 6;

// Windfall at its rank: a CRIT hit its wielder deals has the rank's chance of regenerating energy for the wielder, and a
// Proc holds off the next for the rank's cooldown in seconds
export const createCritEnergyPassiveModule = (params: number[]): WeaponPassiveModule => {
  const chance = takeOne(params, 0);
  const cooldownSeconds = takeOne(params, 1);
  return {
    onKitEvent: (event, context, combatant) => {
      if (
        event.kind !== KitEventKind.DamageTaken ||
        event.striker.characterId !== combatant.characterId ||
        !event.isCritical ||
        checkIsKitStatusActive(context.kitEffectState.effects, combatant.characterId, CRIT_ENERGY_COOLDOWN_ID) ||
        context.random() >= chance
      )
        return;
      addKitStatus(context.kitEffectState, combatant.characterId, {
        id: CRIT_ENERGY_COOLDOWN_ID,
        secondsRemaining: cooldownSeconds,
      });
      gainPartyMemberEnergy(context.party, combatant, CRIT_ENERGY);
    },
  };
};
