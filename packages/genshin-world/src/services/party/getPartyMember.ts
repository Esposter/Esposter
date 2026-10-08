import type { Party } from "#src/models/party/Party";
import type { PartyMember } from "#src/models/party/PartyMember";

import { InvalidOperationError, Operation } from "@esposter/shared";

// A character's own state in the party, which every character a team holds has
export const getPartyMember = (party: Party, characterId: number): PartyMember => {
  const partyMember = party.characterIdMemberMap.get(characterId);
  if (!partyMember) throw new InvalidOperationError(Operation.Read, getPartyMember.name, `character ${characterId}`);
  return partyMember;
};
