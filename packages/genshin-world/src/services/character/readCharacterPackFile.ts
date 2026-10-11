import { getCharacterPackFileUrl } from "#src/services/character/getCharacterPackFileUrl";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A file of a character's pack, by its path in the pack, from the host the world is given, none where the host answers
// That its pack holds no such file. Only a character the host's index lists is read, so no file the world knows is
// Absent is ever asked for, and any other failure rejects
export const readCharacterPackFile = async (
  characterPackBaseUrl: string,
  characterId: number,
  path: string,
  timeoutMs: number,
): Promise<Response | undefined> => {
  const url = getCharacterPackFileUrl(characterPackBaseUrl, characterId, path);
  const response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
  if (response.status === 404) return undefined;
  else if (!response.ok)
    throw new InvalidOperationError(Operation.Read, url, `HTTP ${response.status} ${response.statusText}`);
  return response;
};
