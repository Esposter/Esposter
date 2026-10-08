import type { Party } from "#src/models/party/Party";

// Whether a character is down: its HP gone, as the game's "Character is down" refuses it
export const checkIsCharacterDown = (party: Party, characterId: number): boolean =>
  party.characterIdMemberMap.get(characterId)?.healthShare === 0;
