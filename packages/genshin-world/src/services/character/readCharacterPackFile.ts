import { fetchCharacterPackResponse } from "#src/services/character/fetchCharacterPackResponse";
import { getCharacterPackFileUrl } from "#src/services/character/getCharacterPackFileUrl";

// A file of a character's pack, by its path in the pack, from the host the world is given, none where the host answers
// That its pack holds no such file. Only a character the host's index lists is read, so no file the world knows is
// Absent is ever asked for, and any other failure rejects
export const readCharacterPackFile = (
  characterPackBaseUrl: string,
  characterId: number,
  path: string,
  timeoutMs: number,
): Promise<Response | undefined> =>
  fetchCharacterPackResponse(getCharacterPackFileUrl(characterPackBaseUrl, characterId, path), timeoutMs, 404);
