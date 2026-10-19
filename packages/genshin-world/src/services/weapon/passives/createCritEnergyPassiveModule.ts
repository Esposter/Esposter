import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";
import { rollPassiveCooldownProc } from "#src/services/weapon/passives/rollPassiveCooldownProc";
import { takeOne } from "@esposter/shared";

const CRIT_ENERGY_COOLDOWN_ID = "critEnergyCooldown";
// The energy a proc regenerates for the wielder, as the passive's text gives it
const CRIT_ENERGY = 6;

// Windfall at its rank: a CRIT hit its wielder deals has the rank's chance of regenerating energy for the wielder, and
// A proc holds off the next for the rank's cooldown in seconds
export const createCritEnergyPassiveModule = (params: number[]): PassiveModule => {
  const chance = takeOne(params, 0);
  const cooldownSeconds = takeOne(params, 1);
  return {
    onKitEvent: (event, context, combatant) => {
      if (
        event.kind !== KitEventKind.DamageTaken ||
        event.striker.characterId !== combatant.characterId ||
        !event.isCritical
      )
        return;
      if (!rollPassiveCooldownProc(context, combatant, CRIT_ENERGY_COOLDOWN_ID, chance, cooldownSeconds)) return;
      gainPartyMemberEnergy(context.party, combatant, CRIT_ENERGY);
    },
  };
};
