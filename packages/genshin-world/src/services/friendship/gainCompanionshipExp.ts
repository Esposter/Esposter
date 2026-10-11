import type { Character } from "#src/models/character/Character";
import type { FriendshipLevel } from "#src/models/friendship/FriendshipLevel";
import type { Party } from "#src/models/party/Party";

import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";

// Gives `exp` Companionship EXP whole to each character of the deployed team but the Traveler, a fallen one included.
// The total never passes the top Friendship Level's EXP, so a character already there gains nothing
export const gainCompanionshipExp = (
  characters: readonly Character[],
  party: Party,
  exp: number,
  friendshipLevels: readonly FriendshipLevel[],
): Character[] => {
  const deployedCharacterIds = getDeployedCharacterIds(party);
  const maxExp = Math.max(...friendshipLevels.map(({ exp: levelExp }) => levelExp));
  return characters.map((character) =>
    deployedCharacterIds.includes(character.id) && character.id !== TRAVELER_CHARACTER_ID
      ? { ...character, friendshipExp: Math.min(character.friendshipExp + exp, maxExp) }
      : character,
  );
};
