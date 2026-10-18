import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEvent } from "#src/models/kit/KitEvent";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";

// Gives a character the energy its delay under the id holds, when the event is that delay running out
export const collectDelayedKitEnergy = (
  event: KitEvent,
  context: KitContext,
  combatant: Combatant,
  id: string,
): void => {
  if (
    event.kind !== KitEventKind.EffectExpired ||
    event.effect.kind !== "status" ||
    event.effect.characterId !== combatant.characterId ||
    event.effect.id !== id
  )
    return;
  gainPartyMemberEnergy(context.party, combatant, event.effect.stacks ?? 0);
};
