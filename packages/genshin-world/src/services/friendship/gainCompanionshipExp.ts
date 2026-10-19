import type { Character } from "#src/models/character/Character";
import type { FriendshipLevels } from "#src/models/friendship/FriendshipLevels";

import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";

// Gives `exp` Companionship EXP whole to each of the characters named but the Traveler, a fallen one included. The total
// Never passes the top Friendship Level's EXP, so a character already there gains nothing
export const gainCompanionshipExp = (
  characters: readonly Character[],
  characterIds: readonly number[],
  exp: number,
  friendshipLevels: FriendshipLevels,
): Character[] => {
  const maxExp = Math.max(...friendshipLevels.map(({ exp: levelExp }) => levelExp));
  return characters.map((character) =>
    characterIds.includes(character.id) && character.id !== TRAVELER_CHARACTER_ID
      ? { ...character, friendshipExp: Math.min(character.friendshipExp + exp, maxExp) }
      : character,
  );
};
