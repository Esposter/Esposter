import { getCharacterPackFileUrl } from "#src/services/character/getCharacterPackFileUrl";
import { getCharacterPackHash } from "#src/services/character/getCharacterPackHash";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A file of a character's pack, by its path in the pack, under the hash the lock names the pack by. Its URL never
// Changes what it serves, so the browser's own cache answers every read after the first. A character no pack is
// Published for is refused before any request, so no absent file is ever asked for
export const readCharacterPackFile = async (
  characterPackBaseUrl: string,
  characterId: number,
  path: string,
  timeoutMs: number,
): Promise<Response> => {
  const packHash = getCharacterPackHash(characterId);
  if (packHash === undefined)
    throw new InvalidOperationError(Operation.Read, String(characterId), "has no character pack published");
  const url = getCharacterPackFileUrl(characterPackBaseUrl, characterId, packHash, path);
  const response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
  if (!response.ok)
    throw new InvalidOperationError(Operation.Read, url, `HTTP ${response.status} ${response.statusText}`);
  return response;
};
