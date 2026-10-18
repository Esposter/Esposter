import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";
import { takeOne } from "@esposter/shared";

const TIP_OF_THE_SPEAR_COOLDOWN_ID = "tipOfTheSpearCooldown";

// Tip of the Spear, Rightful Reward's passive at its rank: after its wielder is healed, it restores the rank's Energy to the
// Wielder, at most once every cooldown the rank gives in seconds, whether or not the wielder is on the field
export const createTipOfTheSpearPassiveModule = (params: number[]): WeaponPassiveModule => {
  const energy = takeOne(params, 0);
  const cooldownSeconds = takeOne(params, 1);
  return {
    onKitEvent: (event, context, combatant) => {
      if (
        event.kind !== KitEventKind.HealthChanged ||
        event.characterId !== combatant.characterId ||
        event.healthShare <= 0 ||
        checkIsKitStatusActive(context.kitEffectState.effects, combatant.characterId, TIP_OF_THE_SPEAR_COOLDOWN_ID)
      )
        return;
      addKitStatus(context.kitEffectState, combatant.characterId, {
        id: TIP_OF_THE_SPEAR_COOLDOWN_ID,
        secondsRemaining: cooldownSeconds,
      });
      gainPartyMemberEnergy(context.party, combatant, energy);
    },
  };
};
