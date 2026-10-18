import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";

import { changeKitMemberHealth } from "#src/services/kit/effects/changeKitMemberHealth";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";

// The same heal given each member of the deployed team, each priced by the source's Healing Bonus and its own Incoming
// Healing Bonus as changeKitMemberHealth prices it, as gcsim's heal of every character (Target -1) is
export const changeKitTeamHealth = (context: KitContext, source: Combatant, health: number): void => {
  for (const characterId of getDeployedCharacterIds(context.party))
    changeKitMemberHealth(context, source, characterId, health);
};
