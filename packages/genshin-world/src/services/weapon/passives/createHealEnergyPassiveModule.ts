import type { KitHealthChangedEvent } from "#src/models/kit/KitHealthChangedEvent";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";
import { takeOne } from "@esposter/shared";

// A passive that restores the rank's Energy to its wielder for each heal its predicate counts, at most once every cooldown the
// Rank gives in seconds, whether or not the wielder is on the field. A heal is a gain of HP with a share, and the predicate
// Names which heals count, the wielder's own healed or the heals the wielder performs
export const createHealEnergyPassiveModule = (
  params: number[],
  {
    checkIsCounted,
    cooldownId,
  }: { checkIsCounted: (event: KitHealthChangedEvent, characterId: number) => boolean; cooldownId: string },
): PassiveModule => {
  const energy = takeOne(params, 0);
  const cooldownSeconds = takeOne(params, 1);
  return {
    onKitEvent: (event, context, combatant) => {
      if (
        event.kind !== KitEventKind.HealthChanged ||
        event.healthShare <= 0 ||
        !checkIsCounted(event, combatant.characterId) ||
        !startKitCooldown(context.kitEffectState, combatant.characterId, cooldownId, cooldownSeconds)
      )
        return;
      gainPartyMemberEnergy(context.party, combatant, energy);
    },
  };
};
