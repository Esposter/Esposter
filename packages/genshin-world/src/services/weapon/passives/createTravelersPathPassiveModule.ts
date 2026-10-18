import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";
import { takeOne } from "@esposter/shared";

const TRAVELERS_PATH_ID = "travelersPath";
const TRAVELERS_PATH_COOLDOWN_ID = "travelersPathCooldown";

// Traveler's Path at its rank, while the Traveler wields it: a hit it deals raises its ATK by the rank's amount for the rank's
// Seconds and regenerates the rank's Energy to it, once every cooldown, whether or not it is on the field
export const createTravelersPathPassiveModule = (params: number[]): WeaponPassiveModule => {
  const attackBonus = takeOne(params, 0);
  const seconds = takeOne(params, 1);
  const energy = takeOne(params, 3);
  const cooldownSeconds = takeOne(params, 4);
  return {
    onKitEvent: (event, { kitEffectState, party }, combatant) => {
      if (
        event.kind !== KitEventKind.DamageTaken ||
        event.striker.characterId !== combatant.characterId ||
        combatant.characterId !== TRAVELER_CHARACTER_ID ||
        checkIsKitStatusActive(kitEffectState.effects, combatant.characterId, TRAVELERS_PATH_COOLDOWN_ID)
      )
        return;
      addKitStatus(kitEffectState, combatant.characterId, {
        id: TRAVELERS_PATH_COOLDOWN_ID,
        secondsRemaining: cooldownSeconds,
      });
      buffKitMember(kitEffectState, combatant.characterId, {
        amount: attackBonus,
        attribute: Attribute.AttackPercent,
        secondsRemaining: seconds,
        source: TRAVELERS_PATH_ID,
      });
      gainPartyMemberEnergy(party, combatant, energy);
    },
  };
};
