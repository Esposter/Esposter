import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";
import { createCooldownProcPassiveModule } from "#src/services/weapon/passives/createCooldownProcPassiveModule";

const CRIT_ENERGY_COOLDOWN_ID = "critEnergyCooldown";
// The energy a proc regenerates for the wielder, as the passive's text gives it
const CRIT_ENERGY = 6;

// Windfall at its rank: a CRIT hit its wielder deals has the rank's chance of regenerating energy for the wielder, and
// A proc holds off the next for the rank's cooldown in seconds
export const createCritEnergyPassiveModule = (params: number[]): PassiveModule =>
  createCooldownProcPassiveModule(
    params,
    CRIT_ENERGY_COOLDOWN_ID,
    (event, combatant) =>
      event.kind === KitEventKind.DamageTaken &&
      event.striker.characterId === combatant.characterId &&
      event.isCritical,
    (context, combatant) => {
      gainPartyMemberEnergy(context.party, combatant, CRIT_ENERGY);
    },
  );
