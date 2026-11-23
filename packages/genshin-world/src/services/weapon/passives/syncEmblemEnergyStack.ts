import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { Party } from "#src/models/party/Party";

import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { endKitStatus } from "#src/services/kit/effects/endKitStatus";
import { getPartyMember } from "#src/services/party/getPartyMember";

// Holds an Emblem's stack for as long as its wielder's Energy is short of its burst's cost, and ends it once the Energy
// Is Full, run on each step as the Emblem's stacks are counted. The stack is a status of the id's energy, not a hold,
// So it Has no seconds of its own
export const syncEmblemEnergyStack = (
  kitEffectState: KitEffectState,
  party: Party,
  { characterId, kit }: Combatant,
  id: string,
): void => {
  const energyId = `${id}Energy`;
  if (getPartyMember(party, characterId).energy >= kit.burstEnergyCost)
    endKitStatus(kitEffectState, characterId, energyId);
  else if (!checkIsKitStatusActive(kitEffectState.effects, characterId, energyId))
    addKitStatus(kitEffectState, characterId, { id: energyId, secondsRemaining: Number.POSITIVE_INFINITY });
};
