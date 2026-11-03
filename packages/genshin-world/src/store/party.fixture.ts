import type { Character } from "#src/models/character/Character";
import type { Kit } from "#src/models/kit/Kit";
import type { Party } from "#src/models/party/Party";

import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createParty } from "#src/services/party/createParty";
import { replaceWorldParty } from "#src/services/party/createWorldParty";
import { useWorldPartyStore } from "#src/store/party";

// The party store holding exactly this roster, for a suite that tests a feature reading it. Called after the session is
// Started, since that makes the Pinia it holds them in, and again it replaces them
export const startTestWorldParty = ({
  characterIdKitMap = new Map(),
  characters = [],
  party = createParty([TRAVELER_CHARACTER_ID]),
}: { characterIdKitMap?: ReadonlyMap<number, Kit>; characters?: Character[]; party?: Party } = {}) => {
  const worldPartyStore = useWorldPartyStore();
  worldPartyStore.characterIdKitMap = characterIdKitMap;
  worldPartyStore.characters = characters;
  replaceWorldParty(worldPartyStore.party, party);
  return worldPartyStore;
};
