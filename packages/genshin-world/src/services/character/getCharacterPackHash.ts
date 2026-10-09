import { getCharacterPackKey } from "#src/services/character/getCharacterPackKey";
import { gameDataLock } from "#src/services/data/gameDataLock";

// The hash of a character's pack as the lock names it, which its files are stored under, so a republished pack is a new
// Folder and nothing a browser cached of the last one is ever stale; undefined while no pack of the character is published
export const getCharacterPackHash = (characterId: number): string | undefined =>
  gameDataLock.objects[getCharacterPackKey(characterId)];
