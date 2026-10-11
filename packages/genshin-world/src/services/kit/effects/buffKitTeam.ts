import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { Party } from "#src/models/party/Party";

import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";

// Gives every member of the deployed team the same buff, each its own, as gcsim adds a mod to each character
export const buffKitTeam = (
  kitEffectState: KitEffectState,
  party: Party,
  buff: Parameters<typeof buffKitMember>[2],
): void => {
  for (const characterId of getDeployedCharacterIds(party)) buffKitMember(kitEffectState, characterId, buff);
};
