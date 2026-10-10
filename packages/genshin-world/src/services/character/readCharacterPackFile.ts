import { getCharacterPackFileUrl } from "#src/services/character/getCharacterPackFileUrl";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A file of a character's pack, by its path in the pack, from the host the world is given. Only a character the host's
// Index lists is read, so no file the world knows is absent is ever asked for
export const readCharacterPackFile = async (
  characterPackBaseUrl: string,
  characterId: number,
  path: string,
  timeoutMs: number,
): Promise<Response> => {
  const url = getCharacterPackFileUrl(characterPackBaseUrl, characterId, path);
  const response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
  if (!response.ok)
    throw new InvalidOperationError(Operation.Read, url, `HTTP ${response.status} ${response.statusText}`);
  return response;
};
