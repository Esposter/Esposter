import type { KitEffect } from "#src/models/kit/KitEffect";
import type { Party } from "#src/models/party/Party";

import { PartySwitchResult } from "#src/models/party/PartySwitchResult";
import { checkIsKitSwapBlocked } from "#src/services/kit/effects/checkIsKitSwapBlocked";
import { checkIsCharacterDown } from "#src/services/party/checkIsCharacterDown";
import { PARTY_SWITCH_COOLDOWN_SECONDS } from "#src/services/party/constants";
import { getActiveCharacterId } from "#src/services/party/getActiveCharacterId";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";

// Puts the deployed team's member at this index on the field, as its key does at these seconds on the world's clock:
// Nothing for the member already there or an empty slot, refused while the fall of the member on the field plays, refused
// For a character who is down, refused while the swap lock on the member on the field holds, and refused until the
// Cooldown since the last switch has passed
export const switchPartyMember = (
  party: Party,
  index: number,
  seconds: number,
  effects: readonly KitEffect[],
): PartySwitchResult => {
  const characterId = getDeployedCharacterIds(party)[index];
  if (characterId === undefined || index === party.activeIndex) return PartySwitchResult.Unchanged;
  else if (party.fallSecondsRemaining > 0) return PartySwitchResult.Falling;
  else if (checkIsCharacterDown(party, characterId)) return PartySwitchResult.Down;
  else if (checkIsKitSwapBlocked(effects, getActiveCharacterId(party))) return PartySwitchResult.Blocked;
  else if (seconds - party.switchedSeconds < PARTY_SWITCH_COOLDOWN_SECONDS) return PartySwitchResult.Cooldown;
  party.activeIndex = index;
  party.switchedSeconds = seconds;
  return PartySwitchResult.Switched;
};
