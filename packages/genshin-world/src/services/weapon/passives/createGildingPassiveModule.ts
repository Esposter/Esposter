import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { changeKitMemberHealth } from "#src/services/kit/effects/changeKitMemberHealth";
import { scheduleKitTask } from "#src/services/kit/effects/scheduleKitTask";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";
import { takeOne } from "@esposter/shared";

// Gilding at its rank: after its wielder uses a burst, on each interval for the seconds given it regenerates energy to the
// Wielder and a share of Max HP to each member of the deployed team
export const createGildingPassiveModule = (params: number[]): WeaponPassiveModule => {
  const seconds = takeOne(params, 0);
  const intervalSeconds = takeOne(params, 1);
  const energy = takeOne(params, 2);
  const healthShare = takeOne(params, 3);
  return {
    onKitEvent: (event, { kitEffectState }, combatant) => {
      if (event.kind !== KitEventKind.BurstUsed || event.characterId !== combatant.characterId) return;
      for (let tick = 1; tick * intervalSeconds <= seconds; tick++)
        scheduleKitTask(kitEffectState, combatant.characterId, tick * intervalSeconds, (context) => {
          const wielder = context.characterIdCombatantMap.get(combatant.characterId);
          if (!wielder) return;
          gainPartyMemberEnergy(context.party, wielder, energy);
          for (const characterId of getDeployedCharacterIds(context.party)) {
            const member = context.characterIdCombatantMap.get(characterId);
            if (member) changeKitMemberHealth(context, wielder, characterId, member.attributes.maxHealth * healthShare);
          }
        });
    },
  };
};
