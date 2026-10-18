import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";
import { takeOne } from "@esposter/shared";

const TIP_OF_THE_SPEAR_COOLDOWN_ID = "tipOfTheSpearCooldown";

// Tip of the Spear, Rightful Reward's passive at its rank: after its wielder is healed, it restores the rank's Energy to the
// Wielder, at most once every cooldown the rank gives in seconds, whether or not the wielder is on the field
export const createTipOfTheSpearPassiveModule = (params: number[]): PassiveModule => {
  const energy = takeOne(params, 0);
  const cooldownSeconds = takeOne(params, 1);
  return {
    onKitEvent: (event, context, combatant) => {
      if (
        event.kind !== KitEventKind.HealthChanged ||
        event.characterId !== combatant.characterId ||
        event.healthShare <= 0 ||
        !startKitCooldown(context.kitEffectState, combatant.characterId, TIP_OF_THE_SPEAR_COOLDOWN_ID, cooldownSeconds)
      )
        return;
      gainPartyMemberEnergy(context.party, combatant, energy);
    },
  };
};
